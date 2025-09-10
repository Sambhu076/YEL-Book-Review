import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaMicrophone, FaMicrophoneSlash, FaRocket, FaKeyboard } from "react-icons/fa";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Header from "./Header";

// --- Main Component ---
export default function GodAct1() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [activityStarted, setActivityStarted] = useState(false);
  const [interactionStage, setInteractionStage] = useState('voice'); // 'voice' or 'text'
  const [typedAnswer, setTypedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // --- LiveKit State ---
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitUrl, setLiveKitUrl] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);

  // --- Fetch LiveKit Token ---
  useEffect(() => {
    // Fetch the token when the component mounts so it's ready
    const fetchToken = async () => {
      try {
        // NOTE: Make sure your Django server is running and accessible at this URL
        const response = await fetch('http://localhost:8000/api/livekit-token/');
        if (!response.ok) {
          throw new Error('Failed to fetch LiveKit token');
        }
        const data = await response.json();
        setLiveKitToken(data.token);
        setLiveKitUrl(data.url);
      } catch (error) {
        console.error("LiveKit token fetch error:", error);
        alert("Could not connect to the session. Please ensure the backend server is running.");
      }
    };
    fetchToken();
  }, []);

  // --- ACTIVITY START HANDLER ---
  const handleStartActivity = () => {
    if (activityStarted || !liveKitToken) return;
    setActivityStarted(true);

    const questionAudio = new Audio('/title_1.mp3');
    questionAudio.play().catch(e => console.error("Error playing start audio:", e));

    questionAudio.onended = () => {
      // Automatically turn on the microphone after the question is asked
      setIsMicOn(true);
    };
  };

  // --- TEXT SUBMISSION LOGIC (For typed answers) ---
  const submitAnswer = async (answer) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('http://localhost:8000/api/check-question1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      setFeedback(data);
      setShowAnswer(data.show_answer);

    } catch (error) {
      console.error('Submission error:', error);
      setFeedback({ message: error.message, isCorrect: false, misspelled_words: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = () => {
    if (typedAnswer.trim()) {
      submitAnswer(typedAnswer);
    }
  };
  
  const handleProceedToNext = () => {
    navigate('/GodAct2');
  };

  const handleTryAgain = () => {
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

      <style>{`
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
            background: #dc3545;
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
            display: none;
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
            max-width: 500px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 20px;
          }
         
          .book-image-section {
            flex: 0 0 auto;
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
         
          .book-cover {
            width: 280px;
            height: 350px;
            border-radius: 15px;
            transition: transform 0.3s ease;
            object-fit: cover;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
         
          .question-section {
            background: white;
            border-radius: 20px;
            margin-top: 20px;
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
            margin-bottom: 15px;
            display: block;
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
            box-shadow: 0 4px 12px rgba(91, 192, 222, 0.3);
          }
         
          .btn-next:disabled {
            background: #ccc;
            cursor: not-allowed;
            box-shadow: none;
          }
         
          .btn-next:hover:not(:disabled) {
            background: #1e8a8f;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(91, 192, 222, 0.4);
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

          /* IMPROVED RESPONSIVE DESIGN */
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
              align-items: stretch;
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
            
            .field-label {
              font-size: 20px;
              margin-bottom: 12px;
            }
            
            .answer-input {
              padding: 15px 18px;
              font-size: 16px;
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
            
            .field-label {
              font-size: 18px;
            }
            
            .answer-input {
              padding: 12px 15px;
              font-size: 15px;
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
              font-size: 20px;
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
            
            .answer-input {
              border-radius: 10px;
            }
          }
        `}</style>
      
      <Header />

      <div className="banner-section">
        <img src="/b1.png" alt="Banner Background" className="banner-img" />
      </div>

      <div className="main-content">
        <div className="book-image-section">
          <img src="/goldilocks.png" alt="Book Cover" className="book-cover" />
        </div>

        <div className="content-with-button">
          {!activityStarted ? (
            <div className="start-activity-section" style={{ textAlign: 'center' }}>
              <button className="btn-proceed" onClick={handleStartActivity} disabled={!liveKitToken} style={{ fontSize: '18px', padding: '20px 40px' }}>
                <FaRocket style={{ marginRight: '10px' }} />
                {liveKitToken ? 'Start Session' : 'Connecting...'}
              </button>
            </div>
          ) : (
            <LiveKitRoom
              serverUrl={liveKitUrl}
              token={liveKitToken}
              connect={true}
              audio={true}
              video={false}
            >
              {/* This component plays audio from remote participants (i.e., the agent) */}
              <RoomAudioRenderer />

              {interactionStage === 'voice' ? (
                <VoiceInputUI isMicOn={isMicOn} setIsMicOn={setIsMicOn} setInteractionStage={setInteractionStage} />
              ) : (
                <TextInputUI
                  typedAnswer={typedAnswer}
                  setTypedAnswer={setTypedAnswer}
                  handleTextSubmit={handleTextSubmit}
                  feedback={feedback}
                  isLoading={isLoading}
                  showAnswer={showAnswer}
                  renderHighlightedText={renderHighlightedText}
                  handleTryAgain={handleTryAgain}
                  handleProceedToNext={handleProceedToNext}
                  setInteractionStage={setInteractionStage}
                />
              )}
            </LiveKitRoom>
          )}
        </div>
      </div>

      <div className="footer-section">
        <img src="/footer.png" alt="Footer" className="footer-img" />
      </div>
    </div>
  );
}

// --- Helper Component for Voice Input UI ---
function VoiceInputUI({ isMicOn, setIsMicOn, setInteractionStage }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(isMicOn);
    }
  }, [isMicOn, localParticipant]);

  return (
    <div className="voice-input-section" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
      {isMicOn ? (
        <>
          <FaMicrophone size={50} color="#23A7AC" style={{ marginBottom: '20px' }} />
          <p>Listening... Say your answer.</p>
          <p style={{fontSize: '12px', color: '#6c757d'}}>The agent will respond when you pause.</p>
        </>
      ) : (
        <>
          <FaMicrophoneSlash size={50} color="#6c757d" style={{ marginBottom: '20px' }} />
          <p>Your microphone is off.</p>
        </>
      )}
      <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px'}}>
        <button onClick={() => setIsMicOn(!isMicOn)} className="btn-next">
          {isMicOn ? 'Turn Off Mic' : 'Turn On Mic'}
        </button>
        <button onClick={() => setInteractionStage('text')} className="btn-try-again" title="Switch to typing">
          <FaKeyboard />
        </button>
      </div>
    </div>
  );
}

