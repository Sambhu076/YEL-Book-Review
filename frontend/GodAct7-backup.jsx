import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaRegBell, FaVolumeUp, FaPlay } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import Header from "./Header";

export default function GodAct7() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(7);
  const [favouriteCharacterAnswer, setFavouriteCharacterAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  
  // VOICE STATE VARIABLES - ADDED FROM PREVIOUS COMPONENTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  
  const totalQuestions = 9;

  // ElevenLabs configuration
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'your-api-key-here';
  const VOICE_ID = 'pqHfZKP75CvOlQylNhV4';

  // Enhanced audio functionality
  useEffect(() => {
    const playTitleAudio = () => {
      try {
        const audio = new Audio('/sen.mp3');
        audio.volume = 0.7;
        
        audio.addEventListener('loadeddata', () => {
          console.log('Audio loaded successfully');
        });
        
        audio.addEventListener('ended', () => {
          console.log('Audio playback completed');
          setAudioPlayed(true);
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setShowPlayButton(true);
        });
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing automatically');
              setAudioPlayed(false);
            })
            .catch((error) => {
              console.log('Autoplay prevented by browser:', error);
              setShowPlayButton(true);
              
              const banner = document.querySelector('.banner-section');
              if (banner) {
                banner.style.position = 'relative';
              }
            });
        }
        
        return audio;
      } catch (error) {
        console.error('Error setting up audio:', error);
        setShowPlayButton(true);
        return null;
      }
    };

    const timer = setTimeout(() => {
      playTitleAudio();
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Voice initialization
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Manual play function for when autoplay is blocked
  const handleManualPlay = () => {
    try {
      const audio = new Audio('/sen.mp3');
      audio.volume = 0.7;
      
      audio.addEventListener('ended', () => {
        setAudioPlayed(true);
        setShowPlayButton(false);
      });
      
      audio.play().then(() => {
        setShowPlayButton(false);
        console.log('Audio started playing manually');
      }).catch((error) => {
        console.error('Manual play failed:', error);
      });
    } catch (error) {
      console.error('Error in manual play:', error);
    }
  };

  // ElevenLabs speech function
  const speakWithElevenLabs = async (text) => {
    if (!voiceEnabled || !text || !ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your-api-key-here') {
      console.log('ElevenLabs not configured, falling back to browser speech');
      return speakWithBrowserSynthesis(text);
    }

    try {
      setIsSpeaking(true);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.7,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback failed, falling back to browser speech');
        speakWithBrowserSynthesis(text);
      };

      await audio.play();
      
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      setCurrentAudio(null);
      speakWithBrowserSynthesis(text);
    }
  };

  // Browser speech synthesis
  const speakWithBrowserSynthesis = (text, options = {}) => {
    window.speechSynthesis.cancel();
    
    if (!voiceEnabled || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Karen') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Google') ||
      (voice.lang.startsWith('en') && voice.name.includes('UK'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Main speech function that chooses between ElevenLabs and browser
  const speakText = (text) => {
    if (useElevenLabs) {
      speakWithElevenLabs(text);
    } else {
      speakWithBrowserSynthesis(text);
    }
  };

  // Stop speaking function (handles both ElevenLabs and browser)
  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Submit answer with voice feedback
  const submitAnswer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/check-goldilocks-favourite-character/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: favouriteCharacterAnswer.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setFeedback({ message: data.error, isCorrect: false });
      } else {
        setFeedback(data);
        setShowAnswer(data.show_answer);
        
        // Voice feedback - customized for favorite character question
        setTimeout(() => {
          let voiceText = "";
          
          if (data.isCorrect) {
            voiceText = "Great job! " + data.message;
          } else if (data.feedback_type === 'partial' || data.feedback_type === 'good') {
            voiceText = "Good start! " + data.message;
          } else {
            voiceText = "Try to write more. " + data.message;
          }
          
          // Note: Favorite character questions typically don't show "correct answers" since they're subjective
          console.log('Speaking:', voiceText);
          speakText(voiceText);
        }, 500);
      }
    } catch (error) {
      console.error('Network error:', error);
      if (error.message.includes('404')) {
        setFeedback({ message: 'API endpoint not found. Please check if the backend server is running.', isCorrect: false });
      } else {
        setFeedback({ message: 'Network error. Please check your connection and try again.', isCorrect: false });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (favouriteCharacterAnswer.trim()) {
      if (currentQuestion === 7) {
        await submitAnswer();
      } else {
        console.log('Favourite character answer:', favouriteCharacterAnswer);
        setCurrentQuestion(currentQuestion + 1);
        setFeedback(null);
        setShowAnswer(false);
      }
    } else {
      alert('Please write about your favourite character before proceeding.');
    }
  };

  const handleProceedToNext = () => {
    stopSpeaking();
    navigate('/GodAct8');
  };

  const handleTryAgain = () => {
    stopSpeaking();
    setFavouriteCharacterAnswer('');
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

          .audio-play-button {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(35, 167, 172, 0.9);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
            color: white;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(35, 167, 172, 0.3);
          }

          .audio-play-button:hover {
            background: rgba(30, 138, 143, 0.95);
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(35, 167, 172, 0.4);
          }

          .audio-play-button.playing {
            background: rgba(40, 167, 69, 0.9);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .voice-toggle-button {
            position: absolute;
            top: 20px;
            right: 80px;
            display: none;
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
           font-size: 22px;
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

         .sentence-starters {
           font-family: 'Sen', sans-serif;
           font-size: 14px;
           color: #666;
           margin-bottom: 15px;
           font-style: italic;
         }

         .answer-textarea {
           width: 100%;
           padding: 18px 24px;
           font-size: 16px;
           border: 2px solid #e0e0e0;
           border-radius: 12px;
           font-family: 'Segoe UI', sans-serif;
           background-color: #f8f9fa;
           transition: all 0.3s ease;
           box-sizing: border-box;
           resize: vertical;
           min-height: 120px;
         }
         
         .answer-textarea:focus {
           outline: none;
           border-color: #5bc0de;
           background-color: white;
           box-shadow: 0 0 0 3px rgba(91, 192, 222, 0.1);
         }
         
         .answer-textarea::placeholder {
           color: #999;
           font-style: italic;
         }
         
         .button-section {
           display: flex;
           justify-content: flex-end;
           gap: 15px;
         }
         
         .btn-next {
           background: #5bc0de;
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
           box-shadow: 0 4px 12px rgba(91, 192, 222, 0.3);
         }
         
         .btn-next:hover {
           background: #46a8c7;
           transform: translateY(-2px);
           box-shadow: 0 6px 18px rgba(91, 192, 222, 0.4);
         }
         
         .btn-next:disabled {
           background: #ccc;
           cursor: not-allowed;
           transform: none;
           box-shadow: none;
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
    
        
        /* IMPROVED RESPONSIVE DESIGN - SAME AS GODACT1, GODACT2, GODACT3, GODACT4, GODACT5 & GODACT6 */
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
            padding: 25px 20px;
            margin-top: 0;
          }

          .question-title {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .field-label {
            font-size: 18px;
            margin-bottom: 12px;
          }

          .field-subtitle {
            font-size: 11px;
            padding: 6px 10px;
            margin-bottom: 12px;
          }

          .sentence-starters {
            font-size: 13px;
            margin-bottom: 12px;
          }

          .answer-textarea {
            padding: 15px 20px;
            font-size: 15px;
            min-height: 100px;
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

          .audio-play-button {
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .voice-toggle-button {
            right: 60px;
            padding: 5px 10px;
            font-size: 10px;
            display: block;
            display: none;
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
            padding: 20px 15px;
          }

          .question-title {
            font-size: 20px;
            margin-bottom: 15px;
          }
          
          .field-label {
            font-size: 16px;
          }

          .field-subtitle {
            font-size: 10px;
            padding: 5px 8px;
          }

          .sentence-starters {
            font-size: 12px;
            margin-bottom: 10px;
          }

          .answer-textarea {
            padding: 12px 16px;
            font-size: 14px;
            min-height: 80px;
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

          .audio-play-button {
            width: 35px;
            height: 35px;
            font-size: 12px;
          }

          .voice-toggle-button {
            right: 50px;
            padding: 4px 8px;
            font-size: 9px;
            display: none;
          }
        }

        /* iPhone-specific adjustments */
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

          .answer-textarea {
            border-radius: 10px;
            min-height: 70px;
          }

          .field-label {
            font-size: 15px;
          }

          .sentence-starters {
            font-size: 11px;
          }
        }
      `}
      </style>

      {/* Header */}
      <Header />
      
      {/* Banner Section */}
      <div className="banner-section">
        <img 
          src="/b7.png" 
          alt="Banner Background" 
          className="banner-img"
        />
   
        
        {/* Voice Toggle Button */}
        <button 
          className="voice-toggle-button"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          title={voiceEnabled ? "Mute voice feedback" : "Enable voice feedback"}
        >
          {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
        </button>
        
        {/* Audio Play Button - only shows if autoplay was blocked */}
        {showPlayButton && (
          <button 
            className="audio-play-button"
            onClick={handleManualPlay}
            title="Click to play audio introduction"
          >
            <FaPlay />
          </button>
        )}
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Book Image Section */}
        <div className="book-image-section">
          <img 
            src="/goldilocks.png" 
            alt="Goldilocks and the Three Bears Book Cover"
            className="book-cover"
          />
        </div>

        {/* Content with Button Section */}
        <div className="content-with-button">
          {/* Question Section */}
          <div className="question-section">
            <div className="answer-field">
              <div className="field-subtitle">WRITE 1-2 SENTENCES</div>
              <div className="field-label">
                Sentence starters: My favourite character is... / I like them because...
              </div>
              <textarea
                className="answer-textarea"
                placeholder="type answer here"
                value={favouriteCharacterAnswer}
                onChange={(e) => setFavouriteCharacterAnswer(e.target.value)}
                rows="6"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div className={`feedback-section ${
              feedback.isCorrect ? 'correct' : 
              feedback.feedback_type === 'partial' ? 'partial' : 'incorrect'
            }`}>
              {/* Voice Replay Button */}
              <button 
                className={`voice-replay-button ${isSpeaking ? 'speaking' : ''}`}
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    let voiceText = feedback.message;
                    speakText(voiceText);
                  }
                }}
                title={isSpeaking ? "Stop speaking" : "Replay feedback"}
              >
                {isSpeaking ? '⏹️ Stop' : '🔊 Replay'}
              </button>

              <div className={`feedback-title ${
                feedback.isCorrect ? 'correct' : 
                feedback.feedback_type === 'partial' ? 'partial' : 'incorrect'
              }`}>
                {feedback.isCorrect ? '✓ Great Job!' : 
                 feedback.feedback_type === 'partial' ? '~ Good Start' : '✗ Needs More Detail'}
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

          {/* Button Section */}
          <div className="button-section">
            {!feedback ? (
              <button 
                className="btn-next"
                onClick={handleNextQuestion}
                disabled={!favouriteCharacterAnswer.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    CHECKING...
                  </>
                ) : (
                  'CHECK ANSWER'
                )}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '15px' }}>
                {!feedback.isCorrect && (
                  <button 
                    className="btn-try-again"
                    onClick={handleTryAgain}
                  >
                    TRY AGAIN
                  </button>
                )}
                <button 
                  className="btn-proceed"
                  onClick={handleProceedToNext}
                >
                  NEXT QUESTION
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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