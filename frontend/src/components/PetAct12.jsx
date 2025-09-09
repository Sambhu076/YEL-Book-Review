import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import Header from "./Header";

export default function PetAct12() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(12);
  const [characterAnswer, setCharacterAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  
  // Voice state variables
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  
  const totalQuestions = 15;

  // ElevenLabs configuration
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'your-api-key-here';
  const VOICE_ID = 'pqHfZKP75CvOlQylNhV4';

  // Enhanced audio functionality for introduction
  useEffect(() => {
    const playIntroAudio = () => {
      try {
        const audio = new Audio('/favour.mp3'); // Audio for question 12
        audio.volume = 0.7;
        
        audio.addEventListener('ended', () => setAudioPlayed(true));
        audio.addEventListener('error', () => setShowPlayButton(true));
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setAudioPlayed(false))
            .catch(() => setShowPlayButton(true));
        }
        return audio;
      } catch (error) {
        console.error('Error setting up intro audio:', error);
        setShowPlayButton(true);
        return null;
      }
    };

    const timer = setTimeout(playIntroAudio, 800);
    return () => clearTimeout(timer);
  }, []);

  // Voice initialization
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
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
      const audio = new Audio('/favour.mp3');
      audio.volume = 0.7;
      audio.addEventListener('ended', () => {
        setAudioPlayed(true);
        setShowPlayButton(false);
      });
      audio.play().then(() => setShowPlayButton(false));
    } catch (error) {
      console.error('Error in manual play:', error);
    }
  };

  // ElevenLabs speech function
  const speakWithElevenLabs = async (text) => {
    if (!voiceEnabled || !text || !ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your-api-key-here') {
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
      };
      
      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      speakWithBrowserSynthesis(text);
    }
  };

  // Browser speech synthesis
  const speakWithBrowserSynthesis = (text) => {
    window.speechSynthesis.cancel();
    if (!voiceEnabled || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Female') || v.lang.startsWith('en')) || voices[0];
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speakText = (text) => {
    if (useElevenLabs) {
      speakWithElevenLabs(text);
    } else {
      speakWithBrowserSynthesis(text);
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Submit answer with voice feedback
  const submitAnswer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/check-peter-question12/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: characterAnswer.trim() })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.error) {
        setFeedback({ message: data.error, isCorrect: false });
      } else {
        setFeedback(data);
        setShowAnswer(data.show_answer);
        setTimeout(() => {
          let voiceText = data.isCorrect ? `Excellent! ${data.message}` : `Not quite right. ${data.message}`;
          if (!data.isCorrect && data.correct_answer && data.show_answer) {
            voiceText += ` The correct answer is: ${data.correct_answer}`;
          }
          speakText(voiceText);
        }, 500);
      }
    } catch (error) {
      console.error('Network error:', error);
      setFeedback({ message: 'Network error. Please check your connection and try again.', isCorrect: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (characterAnswer.trim()) {
      submitAnswer();
    } else {
      alert('Please enter an answer before proceeding.');
    }
  };

  const handleProceedToNext = () => {
    stopSpeaking();
    navigate('/PetAct13'); // Navigate to the next question
  };

  const handleTryAgain = () => {
    stopSpeaking();
    setCharacterAnswer('');
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
          @import url('https://fonts.googleapis.com/css2?family=Sen:wght@400;600;800&display=swap');
          .banner-section { position: relative; width: 100%; }
          .banner-img { width: 100%; height: auto; object-fit: cover; }
          .banner-content { position: absolute; top: 50%; left: 80px; transform: translateY(-50%); }
          .banner-title { font-family: 'Gulten', sans-serif; font-size: 48px; font-weight: 800; color: #2c5f7c; margin: 0; }
          .question-indicator { position: absolute; top: 50%; right: 80px; transform: translateY(-50%); background: rgba(255, 255, 255, 0.9); padding: 8px 16px; border-radius: 20px; font-family: 'Sen', sans-serif; font-weight: 600; color: #2c5f7c; font-size: 14px; }
          .audio-play-button { position: absolute; top: 20px; right: 20px; background: rgba(91, 192, 222, 0.9); border: none; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; z-index: 10; color: white; font-size: 18px; box-shadow: 0 4px 12px rgba(91, 192, 222, 0.3); }
          .audio-play-button:hover { transform: scale(1.1); }
          .voice-toggle-button { position: absolute; top: 20px; right: 80px;display: none; background: ${voiceEnabled ? '#28a745' : '#dc3545'}; border: none; border-radius: 20px; padding: 8px 16px; color: white; font-size: 12px; cursor: pointer; font-family: 'Sen', sans-serif; font-weight: 600; z-index: 10; }
          .main-content { flex: 1; padding: 40px 60px; display: flex; align-items: center; justify-content: center; gap: 120px; }
          .book-image-section { flex: 0 0 auto; }
          .book-cover { width: 280px; height: 350px; border-radius: 15px; object-fit: cover; }
          .content-with-button { flex: 1; max-width: 650px; display: flex; flex-direction: column; gap: 20px; }
          .question-section { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-bottom: 5px solid #ffd700; }
          .field-label { font-family: 'Sen', sans-serif; font-size: 24px; font-weight: 600; color: #333; margin-bottom: 15px; display: block; }
          .answer-input { width: 100%; padding: 18px 24px; font-size: 16px; border: 2px solid #e0e0e0; border-radius: 12px; background-color: #f8f9fa; transition: all 0.3s ease; box-sizing: border-box; }
          .answer-input:focus { outline: none; border-color: #5bc0de; box-shadow: 0 0 0 3px rgba(91, 192, 222, 0.1); }
          .button-section { display: flex; justify-content: flex-end; gap: 15px; }
          .btn-next, .btn-try-again, .btn-proceed { border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Sen', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; }
          .btn-next { background: #5bc0de; color: white; box-shadow: 0 4px 12px rgba(91, 192, 222, 0.3); }
          .btn-next:hover { background: #46a8c7; transform: translateY(-2px); }
          .btn-next:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
          .btn-try-again { background: #dc3545; color: white; }
          .btn-proceed { background: #28a745; color: white; }
          .feedback-section { background: white; border-radius: 20px; margin-top: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-left: 5px solid; position: relative; }
          .feedback-section.correct { border-left-color: #28a745; }
          .feedback-section.incorrect { border-left-color: #dc3545; }
          .feedback-title { font-family: 'Sen', sans-serif; font-size: 24px; font-weight: 600; margin-bottom: 15px; }
          .feedback-title.correct { color: #28a745; }
          .feedback-title.incorrect { color: #dc3545; }
          .feedback-message { font-family: 'Sen', sans-serif; font-size: 16px; color: #333; margin-bottom: 20px; }
          .correct-answer { background: #e8f5e8; border: 1px solid #28a745; border-radius: 10px; padding: 15px; margin-top: 15px; }
          .correct-answer-title { font-weight: 600; color: #28a745; margin-bottom: 8px; }
          .voice-replay-button { position: absolute; top: 15px; right: 15px; background: rgba(91, 192, 222, 0.1); border: 1px solid #5bc0de; border-radius: 20px; padding: 6px 12px; color: #5bc0de; font-size: 12px; cursor: pointer; }
          .loading-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: spin 1s ease-in-out infinite; margin-right: 8px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .footer-section { width: 100%; height: 120px; position: relative; overflow: hidden; flex-shrink: 0; }
          .footer-img { width: 100%; height: 120px; object-fit: cover; display: block; }
          
          /* RESPONSIVE DESIGN - COMPREHENSIVE MOBILE OPTIMIZATION */
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
              flex: 0 0 auto;
              margin-top: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
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
              text-align: center;
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

            .field-label {
              font-size: 15px;
            }
          }
        `}
      </style>

      <Header />
      
      <div className="banner-section">
        <img src="/banner.png" alt="Banner" className="banner-img" />
        <div className="banner-content">
          <h1 className="banner-title">My Favourite Character</h1>
        </div>
        <div className="question-indicator">QUESTION {currentQuestion}/{totalQuestions}</div>
        <button className="voice-toggle-button" onClick={() => setVoiceEnabled(!voiceEnabled)}>
          {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
        </button>
        {showPlayButton && (
          <button className="audio-play-button" onClick={handleManualPlay} title="Play audio">
            <FaPlay />
          </button>
        )}
      </div>

      <div className="main-content">
        <div className="book-image-section">
          <img src="/peterrabbit.svg" alt="Peter Rabbit Book" className="book-cover" />
        </div>

        <div className="content-with-button">
          <div className="question-section">
            <div className="answer-field">
              <div className="field-label">Who was your favourite character and why?</div>
              <input
                className="answer-input"
                placeholder="type answer here"
                value={characterAnswer}
                onChange={(e) => setCharacterAnswer(e.target.value)}
                disabled={isLoading || feedback}
              />
            </div>
          </div>

          {feedback && (
            <div className={`feedback-section ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
              <button className="voice-replay-button" onClick={() => speakText(feedback.message)}>
                {isSpeaking ? '⏹️' : '🔊 Replay'}
              </button>
              <div className={`feedback-title ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                {feedback.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="feedback-message">{feedback.message}</div>
              {showAnswer && feedback.correct_answer && (
                <div className="correct-answer">
                  <div className="correct-answer-title">Correct Answer:</div>
                  <div>{feedback.correct_answer}</div>
                </div>
              )}
            </div>
          )}

          <div className="button-section">
            {!feedback ? (
              <button className="btn-next" onClick={handleNextQuestion} disabled={!characterAnswer.trim() || isLoading}>
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
        </div>
      </div>

      <div className="footer-section">
        <img src="/footer.png" alt="Footer" className="footer-img" />
      </div>
    </div>
  );
}