// --- Helper Component for Text Input UI ---
function TextInputUI({
    typedAnswer, setTypedAnswer, handleTextSubmit, feedback, isLoading,
    showAnswer, renderHighlightedText, handleTryAgain, handleProceedToNext, setInteractionStage
}) {
  return (
    <>
      <div className="question-section">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <label className="field-label">Title</label>
          <button onClick={() => setInteractionStage('voice')} className="btn-try-again" title="Switch to voice input" style={{padding: '8px 12px'}}>
              <FaMicrophone />
          </button>
        </div>
        {!feedback ? (
          <input
            type="text"
            className="answer-input"
            placeholder="type answer here"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            disabled={isLoading}
          />
        ) : (
          <div className="answer-input" style={{ cursor: 'default', minHeight: '55px', padding: '18px 24px' }}>
            {renderHighlightedText(typedAnswer, feedback.misspelled_words)}
          </div>
        )}
      </div>

      {feedback && (
        <div className={`feedback-section ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className={`feedback-title ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>
          <div className="feedback-message">{feedback.message}</div>
          {showAnswer && feedback.correct_answer && (
            <div className="correct-answer">
              <div className="correct-answer-title">Correct Answer:</div>
              <div className="correct-answer-text">{feedback.correct_answer}</div>
            </div>
          )}
        </div>
      )}

      <div className="button-section">
        {!feedback ? (
          <button
            className="btn-next"
            onClick={handleTextSubmit}
            disabled={!typedAnswer.trim() || isLoading}
          >
            {isLoading ? 'CHECKING...' : 'CHECK ANSWER'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '15px' }}>
            {!feedback.isCorrect && (
              <button className="btn-try-again" onClick={handleTryAgain}>
                TRY AGAIN
              </button>
            )}
            <button className="btn-proceed" onClick={handleProceedToNext}>
              NEXT QUESTION
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// --- Helper function for highlighting misspelled words ---
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