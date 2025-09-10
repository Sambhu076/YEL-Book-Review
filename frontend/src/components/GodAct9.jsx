import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaRedo } from "react-icons/fa"; // Updated Icons
import Header from "./Header";
// Note: SpeechRecognition is not used in this component as per the previous refactor.

export default function GodAct9() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [starRating, setStarRating] = useState(0);
  const [ratingExplanation, setRatingExplanation] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  // Voice state variables (Standardized)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
  const VOICE_ID = 'pqHfZKP75CvOlQylNhV4';

  // --- AUDIO & HELPER FUNCTIONS (Standardized from GodAct5) ---
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


  // --- COMPONENT LOGIC ---
  useEffect(() => {
    const playRatingAudio = () => {
      const audio = new Audio('/rate.mp3');
      audio.play().catch(() => {
        console.warn("Audio autoplay blocked.");
        setShowPlayButton(true);
      });
    };
    const timer = setTimeout(playRatingAudio, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleManualPlay = () => {
    setShowPlayButton(false);
    const audio = new Audio('/rate.mp3');
    audio.play().catch(e => console.error("Manual audio play failed", e));
  };
  
  const handleStarClick = (rating) => {
    setStarRating(rating);
  };

  const handleSubmitReview = () => {
    if (starRating > 0 && ratingExplanation.trim()) {
      setIsLoading(true);
      let feedbackMessage = "";
      let feedbackType = "excellent";
      
      if (starRating >= 4) {
        feedbackMessage = `Thank you for your wonderful ${starRating}-star review! It's great to hear you enjoyed the book so much.`;
        feedbackType = "excellent";
      } else if (starRating === 3) {
        feedbackMessage = `Thank you for your honest ${starRating}-star review! Your feedback is valuable.`;
        feedbackType = "good";
      } else {
        feedbackMessage = `Thank you for your ${starRating}-star review and for sharing your thoughts.`;
        feedbackType = "good";
      }

      setFeedback({ message: feedbackMessage, feedback_type: feedbackType });
      
      setTimeout(() => speakText(feedbackMessage), 300);
      setIsLoading(false);
    } else {
      alert('Please select a star rating and explain why before proceeding.');
    }
  };

  const handleFinish = () => {
    stopSpeaking();
    navigate('/');
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
           /* All CSS from previous components is assumed here, plus specific styles for this component */
           @import url('https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap');
           @import url('https://fonts.googleapis.com/css2?family=Sen:wght@400;600;800&display=swap');
           
           .banner-section { position: relative; width: 100%; height: auto; }
           .banner-img { width: 100%; height: auto; object-fit: cover; }
           
           .audio-play-button {
             position: absolute; top: 20px; right: 20px; background: rgba(35, 167, 172, 0.9);
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
          .field-subtitle {
            font-family: 'Sen', sans-serif; font-size: 12px; font-weight: 600; color: #ff9500;
            background-color: #fff3d4; padding: 8px 12px; border-radius: 6px; margin-bottom: 20px;
            text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;
          }
          .star-rating { display: flex; gap: 8px; margin-bottom: 25px; justify-content: center; }
          .star { background: none; border: none; font-size: 40px; cursor: pointer; transition: all 0.3s ease; }
          .star.outline { color: #ddd; }
          .star.filled { color: #ffd700; text-shadow: 0 0 8px rgba(255, 215, 0, 0.3); }
          .star:hover { transform: scale(1.2); }
          .rating-label { font-family: 'Sen', sans-serif; font-size: 18px; font-weight: 600; color: #333; margin-bottom: 15px; display: block; }
          .answer-textarea {
            width: 100%; padding: 18px 24px; font-size: 16px; border: 2px solid #e0e0e0; border-radius: 12px;
            font-family: 'Segoe UI', sans-serif; background-color: #f8f9fa; transition: all 0.3s ease;
            box-sizing: border-box; resize: vertical; min-height: 100px;
          }
          .answer-textarea:focus { outline: none; border-color: #5bc0de; background-color: white; box-shadow: 0 0 0 3px rgba(91, 192, 222, 0.1); }
          .button-section { display: flex; justify-content: flex-end; gap: 15px; }
          .btn-next, .btn-proceed {
            color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Sen', sans-serif;
            font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase;
          }
          .btn-next { background: #23A7AC; box-shadow: 0 4px 12px rgba(35, 167, 172, 0.3); }
          .btn-next:hover:not(:disabled) { background: #1e8a8f; transform: translateY(-2px); }
          .btn-next:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }
          .btn-proceed { background: #28a745; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3); }
          .btn-proceed:hover { background: #218838; transform: translateY(-2px); }
          .feedback-section {
            background: white; border-radius: 20px; margin-top: 20px; padding: 30px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); border-left: 5px solid; position: relative;
          }
          .feedback-section.excellent { border-left-color: #28a745; }
          .feedback-section.good { border-left-color: #17a2b8; }
          .feedback-title { font-family: 'Sen', sans-serif; font-size: 24px; font-weight: 600; margin-bottom: 15px; }
          .feedback-title.excellent { color: #28a745; }
          .feedback-title.good { color: #17a2b8; }
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
          <img src="/b9.png" alt="Banner Background" className="banner-img" />
          {showPlayButton && (
            <button className="audio-play-button" onClick={handleManualPlay} title="Click to play audio introduction">
              <FaPlay />
            </button>
          )}
      </div>
        
      <div className="main-content">
         <div className="book-image-section">
           <img src="/goldilocks.png" alt="Book Cover" className="book-cover" />
         </div>

         <div className="content-with-button">
           <div className="question-section">
             <div className="answer-field">
               <div className="field-subtitle">RATE THE BOOK</div>
               <div className="star-rating">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button key={star} className={`star ${starRating >= star ? 'filled' : 'outline'}`} onClick={() => handleStarClick(star)}>★</button>
                 ))}
               </div>
               <label className="rating-label">Why I gave this rating</label>
               <textarea
                 className="answer-textarea"
                 placeholder="type answer here"
                 value={ratingExplanation}
                 onChange={(e) => setRatingExplanation(e.target.value)}
                 rows="4"
                 disabled={!!feedback}
               />
             </div>
           </div>

           {feedback && (
             <div className={`feedback-section ${feedback.feedback_type}`}>
               <button className={`voice-replay-button ${isSpeaking ? 'speaking' : ''}`} onClick={() => isSpeaking ? stopSpeaking() : speakText(feedback.message)} title={isSpeaking ? "Stop speaking" : "Replay feedback"}>
                 {isSpeaking ? '⏹️ Stop' : '🔊 Replay'}
               </button>
               <div className={`feedback-title ${feedback.feedback_type}`}>
                 ✓ Thank you for your feedback!
               </div>
               <div className="feedback-message">{feedback.message}</div>
             </div>
           )}

           <div className="button-section">
             {!feedback ? (
               <button className="btn-next" onClick={handleSubmitReview} disabled={!ratingExplanation.trim() || starRating === 0 || isLoading}>
                 {isLoading ? <><span className="loading-spinner"></span>SUBMITTING...</> : 'SUBMIT REVIEW'}
               </button>
             ) : (
               <button className="btn-proceed" onClick={handleFinish}>FINISH</button>
             )}
           </div>
         </div>
      </div>

      <div className="footer-section">
        <img src="/footer.png" alt="Footer" className="footer-img"/>
      </div>
    </div>
  );
}