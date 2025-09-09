import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaPlay, FaMicrophone, FaMicrophoneSlash, FaRedo } from "react-icons/fa";
import Header from "./Header";

export default function GodAct6() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [eventsAnswers, setEventsAnswers] = useState(['', '', '']);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [interactionStage, setInteractionStage] = useState('voice');
  const [isQuestionFinished, setIsQuestionFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const VOICE_ID = 'pqHfZKP75CvOlQylNhV4';

  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // --- FAILSAFE BUTTON HANDLER - RELOADS THE ENTIRE PAGE ---
  const handleFailsafeRestart = () => {
    // Stop any ongoing audio/speech
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    SpeechRecognition.stopListening();
    
    // Reload the entire page to reset everything
    window.location.reload();
  };

  // --- FUNCTION TO START SESSION ---
  const startSession = () => {
    resetTranscript();

    if (!browserSupportsSpeechRecognition) {
      alert("This browser doesn't support speech recognition.");
      return;
    }

    const questionAudio = new Audio('/choose.mp3');

    const timer = setTimeout(() => {
      questionAudio.play().catch(() => console.warn("Audio autoplay blocked."));
    }, 500);

    questionAudio.onended = () => {
      console.log("DEBUG: Question audio finished.");
      setIsQuestionFinished(true);
    };

    return () => {
      clearTimeout(timer);
      questionAudio.pause();
      SpeechRecognition.stopListening();
    };
  };

  // --- AUTO START ON PAGE LOAD (PRIMARY ACTIVATION METHOD) ---
  useEffect(() => {
    const cleanup = startSession();
    return cleanup;
  }, []);

  // Effect 2: Starts listening after the question is finished
  useEffect(() => {
    if (isQuestionFinished && !listening && interactionStage === 'voice') {
      console.log("DEBUG: Conditions met. Starting to listen for Q6 answer...");
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });

      // Timeout to automatically stop listening after 10 seconds for this longer question.
      const stopListeningTimeout = setTimeout(() => {
        if (SpeechRecognition.browserSupportsSpeechRecognition()) {
           console.log("DEBUG: 10 second timer elapsed. Stopping listening.");
           SpeechRecognition.stopListening();
        }
      }, 10000); 

      return () => {
        clearTimeout(stopListeningTimeout);
      };
    }
  }, [isQuestionFinished, listening, interactionStage]);

  // Effect 3: Auto-submits the answer
  useEffect(() => {
      if (finalTranscript && !isLoading) {
        const capitalizedAnswer = finalTranscript.charAt(0).toUpperCase() + finalTranscript.slice(1);
        console.log("DEBUG: Original transcript received:", capitalizedAnswer);
        submitAnswer(capitalizedAnswer, 'voice');
      }
    }, [finalTranscript, isLoading]);

  // --- AUDIO & HELPER FUNCTIONS ---
  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentUtterance(null);
    setIsSpeaking(false);
  };

  const speakWithElevenLabs = async (text, onEndCallback = () => { }) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.6, similarity_boost: 0.7 }
        })
      });

      if (!response.ok) throw new Error(`ElevenLabs API error: ${response.status}`);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
        onEndCallback();
      };

      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      speakWithBrowserSynthesis(text, {}, onEndCallback);
    }
  };

  const speakWithBrowserSynthesis = (text, options = {}, onEndCallback = () => { }) => {
    const utterance = new SpeechSynthesisUtterance(text);
    setCurrentUtterance(utterance);

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
      onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakText = (text, onEndCallback = () => { }) => {
    if (!voiceEnabled || !text) {
      onEndCallback();
      return;
    }
    stopSpeaking();
    setIsSpeaking(true);

    if (ELEVENLABS_API_KEY) {
      speakWithElevenLabs(text, onEndCallback);
      console.log("Attempting to use ElevenLabs for speech synthesis...");
    } else {
      console.log("ElevenLabs API key not found. Using browser's native speech synthesis.");
      speakWithBrowserSynthesis(text, {}, onEndCallback);
    }
  };

  const renderHighlightedText = (text, misspelled_words) => {
    if (!misspelled_words || !Array.isArray(misspelled_words) || misspelled_words.length === 0) {
      return text;
    }
    const regex = new RegExp(`(${misspelled_words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      misspelled_words.some(word => word.toLowerCase() === part.toLowerCase())
        ? <span key={index} style={{ backgroundColor: '#FFD700', borderRadius: '3px' }}>{part}</span>
        : part
    );
  };

  // --- DYNAMIC SUBMIT ANSWER FUNCTION ---
  const submitAnswer = async (answer, submissionType) => {
    SpeechRecognition.stopListening();
    setIsLoading(true);
    if (submissionType === 'text') setFeedback(null);

    try {
      // Backend for Q6 expects a single string for voice, and an array of strings for text
      const bodyPayload = submissionType === 'text'
        ? { answers: answer }
        : { answer: answer.trim() };

      const response = await fetch('http://localhost:8000/api/check-question6/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || data.message || 'An unknown error occurred.');
      }

      if (submissionType === 'voice') {
        speakText(data.message, () => {
          setInteractionStage('text');
          const nextPromptAudio = new Audio('/input_audio.mp3');
          nextPromptAudio.play().catch(e => console.error("Prompt audio failed to play.", e));
        });
      } else {
        setFeedback(data);
        setShowAnswer(data.show_answer);
        setTimeout(() => speakText(data.message), 300);
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorFeedback = { message: error.message, isCorrect: false };
      if (submissionType === 'text') setFeedback(errorFeedback);
      else speakText(error.message, () => setInteractionStage('text'));
    } finally {
      setIsLoading(false);
      resetTranscript();
    }
  };

  // --- HANDLER FUNCTIONS ---
  const handleEventsInputChange = (index, value) => {
    const newAnswers = [...eventsAnswers];
    newAnswers[index] = value;
    setEventsAnswers(newAnswers);
  };

  const handleTextSubmit = () => {
    if (eventsAnswers.every(ans => ans.trim())) {
      submitAnswer(eventsAnswers, 'text');
    } else {
      alert("Please fill in all three events.");
    }
  };

  const handleProceedToNext = () => {
    stopSpeaking();
    navigate('/GodAct7');
  };

  const handleTryAgain = () => {
    stopSpeaking();
    setEventsAnswers(['', '', '']);
    setFeedback(null);
    setShowAnswer(false);
  };

  return (
    <div style={{
      backgroundColor: "#f5f5f5",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Sen:wght@400;600;800&display=swap');
          
          .banner-section {
            position: relative;
            width: 100%;
            height: auto;
            margin-bottom: 0;
            flex-shrink: 0;
          }
          
          .banner-img {
            width: 100%;
            height: auto;
            object-fit: cover;
          }
          
          .banner-content {
            position: absolute;
            top: 50%;
            left: 80px;
            transform: translateY(-50%);
            color: white;
            z-index: 5;
          }
          
          .banner-title {
            font-family: 'Gulten';
            font-size: 48px;
            font-weight: 800;
            color: #2c5f7c;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          
          .question-indicator {
            position: absolute;
            top: 50%;
            right: 80px;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 16px;
            border-radius: 20px;
            font-family: 'Sen', sans-serif;
            font-weight: 600;
            color: #2c5f7c;
            font-size: 14px;
          }

          .failsafe-button {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(68, 199, 216, 0.9);
            border: none;
            border-radius: 25px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
            color: white;
            font-size: 12px;
            font-family: 'Sen', sans-serif;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          }

          .failsafe-button:hover {
            background: rgba(50, 159, 173, 0.9);
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
          }

          .voice-toggle-button {
            position: absolute;
            top: 20px;
            display: none;
            right: 140px;
            background: ${voiceEnabled ? '#28a745' : '#dc3545'};
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            color: white;
            font-size: 12px;
            cursor: pointer;
            font-family: 'Sen', sans-serif;
            font-weight: 600;
            z-index: 10;
            transition: all 0.3s ease;
          }

          .voice-toggle-button:hover {
            transform: scale(1.05);
          }
          
          .yellow-strip {
            width: 100%;
            height: 8px;
            background: #ffd700;
            margin-bottom: 10px;
            flex-shrink: 0;
          }
          
          .main-content {
            flex: 1;
            padding: 40px 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 120px;
            min-height: 0;
          }

          .content-with-button {
            flex: 1;
            max-width: 650px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 20px;
          }
         
          .book-image-section {
            flex: 0 0 auto;
            margin-top: 20px;
          }
         
          .book-cover {
            width: 280px;
            height: 350px;
            border-radius: 15px;
            transition: transform 0.3s ease;
            object-fit: cover;
          }
         
          .question-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-bottom: 5px solid #ffd700;
          }
         
         .question-title {
           font-family: 'Sen', sans-serif;
           font-size: 32px;
           font-weight: 600;
           color: #333;
           margin-bottom: 30px;
         }
         
         .answer-field {
           margin-bottom: 30px;
         }
         
         .field-label {
           font-family: 'Sen', sans-serif;
           font-size: 24px;
           font-weight: 600;
           color: #333;
           margin-bottom: 8px;
           display: block;
         }

         .field-subtitle {
           font-family: 'Sen', sans-serif;
           font-size: 12px;
           font-weight: 600;
           color: #ff9500;
           background-color: #fff3d4;
           padding: 8px 12px;
           border-radius: 6px;
           margin-bottom: 15px;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           display: inline-block;
         }

         .numbered-inputs {
           display: flex;
           flex-direction: column;
           gap: 15px;
         }

         .numbered-input-row {
           display: flex;
           align-items: center;
           gap: 15px;
         }

         .input-number {
           font-family: 'Sen', sans-serif;
           font-size: 20px;
           font-weight: 600;
           color: #333;
           min-width: 20px;
           text-align: center;
         }

         .numbered-input {
           flex: 1;
         }
         
         .answer-input {
           width: 100%;
           padding: 18px 24px;
           font-size: 16px;
           border: 2px solid #e0e0e0;
           border-radius: 12px;
           font-family: 'Segoe UI', sans-serif;
           background-color: #f8f9fa;
           transition: all 0.3s ease;
           box-sizing: border-box;
         }
         
         .answer-input:focus {
           outline: none;
           border-color: #5bc0de;
           background-color: white;
           box-shadow: 0 0 0 3px rgba(91, 192, 222, 0.1);
         }
         
         .answer-input::placeholder {
           color: #999;
           font-style: italic;
         }
         
         .button-section {
           display: flex;
           justify-content: flex-end;
           gap: 15px;
         }
         
         .btn-next {
           background: #23A7AC; 
           color: white;
           border: none;
           padding: 14px 32px;
           border-radius: 10px;
           font-family: 'Sen', sans-serif;
           font-weight: 600;
           font-size: 14px;
           cursor: pointer;
           transition: all 0.3s ease;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           box-shadow: 0 4px 12px rgba(35, 167, 172, 0.3);
         }
         
         .btn-next:disabled {
           background: #ccc;
           cursor: not-allowed;
           box-shadow: none;
         }
         
         .btn-next:hover:not(:disabled) {
           background: #1e8a8f;
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(35, 167, 172, 0.4);
         }
         
         .btn-try-again {
           background: #dc3545;
           color: white;
           border: none;
           padding: 14px 32px;
           border-radius: 10px;
           font-family: 'Sen', sans-serif;
           font-weight: 600;
           font-size: 14px;
           cursor: pointer;
           transition: all 0.3s ease;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
         }
         
         .btn-try-again:hover {
           background: #c82333;
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
         }
         
         .btn-proceed {
           background: #28a745;
           color: white;
           border: none;
           padding: 14px 32px;
           border-radius: 10px;
           font-family: 'Sen', sans-serif;
           font-weight: 600;
           font-size: 14px;
           cursor: pointer;
           transition: all 0.3s ease;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
         }
         
         .btn-proceed:hover {
           background: #218838;
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
         }
         
         .feedback-section {
           background: white;
           border-radius: 20px;
           margin-top: 20px;
           padding: 30px;
           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
           border-left: 5px solid;
           position: relative;
         }
         
         .feedback-section.correct {
           border-left-color: #28a745;
           background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
         }
         
         .feedback-section.incorrect {
           border-left-color: #dc3545;
           background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
         }
         
         .feedback-section.partial {
           border-left-color: #ffc107;
           background: linear-gradient(135deg, #fffdf5 0%, #ffffff 100%);
         }
         
         .feedback-title {
           font-family: 'Sen', sans-serif;
           font-size: 24px;
           font-weight: 600;
           margin-bottom: 15px;
           display: flex;
           align-items: center;
           gap: 10px;
         }
         
         .feedback-title.correct {
           color: #28a745;
         }
         
         .feedback-title.incorrect {
           color: #dc3545;
         }
         
         .feedback-title.partial {
           color: #ffc107;
         }

         .voice-replay-button {
           position: absolute;
           top: 15px;
           right: 15px;
           background: rgba(35, 167, 172, 0.1);
           border: 1px solid #23A7AC;
           border-radius: 20px;
           padding: 6px 12px;
           color: #23A7AC;
           font-size: 12px;
           cursor: pointer;
           font-family: 'Sen', sans-serif;
           font-weight: 600;
           transition: all 0.3s ease;
         }

         .voice-replay-button:hover {
           background: #23A7AC;
           color: white;
         }

         .voice-replay-button.speaking {
           background: #28a745;
           color: white;
           border-color: #28a745;
         }
         
         .feedback-message {
           font-family: 'Sen', sans-serif;
           font-size: 16px;
           color: #333;
           margin-bottom: 20px;
           line-height: 1.5;
         }
         
         .correct-answer {
           background: #e8f5e8;
           border: 1px solid #28a745;
           border-radius: 10px;
           padding: 15px;
           margin-top: 15px;
         }
         
         .correct-answer-title {
           font-family: 'Sen', sans-serif;
           font-size: 14px;
           font-weight: 600;
           color: #28a745;
           margin-bottom: 8px;
         }
         
         .correct-answer-text {
           font-family: 'Sen', sans-serif;
           font-size: 16px;
           color: #333;
           font-weight: 500;
         }
         
         .loading-spinner {
           display: inline-block;
           width: 16px;
           height: 16px;
           border: 2px solid #ffffff;
           border-radius: 50%;
           border-top-color: transparent;
           animation: spin 1s ease-in-out infinite;
           margin-right: 8px;
         }
         
         @keyframes spin {
           to { transform: rotate(360deg); }
         }
         
         .footer-section {
           width: 100%;
           height: 120px;
           position: relative;
           overflow: hidden;
           flex-shrink: 0;
         }
         
         .footer-img {
           width: 100%;
           height: 120px;
           object-fit: cover;
           display: block;
         }
    
        @media (max-width: 1024px) {
          .main-content {
            padding: 30px 40px;
            gap: 60px;
          }
          
          .book-cover {
            width: 240px;
            height: 300px;
          }
          
          .banner-title {
            font-size: 36px;
          }
        }
        
        @media (max-width: 768px) {
          .main-content {
            flex-direction: column;
            padding: 20px;
            gap: 30px;
         
          }
          
          .book-image-section {
            order: 1;
            margin-top: 0;
            padding: 0 20px;
          }
          
          .book-cover {
            width: 100%;
            max-width: 280px;
            height: auto;
            aspect-ratio: 4/5;
          }
          
          .content-with-button {
            order: 2;
            max-width: 100%;
            margin-top: 0;
          }
          
          .question-section {
            padding: 25px 39px;
            margin-top: 0;
          }

          .question-title {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .field-label {
            font-size: 20px;
            margin-bottom: 12px;
          }

          .field-subtitle {
            font-size: 11px;
            padding: 6px 10px;
            margin-bottom: 12px;
          }

          .numbered-inputs {
            gap: 12px;
          }

          .numbered-input-row {
            gap: 12px;
          }

          .input-number {
            font-size: 18px;
            min-width: 18px;
          }

          .answer-input {
            padding: 15px 20px;
            font-size: 15px;
          }
          
          .button-section {
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .btn-next, .btn-try-again, .btn-proceed {
            padding: 12px 24px;
            font-size: 13px;
            min-width: 120px;
          }
          
          .feedback-section {
            padding: 20px;
            margin-top: 15px;
          }
          
          .feedback-title {
            font-size: 20px;
          }
          
          .feedback-message {
            font-size: 15px;
          }
          
          .banner-title {
            font-size: 24px;
            left: 30px;
          }
          
          .banner-section {
            height: 120px;
          }
          
          .question-indicator {
            right: 30px;
            padding: 6px 12px;
            font-size: 12px;
          }

          .failsafe-button {
            top: 15px;
            right: 15px;
            padding: 6px 12px;
            font-size: 11px;
          }

          .voice-toggle-button {
            right: 120px;
            padding: 5px 10px;
            font-size: 10px;
            display: block;
          }
          
          .voice-replay-button {
            position: static;
            margin-bottom: 15px;
            width: fit-content;
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 15px;
            gap: 20px;
          }
          
          .book-image-section {
            padding: 0 10px;
          }
          
          .question-section {
            padding: 20px 39px;
          }

          .question-title {
            font-size: 20px;
            margin-bottom: 15px;
          }
          
          .field-label {
            font-size: 18px;
          }

          .field-subtitle {
            font-size: 10px;
            padding: 5px 8px;
          }

          .numbered-inputs {
            gap: 10px;
          }

          .numbered-input-row {
            gap: 10px;
          }

          .input-number {
            font-size: 16px;
            min-width: 16px;
          }

          .answer-input {
            padding: 12px 16px;
            font-size: 14px;
          }
          
          .btn-next, .btn-try-again, .btn-proceed {
            padding: 10px 20px;
            font-size: 12px;
            min-width: 100px;
          }
          
          .feedback-section {
            padding: 15px;
          }
          
          .feedback-title {
            font-size: 18px;
          }
          
          .feedback-message {
            font-size: 14px;
          }
          
          .banner-title {
            font-size: 18px;
            left: 20px;
          }
          
          .question-indicator {
            right: 20px;
            padding: 4px 8px;
            font-size: 11px;
          }

          .failsafe-button {
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            font-size: 10px;
          }

          .voice-toggle-button {
            right: 100px;
            padding: 4px 8px;
            font-size: 9px;
          }
        }

        @media (max-width: 414px) and (max-height: 896px) {
          .banner-section {
            height: 100px;
          }
          
          .main-content {
            padding: 10px;
          }
          
          .book-cover {
            max-width: 250px;
          }
          
          .question-section {
            border-radius: 15px;
          }

          .question-title {
            font-size: 18px;
          }

          .answer-input {
            border-radius: 10px;
          }

          .numbered-input-row {
            gap: 8px;
          }

          .input-number {
            font-size: 15px;
            min-width: 15px;
          }
          
          .failsafe-button {
            font-size: 9px;
            padding: 4px 8px;
          }
        }
        `}
      </style>
      <Header />

      <div className="banner-section">
        <img src="/b6.png" alt="Banner Background" className="banner-img" />
        {/* --- FAILSAFE RESTART BUTTON --- */}
        <button
          className="failsafe-button"
          onClick={handleFailsafeRestart}
          title="Restart Session (Failsafe)"
        >
          <FaRedo size={14} />
          RESTART
        </button>
      </div>

      <div className="main-content">
        <div className="book-image-section">
          <img
            src="/goldilocks.png"
            alt="Goldilocks and the Three Bears Book Cover"
            className="book-cover"
          />
        </div>
        <div className="content-with-button">
          {interactionStage === 'voice' ? (
            <div className="voice-input-section" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              {listening ? (
                <>
                  <FaMicrophone size={50} color="#23A7AC" style={{ marginBottom: '20px' }} />
                  <p>Listening...</p>
                  <p style={{ fontStyle: 'italic', color: '#666' }}>In one go, describe the three main events in the story.</p>
                </>
              ) : (
                <>
                  <FaMicrophoneSlash size={50} color="#6c757d" style={{ marginBottom: '20px' }} />
                  <p>{isLoading ? 'Checking answer...' : (isQuestionFinished ? 'Say your answer' : 'Listen to the question...')}</p>
                  <p style={{ fontStyle: 'italic', color: '#666' }}>In one go, describe the three main events in the story.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="question-section">
                <h2 className="question-title">What are 3 important things that happened in the story?</h2>
                <div className="answer-field">
                    {[0, 1, 2].map(index => (
                      <div key={index} style={{ marginBottom: '15px' }}>
                        <label className="field-label">{`Event ${index + 1}`}</label>

                        {!feedback ? (
                          <input
                            type="text"
                            className="answer-input"
                            placeholder={`Describe event ${index + 1}`}
                            value={eventsAnswers[index]}
                            onChange={(e) => handleEventsInputChange(index, e.target.value)}
                            disabled={isLoading}
                          />
                        ) : (
                          <div
                            className="answer-input"
                            style={{
                              backgroundColor: '#e9ecef',
                              cursor: 'default',
                              minHeight: '55px',
                              padding: '18px 24px'
                            }}
                          >
                            {renderHighlightedText(eventsAnswers[index], feedback.misspelled_words ? feedback.misspelled_words[index] : [])}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              {feedback && (
                <div className={`feedback-section ${feedback.isCorrect ? 'correct' :
                  feedback.feedback_type === 'partial' ? 'partial' : 'incorrect'
                  }`}>
                  <button
                    className={`voice-replay-button ${isSpeaking ? 'speaking' : ''}`}
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else {
                        let voiceText = feedback.message;
                        if (feedback.correct_answer && showAnswer) {
                          voiceText += ` The complete answer is: ${feedback.correct_answer}`;
                        }
                        speakText(voiceText);
                      }
                    }}
                    title={isSpeaking ? "Stop speaking" : "Replay feedback"}
                  >
                    {isSpeaking ? '⏹️ Stop' : '🔊 Replay'}
                  </button>

                  <div className={`feedback-title ${feedback.isCorrect ? 'correct' :
                    feedback.feedback_type === 'partial' ? 'partial' : 'incorrect'
                    }`}>
                    {feedback.isCorrect ? '✓ Correct!' :
                      feedback.feedback_type === 'partial' ? '~ Partially Correct' : '✗ Needs Improvement'}
                  </div>
                  <div className="feedback-message">
                    {feedback.message}
                  </div>
                  {showAnswer && feedback.correct_answer && (
                    <div className="correct-answer">
                      <div className="correct-answer-title">Complete Answer:</div>
                      <div className="correct-answer-text">{feedback.correct_answer}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="button-section">
                {!feedback ? (
                  <button className="btn-next" onClick={handleTextSubmit} disabled={eventsAnswers.some(a => !a.trim()) || isLoading}>
                    {isLoading ? <><span className="loading-spinner"></span>CHECKING...</> : 'CHECK ANSWER'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {!feedback.isCorrect && (
                      <button className="btn-try-again" onClick={handleTryAgain}>TRY AGAIN</button>
                    )}
                    <button className="btn-proceed" onClick={handleProceedToNext}>NEXT QUESTION</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="footer-section">
        <img
          src="/footer.png"
          alt="Footer"
          className="footer-img"
        />
      </div>
    </div>
  );
}