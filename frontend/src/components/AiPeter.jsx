import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStop, FaPlay } from "react-icons/fa";

function AIVoiceAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(9);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // LiveKit refs
  const roomRef = useRef(null);
  const tokenRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  // Story questions for reference
  const questions = [
    "What is the title of this story?",
    "Who is the author of this story?", 
    "What genre is this story - Fiction or Non-Fiction?",
    "Who are the main characters in this story?",
    "Where does the story take place?",
    "What are three important events that happen in the story?",
    "What is the problem or conflict in the story?",
    "Who is your favorite character and why?",
    "What lesson or moral does this story teach us?"
  ];

  const connectToLiveKit = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Get LiveKit token from backend
      const response = await fetch('http://localhost:8000/voice_assistant/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: 'student-' + Math.random().toString(36).substr(2, 9),
          room: 'goldilocks-story-' + Date.now()
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.warn('LiveKit token error:', data.message);
        // Use fallback mode
        setIsConnected(true);
        setConnectionStatus('connected');
        setFeedback("Hi! I'm Storyteller, your reading companion. We're going to talk about 'Goldilocks and the Three Bears'. Click the microphone to answer my questions!");
        return;
      }

      // If we have LiveKit configured, try to connect
      if (data.token && data.token !== 'mock_token_for_development') {
        await connectWithLiveKit(data.token, data.url, data.room);
      } else {
        // Fallback mode
        setIsConnected(true);
        setConnectionStatus('connected');
        setFeedback("Hi! I'm Storyteller, your reading companion. We're going to talk about 'Goldilocks and the Three Bears'. Click the microphone to answer my questions!");
      }

    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('error');
      setFeedback(`Connection failed: ${error.message}. Using offline mode - you can still practice the questions!`);
      
      // Enable offline mode
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setCurrentQuestion(1);
      }, 2000);
    }
  };

  const connectWithLiveKit = async (token, wsUrl, roomName) => {
    try {
      // This would be where you'd implement actual LiveKit connection
      // For now, we'll simulate it
      console.log('Connecting to LiveKit:', { token, wsUrl, roomName });
      
      // Simulate connection
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setFeedback("Great! I'm connected and ready to help you with the Goldilocks story. Let's start with question 1: " + questions[0]);
      }, 1500);
      
    } catch (error) {
      console.error('LiveKit connection failed:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    if (!isConnected) return;
    
    try {
      setIsRecording(true);
      setTranscript('');
      
      // Request microphone permission
      if (!audioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioEnabled(true);
        localAudioTrackRef.current = stream;
      }
      
      // Simulate speech recognition for demo
      // In production, this would be handled by LiveKit + your agent
      setTimeout(() => {
        const sampleResponses = [
          "Goldilocks and the Three Bears",
          "I think it's a folk tale or fairy tale",
          "It's fiction because it's a made-up story",
          "Goldilocks, Papa Bear, Mama Bear, and Baby Bear",
          "In the forest at the bears' house",
          "Goldilocks ate their porridge, sat in their chairs, and slept in their beds",
          "The problem is Goldilocks went into someone's house without permission",
          "I like Baby Bear because he's small like me",
          "The lesson is to always ask permission before using someone else's things"
        ];
        
        const responseIndex = Math.min(currentQuestion - 1, sampleResponses.length - 1);
        const response = sampleResponses[responseIndex];
        setTranscript(`You said: "${response}"`);
        
        // Simulate AI feedback
        setTimeout(() => {
          const feedbackResponses = [
            "Excellent! That's exactly right - the title is 'Goldilocks and the Three Bears'.",
            "Good thinking! This is indeed a traditional folk tale.",
            "Perfect! You're right, it's fiction because it's an imaginary story.",
            "Wonderful! You remembered all the main characters.",
            "Great job! The story does take place in the bears' house in the forest.",
            "Excellent memory! Those are indeed the three main events in the story.",
            "Very thoughtful! You understood the main conflict in the story.",
            "That's a great choice! Baby Bear is a sweet character.",
            "What a wise answer! That's exactly the lesson this story teaches us."
          ];
          
          const feedbackIndex = Math.min(currentQuestion - 1, feedbackResponses.length - 1);
          setFeedback(feedbackResponses[feedbackIndex]);
        }, 1000);
        
      }, 2000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback('Sorry, I had trouble accessing your microphone. Please make sure microphone access is allowed.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // In production, this would stop the LiveKit audio capture
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setTranscript('');
      
      const nextQuestionText = `Great! Let's move on to question ${currentQuestion + 1}: ${questions[currentQuestion]}`;
      setFeedback(nextQuestionText);
    } else {
      setFeedback("Fantastic work! You've completed all the questions about 'Goldilocks and the Three Bears'. You did a great job understanding the story!");
    }
  };

  const handleFinish = () => {
    setFeedback("Congratulations! You've successfully completed the Goldilocks story discussion. You showed great understanding of the story!");
    // Here you could navigate to a completion page or reset
  };

  const dismissInstructions = () => {
    setShowInstructions(false);
    if (!isConnected) {
      connectToLiveKit();
    }
  };

  const playAudio = () => {
    // This would trigger TTS playback in a real implementation
    console.log('Playing audio feedback:', feedback);
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
          height: 200px;
          background: linear-gradient(135deg, #8fbc8f 0%, #567c3e 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 80px;
          margin-bottom: 0;
        }
        
        .banner-title {
          font-family: 'Sen', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .activity-indicator {
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 20px;
          font-family: 'Sen', sans-serif;
          font-weight: 600;
          color: #2d5016;
          font-size: 14px;
        }
        
        .main-content {
          flex: 1;
          padding: 40px 60px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 60px;
          min-height: 0;
        }

        .content-section {
          flex: 1;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
       
        .book-image-section {
          flex: 0 0 auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
       
        .book-cover {
          width: 280px;
          height: 350px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
        }

        .book-cover:hover {
          transform: translateY(-5px);
        }
       
        .voice-interface-section {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-bottom: 5px solid #8fbc8f;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          font-family: 'Sen', sans-serif;
          font-weight: 600;
          font-size: 14px;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${connectionStatus === 'connected' ? '#28a745' : 
                        connectionStatus === 'connecting' ? '#ffc107' : '#dc3545'};
          animation: ${connectionStatus === 'connecting' ? 'pulse 1s infinite' : 'none'};
        }

        .question-progress {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 25px;
          text-align: center;
          font-family: 'Sen', sans-serif;
          border-left: 4px solid #8fbc8f;
        }

        .question-number {
          font-size: 18px;
          font-weight: 800;
          color: #2d5016;
          margin-bottom: 8px;
        }

        .current-question {
          font-size: 16px;
          color: #555;
          font-weight: 600;
        }

        .voice-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin: 30px 0;
        }

        .mic-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 24px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .mic-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          border-radius: 50%;
          z-index: -1;
        }

        .mic-button.recording {
          background: #dc3545;
          animation: recording-pulse 1.5s ease-in-out infinite;
        }

        .mic-button.idle {
          background: #28a745;
        }

        .mic-button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .mic-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .audio-play-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 18px;
          color: white;
          background: #6c757d;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .audio-play-button:hover {
          background: #5a6268;
          transform: scale(1.05);
        }

        @keyframes recording-pulse {
          0% { transform: scale(1); box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(220, 53, 69, 0.6); }
          100% { transform: scale(1); box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .instructions-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .instructions-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          margin: 20px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .instructions-title {
          font-family: 'Sen', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #2d5016;
          margin-bottom: 20px;
        }

        .instructions-text {
          font-family: 'Sen', sans-serif;
          font-size: 16px;
          color: #333;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .instructions-text ul {
          text-align: left;
          margin-top: 15px;
        }

        .instructions-text li {
          margin-bottom: 8px;
        }

        .btn-start {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-family: 'Sen', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }

        .feedback-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          padding: 25px;
          margin: 20px 0;
          min-height: 120px;
          border-left: 4px solid #28a745;
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .feedback-title {
          font-family: 'Sen', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #2d5016;
        }

        .feedback-text {
          font-family: 'Sen', sans-serif;
          font-size: 16px;
          color: #333;
          line-height: 1.6;
        }

        .transcript-section {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 15px 0;
          border: 1px solid #28a745;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
        }

        .transcript-text {
          font-family: 'Sen', sans-serif;
          font-size: 15px;
          color: #155724;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 30px;
        }

        .btn-next, .btn-finish {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

        .btn-finish {
          background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-next:hover, .btn-finish:hover {
          transform: translateY(-2px);
        }

        .btn-next:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .recording-indicator {
          text-align: center;
          color: #dc3545;
          font-weight: bold;
          font-family: 'Sen', sans-serif;
          margin-top: 15px;
          animation: pulse 1s infinite;
        }

        .footer-section {
          width: 100%;
          height: 80px;
          background: linear-gradient(135deg, #567c3e 0%, #2d5016 100%);
          margin-top: auto;
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1024px) {
          .main-content {
            padding: 30px 40px;
            gap: 40px;
          }
          
          .book-cover {
            width: 240px;
            height: 300px;
          }
          
          .banner-title {
            font-size: 36px;
          }
          
          .banner-section {
            padding: 0 40px;
          }
        }
        
        @media (max-width: 768px) {
          .main-content {
            flex-direction: column;
            padding: 20px;
            gap: 30px;
            align-items: center;
          }
          
          .book-image-section {
            order: 1;
            margin-top: 0;
          }
          
          .book-cover {
            width: 100%;
            max-width: 280px;
            height: auto;
            aspect-ratio: 4/5;
          }
          
          .content-section {
            order: 2;
            max-width: 100%;
            width: 100%;
          }
          
          .voice-interface-section {
            padding: 30px 25px;
          }
          
          .banner-title {
            font-size: 28px;
          }
          
          .banner-section {
            padding: 0 30px;
            height: 160px;
          }

          .mic-button {
            width: 70px;
            height: 70px;
            font-size: 20px;
          }

          .instructions-content {
            padding: 30px 20px;
            margin: 15px;
          }

          .instructions-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 15px;
            gap: 20px;
          }
          
          .voice-interface-section {
            padding: 25px 20px;
          }
          
          .banner-title {
            font-size: 22px;
          }
          
          .banner-section {
            padding: 0 20px;
            height: 140px;
          }

          .mic-button {
            width: 60px;
            height: 60px;
            font-size: 18px;
          }

          .instructions-content {
            padding: 25px 15px;
          }

          .instructions-title {
            font-size: 20px;
          }

          .instructions-text {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="banner-section">        
        <h1 className="banner-title">AI Voice Tutor</h1>
        <div className="activity-indicator">
          Oral Interaction
        </div>
      </div>

      {showInstructions && (
        <div className="instructions-modal">
          <div className="instructions-content">
            <h2 className="instructions-title">Welcome to AI Voice Tutor!</h2>
            <div className="instructions-text">
              <p>I'm Storyteller, your reading companion! We'll talk about "Goldilocks and the Three Bears" together.</p>
              <p><strong>How it works:</strong></p>
              <ul>
                <li>I'll ask you questions about the story</li>
                <li>Click the green microphone to record your answer</li>
                <li>I'll give you feedback on what you said</li>
                <li>We'll work through 9 questions together</li>
              </ul>
              <p style={{marginTop: '20px', color: '#007bff', fontWeight: '600'}}>
                Make sure your microphone is working and you're in a quiet place!
              </p>
            </div>
            <button className="btn-start" onClick={dismissInstructions}>
              🎤 Start Voice Session
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="book-image-section">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '280px',
              height: '350px',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4a 50%, #f39c12 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              border: '3px solid #e67e22',
              fontFamily: "'Comic Neue', cursive"
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#8b4513',
                textAlign: 'center',
                padding: '20px',
                lineHeight: '1.2'
              }}>
                Goldilocks<br/>
                and the<br/>
                Three Bears
              </div>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#fff',
                borderRadius: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px 0',
                border: '3px solid #e67e22'
              }}>
                <span style={{ fontSize: '60px' }}>🐻</span>
              </div>
              <div style={{
                fontSize: '16px',
                color: '#8b4513',
                fontWeight: '600'
              }}>
                A Classic Tale
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="voice-interface-section">
            <div className="connection-status">
              <div className="status-indicator"></div>
              <span>
                {connectionStatus === 'connected' ? '🤖 Connected to AI Storyteller' :
                 connectionStatus === 'connecting' ? '⏳ Connecting to AI Tutor...' :
                 connectionStatus === 'error' ? '❌ Connection Error' : '⚪ Not Connected'}
              </span>
            </div>

            {isConnected && (
              <div className="question-progress">
                <div className="question-number">
                  Question {currentQuestion} of {totalQuestions}
                </div>
                <div className="current-question">
                  {questions[currentQuestion - 1]}
                </div>
              </div>
            )}

            <div className="voice-controls">
              <button 
                className={`mic-button ${isRecording ? 'recording' : 'idle'}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
                title={isRecording ? "Click to stop recording" : "Click to start recording"}
              >
                {isRecording ? <FaStop /> : <FaMicrophone />}
              </button>
              
              {feedback && (
                <button 
                  className="audio-play-button"
                  onClick={playAudio}
                  title="Play audio feedback"
                >
                  <FaPlay />
                </button>
              )}
            </div>

            {isRecording && (
              <div className="recording-indicator">
                🔴 Recording... Click stop when finished speaking
              </div>
            )}

            {transcript && (
              <div className="transcript-section">
                <div className="transcript-text">✅ {transcript}</div>
              </div>
            )}

            {feedback && (
              <div className="feedback-section">
                <div className="feedback-header">
                  <div className="feedback-title">🤖 AI Storyteller Says:</div>
                </div>
                <div className="feedback-text">{feedback}</div>
              </div>
            )}

            {isConnected && (
              <div className="action-buttons">
                {currentQuestion < totalQuestions ? (
                  <button 
                    className="btn-next"
                    onClick={handleNextQuestion}
                    disabled={!transcript}
                  >
                    ➡️ Next Question
                  </button>
                ) : (
                  <button 
                    className="btn-finish"
                    onClick={handleFinish}
                  >
                    🎉 Finish Activity
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="footer-section"></div>
    </div>
  );
}

// Default export
export default AIVoiceAgent;

