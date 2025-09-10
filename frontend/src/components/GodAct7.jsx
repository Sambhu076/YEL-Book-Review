import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaPlay, FaMicrophone, FaMicrophoneSlash, FaRedo } from "react-icons/fa";
import Header from "./Header";

export default function GodAct7() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT (from GodAct5) ---
  const [typedAnswer, setTypedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [interactionStage, setInteractionStage] = useState('voice');
  const [isQuestionFinished, setIsQuestionFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
  const VOICE_ID = 'pqHfZKP75CvOlQylNhV4';

  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // --- FAILSAFE BUTTON HANDLER ---
  const handleFailsafeRestart = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    SpeechRecognition.stopListening();
    window.location.reload();
  };

  // --- FUNCTION TO START SESSION ---
  const startSession = () => {
    resetTranscript();

    if (!browserSupportsSpeechRecognition) {
      alert("This browser doesn't support speech recognition.");
      return;
    }

    const questionAudio = new Audio('/favour.mp3');

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

  // --- AUTO START ON PAGE LOAD ---
  useEffect(() => {
    const cleanup = startSession();
    return cleanup;
  }, []);

  // Effect 2: Starts listening
  // Effect 2: Starts listening after the question is finished
  useEffect(() => {
    if (isQuestionFinished && !listening && interactionStage === 'voice') {
      console.log("DEBUG: Conditions met. Starting to listen for Q6 answer...");
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });

      // Timeout to automatically stop listening after 15 seconds for this longer question.
      const stopListeningTimeout = setTimeout(() => {
        if (SpeechRecognition.browserSupportsSpeechRecognition()) {
          console.log("DEBUG: 15 second timer elapsed. Stopping listening.");
          SpeechRecognition.stopListening();
        }
      }, 10000);

      return () => {
        clearTimeout(stopListeningTimeout);
      };
    }
  }, [isQuestionFinished, listening, interactionStage]);


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


  // Effect 3: Auto-submits voice answer
  useEffect(() => {
    if (finalTranscript && !isLoading) {
      const capitalizedAnswer = finalTranscript.charAt(0).toUpperCase() + finalTranscript.slice(1);
      console.log("DEBUG: Original transcript received:", capitalizedAnswer);
      submitAnswer(capitalizedAnswer, 'voice');
    }
  }, [finalTranscript, isLoading]);

  // --- AUDIO & HELPER FUNCTIONS (Standardized) ---
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

  const speakWithGoogleTTS = (text) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-C', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3' },
          }),
        });

        if (!response.ok) throw new Error(`Google TTS API error: ${response.status}`);

        const data = await response.json();
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudio(null);
          resolve();
        };
        audio.onerror = (e) => {
          setIsSpeaking(false);
          setCurrentAudio(null);
          reject(e);
        };
        await audio.play();
      } catch (error) {
        console.error('Google TTS error, falling back to browser synthesis:', error);
        // Fallback to browser synthesis if Google TTS fails
        speakWithBrowserSynthesis(text).then(resolve).catch(reject);
      }
    });
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
    if (GOOGLE_TTS_API_KEY) {
      speakWithGoogleTTS(text, onEndCallback);
    } else {
      speakWithBrowserSynthesis(text, {}, onEndCallback);
    }
  };

  // --- DYNAMIC SUBMIT ANSWER FUNCTION ---
  const submitAnswer = async (answer, submissionType) => {
    SpeechRecognition.stopListening();
    setIsLoading(true);
    if (submissionType === 'text') setFeedback(null);

    try {
      const response = await fetch('http://localhost:8000/api/check-goldilocks-favourite-character/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || data.message || 'An unknown error occurred.');
      }

      if (submissionType === 'voice') {
        speakText(data.message, () => {
          setInteractionStage('text');
          const nextPromptAudio = new Audio('/sen.mp3');
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
  const handleTextSubmit = () => {
    if (typedAnswer.trim()) {
      submitAnswer(typedAnswer, 'text');
    }
  };

  const handleProceedToNext = () => {
    stopSpeaking();
    navigate('/GodAct8');
  };

  const handleTryAgain = () => {
    stopSpeaking();
    setTypedAnswer('');
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
          /* All CSS from GodAct5 is assumed here */
          @import url('https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Sen:wght@400;600;800&display=swap');
          
          .banner-section { position: relative; width: 100%; height: auto; }
          .banner-img { width: 100%; height: auto; object-fit: cover; }
          
          .failsafe-button {
            position: absolute; top: 20px; right: 20px; background: rgba(68, 199, 216, 0.9);
            border: none; border-radius: 25px; padding: 8px 16px; display: flex;
            align-items: center; gap: 6px; cursor: pointer; transition: all 0.3s ease;
            z-index: 10; color: white; font-size: 12px; font-family: 'Sen', sans-serif;
            font-weight: 600; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          }
          .failsafe-button:hover { background: rgba(50, 159, 173, 0.9); transform: scale(1.05); }

           .audio-play-button {
             position: absolute; top: 20px; right: 90px; background: rgba(35, 167, 172, 0.9);
             border: none; border-radius: 50%; width: 50px; height: 50px; display: flex;
             align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;
             z-index: 10; color: white; font-size: 18px; box-shadow: 0 4px 12px rgba(35, 167, 172, 0.3);
           }
          
          .main-content {
            flex: 1; padding: 40px 60px; display: flex; align-items: center;
            justify-content: center; gap: 120px; min-height: 0;
          }
          .content-with-button {
            flex: 1; max-width: 650px; display: flex; flex-direction: column; gap: 20px; margin-top: 20px;
          }
          .book-image-section { flex: 0 0 auto; margin-top: 20px; }
          .book-cover { width: 280px; height: 350px; border-radius: 15px; object-fit: cover; }
          .question-section {
            background: white; border-radius: 20px; padding: 40px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-bottom: 5px solid #ffd700;
          }
          .question-title { font-family: 'Sen', sans-serif; font-size: 32px; font-weight: 600; color: #333; margin-bottom: 30px; }
          .answer-field { margin-bottom: 30px; }
          .field-label { font-family: 'Sen', sans-serif; font-size: 22px; font-weight: 600; color: #333; margin-bottom: 8px; }
          .answer-textarea {
            width: 100%; padding: 18px 24px; font-size: 16px; border: 2px solid #e0e0e0; border-radius: 12px;
            font-family: 'Segoe UI', sans-serif; background-color: #f8f9fa; transition: all 0.3s ease;
            box-sizing: border-box; resize: vertical; min-height: 120px;
          }
          .answer-textarea:focus { outline: none; border-color: #5bc0de; background-color: white; box-shadow: 0 0 0 3px rgba(91, 192, 222, 0.1); }
          .button-section { display: flex; justify-content: flex-end; gap: 15px; }
          .btn-next, .btn-try-again, .btn-proceed {
            color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Sen', sans-serif;
            font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase;
          }
          .btn-next { background: #23A7AC; box-shadow: 0 4px 12px rgba(35, 167, 172, 0.3); }
          .btn-next:hover:not(:disabled) { background: #1e8a8f; transform: translateY(-2px); }
          .btn-next:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }
          .btn-try-again { background: #dc3545; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3); }
          .btn-try-again:hover { background: #c82333; transform: translateY(-2px); }
          .btn-proceed { background: #28a745; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); }
          .btn-proceed:hover { background: #218838; transform: translateY(-2px); }
          .feedback-section {
            background: white; border-radius: 20px; margin-top: 20px; padding: 30px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-left: 5px solid; position: relative;
          }
          .feedback-section.correct { border-left-color: #28a745; }
          .feedback-section.incorrect { border-left-color: #dc3545; }
          .feedback-section.partial { border-left-color: #ffc107; }
          .feedback-title { font-family: 'Sen', sans-serif; font-size: 24px; font-weight: 600; margin-bottom: 15px; }
          .feedback-title.correct { color: #28a745; }
          .feedback-title.incorrect { color: #dc3545; }
          .feedback-title.partial { color: #ffc107; }
          .voice-replay-button {
            position: absolute; top: 15px; right: 15px; background: rgba(35, 167, 172, 0.1);
            border: 1px solid #23A7AC; border-radius: 20px; padding: 6px 12px; color: #23A7AC; font-size: 12px; cursor: pointer;
          }
          .feedback-message { font-family: 'Sen', sans-serif; font-size: 16px; color: #333; line-height: 1.5; }
          .loading-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: spin 1s ease-in-out infinite; margin-right: 8px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .footer-section { width: 100%; height: 120px; position: relative; overflow: hidden; flex-shrink: 0; }
          .footer-img { width: 100%; height: 120px; object-fit: cover; display: block; }
        `}
      </style>
      <Header />
      <div className="banner-section">
        <img src="/b7.png" alt="Banner Background" className="banner-img" />
        <button className="failsafe-button" onClick={handleFailsafeRestart} title="Restart Session (Failsafe)">
          <FaRedo size={14} /> RESTART
        </button>

      </div>
      <div className="main-content">
        <div className="book-image-section">
          <img src="/goldilocks.png" alt="Book Cover" className="book-cover" />
        </div>
        <div className="content-with-button">
          {interactionStage === 'voice' ? (
            <div className="voice-input-section" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
              {listening ? (
                <>
                  <FaMicrophone size={50} color="#23A7AC" style={{ marginBottom: '20px' }} />
                  <p>Listening...</p>
                </>
              ) : (
                <>
                  <FaMicrophoneSlash size={50} color="#6c757d" style={{ marginBottom: '20px' }} />
                  <p>{isLoading ? 'Checking answer...' : 'Say your answer'}</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="question-section">
                <h2 className="question-title">Who was your favourite character and why?</h2>
                
                <div className="answer-field">
                  <div className="field-label">Sentence starters: My favourite character is... / I like them because...</div>
                  {!feedback ? (
                    // If there's no feedback yet, show the normal input field
                    <textarea
                      className="answer-textarea"
                      placeholder="type answer here"
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      rows="6"
                      disabled={isLoading || !!feedback}
                    />
                  ) : (
                    // After feedback, show the non-editable highlighted version
                    <div className="answer-textarea" style={{ backgroundColor: '#e9ecef', cursor: 'default', minHeight: '55px', padding: '18px 24px' }}>
                      {renderHighlightedText(typedAnswer, feedback.misspelled_words)}
                    </div>
                  )}
                </div>


              </div>
              {feedback && (
                <div className={`feedback-section ${feedback.isCorrect ? 'correct' : feedback.feedback_type === 'partial' ? 'partial' : 'incorrect'}`}>
                  <button className={`voice-replay-button ${isSpeaking ? 'speaking' : ''}`} onClick={() => isSpeaking ? stopSpeaking() : speakText(feedback.message)} title={isSpeaking ? "Stop speaking" : "Replay feedback"}>
                    {isSpeaking ? '⏹️ Stop' : '🔊 Replay'}
                  </button>
                  <div className={`feedback-title ${feedback.isCorrect ? 'correct' : feedback.feedback_type === 'partial' ? 'partial' : 'incorrect'}`}>
                    {feedback.isCorrect ? '✓ Great Job!' : feedback.feedback_type === 'partial' ? '~ Good Start' : '✗ Needs More Detail'}
                  </div>
                  <div className="feedback-message">{feedback.message}</div>
                </div>
              )}
              <div className="button-section">
                {!feedback ? (
                  <button className="btn-next" onClick={handleTextSubmit} disabled={!typedAnswer.trim() || isLoading}>
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
        <img src="/footer.png" alt="Footer" className="footer-img" />
      </div>
    </div>
  );
}