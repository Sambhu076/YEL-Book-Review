import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";

// Page Components
const PageCover = React.forwardRef(({ title, subtitle, className = '', backgroundImage, children }, ref) => (
  <div
    className={`page page-cover ${className}`}
    ref={ref}
    data-density="hard"
    style={backgroundImage ? { 
      backgroundImage: `url(${backgroundImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    } : {}}
  >
    {children}
  </div>
));

const ImagePage = React.forwardRef(({ content, pageNumber, onPlayAudio, isAudioPlaying, currentAudioPage }, ref) => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const handlePlayAudio = (e) => {
    e.stopPropagation();
    if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    setIsButtonClicked(true);
    setTimeout(() => setIsButtonClicked(false), 500);
    onPlayAudio(pageNumber);
  };

  const preventFlipEvent = (e) => {
    e.stopPropagation();
    if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    e.preventDefault();
    setIsButtonClicked(true);
  };

  const handlePageClick = (e) => {
    const button = e.target.closest('.audio-play-button, .audio-button-wrapper');
    if (button || isButtonClicked) {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      e.preventDefault();
    }
  };

  const handlePageMouseMove = (e) => {
    if (isButtonClicked) {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      e.preventDefault();
    }
  };

  return (
    <div 
      className="page image-page" 
      ref={ref}
      onClick={handlePageClick}
      onMouseDown={handlePageClick}
      onMouseMove={handlePageMouseMove}
      onMouseLeave={() => setIsButtonClicked(false)}
    >
      <div className="page-content">
        <div className="story-illustration-full">
          <img 
            src={content.illustration} 
            alt={content.alt}
            className="story-image-full"
            loading="lazy"
          />
        </div>
        <div className="page-number" style={{ 
          position: 'absolute',
          left: '20px', 
          bottom: '15px',
          fontSize: '0.9rem',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 100
        }}>
          {pageNumber}
        </div>
      </div>
    </div>
  );
});

const TextPage = React.forwardRef(({ content, pageNumber, onPlayAudio, isAudioPlaying, currentAudioPage }, ref) => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const handlePlayAudio = (e) => {
    e.stopPropagation();
    if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    setIsButtonClicked(true);
    setTimeout(() => setIsButtonClicked(false), 500);
    onPlayAudio(pageNumber);
  };

  const preventFlipEvent = (e) => {
    e.stopPropagation();
    if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    e.preventDefault();
    setIsButtonClicked(true);
  };

  const handlePageClick = (e) => {
    const button = e.target.closest('.audio-play-button, .audio-button-wrapper');
    if (button || isButtonClicked) {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      e.preventDefault();
    }
  };

  const handlePageMouseMove = (e) => {
    if (isButtonClicked) {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      e.preventDefault();
    }
  };

  return (
    <div 
      className="page text-page" 
      ref={ref}
      onClick={handlePageClick}
      onMouseDown={handlePageClick}
      onMouseMove={handlePageMouseMove}
      onMouseLeave={() => setIsButtonClicked(false)}
    >
      <div className="page-content">
        {content.characterNames && (
          <div className="character-names">
            {content.characterNames.map((name, idx) => (
              <div key={idx} className="character-name">{name}</div>
            ))}
          </div>
        )}
        <div className="story-text-content">
          <p className="story-text">{content.text}</p>
          {content.subText && (
            <p className="story-subtext">{content.subText}</p>
          )}
        </div>
        {content.isEnd && (
          <div className="story-end">THE END</div>
        )}
        <div className="page-number" style={{ 
          position: 'absolute',
          right: '20px', 
          bottom: '15px',
          fontSize: '0.9rem',
          color: '#2d5016',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 100
        }}>
          {pageNumber}
        </div>
        
        {/* Audio Play Button - UPDATED TO MATCH GOLDILOCKS FUNCTIONALITY */}
        <div 
          className="audio-button-wrapper"
          onClick={handlePlayAudio}
          onMouseDown={preventFlipEvent}
          onMouseUp={preventFlipEvent}
          onMouseMove={preventFlipEvent}
          onMouseEnter={preventFlipEvent}
          onMouseLeave={preventFlipEvent}
          onTouchStart={preventFlipEvent}
          onTouchEnd={preventFlipEvent}
          onTouchMove={preventFlipEvent}
          onPointerDown={preventFlipEvent}
          onPointerUp={preventFlipEvent}
          onPointerMove={preventFlipEvent}
          onDrag={preventFlipEvent}
          onDragStart={preventFlipEvent}
          onDragEnd={preventFlipEvent}
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '60px',
            width: '40px',
            height: '40px',
            zIndex: 1000,
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          <button
            className={`audio-play-button ${isAudioPlaying && currentAudioPage === pageNumber ? 'playing' : ''}`}
            aria-label={`${isAudioPlaying && currentAudioPage === pageNumber ? 'Stop' : 'Play'} audio for page ${pageNumber}`}
            title={`${isAudioPlaying && currentAudioPage === pageNumber ? 'Stop' : 'Play'} page audio`}
            style={{ 
              position: 'relative',
              width: '100%',
              height: '100%',
              top: 0,
              right: 0,
              zIndex: 1001
            }}
          >
            {isAudioPlaying && currentAudioPage === pageNumber ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// Story Content Array (condensed to 5.5 spreads for 13 total pages)
const STORY_SPREADS = [
  {
    illustration: "https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.07.50_521b0fb4.jpg?updatedAt=1756750100827",
    alt: "The four little rabbits",
    text: "Once upon a time there were four little Rabbits, and their names were Flopsy, Mopsy, Cotton-tail, and Peter. They lived with their Mother in a sand-bank, underneath the root of a very big fir-tree. One morning old Mrs. Rabbit said, 'Now my dears, you may go into the fields or down the lane, but don't go into Mr. McGregor's garden: your Father had an accident there; he was put in a pie by Mrs. McGregor.'",
    characterNames: ["Flopsy,", "Mopsy,", "Cotton-tail,", "and Peter."]
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.07.51_c8bd096b.jpg?updatedAt=1756750086339",
    alt: "The good little bunnies and naughty Peter",
    text: "'Now run along, and don't get into mischief. I am going out.' Then old Mrs. Rabbit took a basket and her umbrella, and went through the wood to the baker's. Flopsy, Mopsy, and Cotton-tail, who were good little bunnies, went down the lane to gather blackberries. But Peter, who was very naughty, ran straight away to Mr. McGregor's garden, and squeezed under the gate!",
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.08.02_aac318ed.jpg?updatedAt=1756750148925",
    alt: "Peter meets Mr. McGregor",
    text: "First Peter ate some lettuces and some French beans; and then he ate some radishes; and then, feeling rather sick, he went to look for some parsley. But round the end of a cucumber frame, whom should he meet but Mr. McGregor! Mr. McGregor was on his hands and knees planting out young cabbages, but he jumped up and ran after Peter, waving a rake and calling out, 'Stop thief!'",
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.08.15_0095a633.jpg?updatedAt=1756750185755",
    alt: "Peter caught in the gooseberry net",
    text: "Peter was most dreadfully frightened; he rushed all over the garden, for he had forgotten the way back to the gate. He lost one of his shoes among the cabbages, and the other shoe amongst the potatoes. He ran on four legs and went faster, but unfortunately ran into a gooseberry net, and got caught by the large buttons on his blue jacket. Peter gave himself up for lost, and shed big tears; but his sobs were overheard by some friendly sparrows, who implored him to exert himself.",
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.08.03_a57c3a94.jpg?updatedAt=1756750200764",
    alt: "Peter escaping and resting",
    text: "Mr. McGregor came up with a sieve to pop on top of Peter; but Peter wriggled out just in time, leaving his jacket behind him, and rushed into the tool-shed. Mr. McGregor began to turn over flower-pots, looking under each. Presently Peter sneezed—'Kertyschoo!' Mr. McGregor was after him in no time. Peter jumped out of a window, upsetting three plants. The window was too small for Mr. McGregor, so he went back to his work. Peter sat down to rest; he was out of breath and trembling with fright.",
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.08.15_583a965b.jpg?updatedAt=1756750223251",
    alt: "Peter safe at home",
    text: "Peter peeped over a wheelbarrow and saw Mr. McGregor hoeing onions. His back was turned towards Peter, and beyond him was the gate! Peter got down very quietly and started running as fast as he could go. He slipped underneath the gate, and was safe at last in the wood outside the garden. Peter never stopped running till he got home to the big fir-tree. He was so tired that he flopped down upon the nice soft sand on the floor of the rabbit-hole. Peter was not very well during the evening. His mother put him to bed, and made some camomile tea. But Flopsy, Mopsy, and Cotton-tail had bread and milk and blackberries for supper.",
    isEnd: true
  }
];

export default function PeterRabbitFlipbook() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentAudioPage, setCurrentAudioPage] = useState(null);
  const flipBookRef = useRef();
  const audioRef = useRef();

  useEffect(() => {
    const checkMobile = () => {
      const mobileState = window.innerWidth <= 768;
      if (isMobile !== mobileState) {
        setIsMobile(mobileState);
      }
    };
    checkMobile();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile]);

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = STORY_SPREADS.filter(spread => spread.illustration).map((spread) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = spread.illustration;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
        console.log('All images loaded successfully');
      } catch (error) {
        console.error('Error loading images:', error);
        setImagesLoaded(true); // Continue even if some images fail
      }
    };

    preloadImages();
  }, []);

  const totalBookPages = 14; // Front cover + 12 story pages + back cover

  const handleFlip = (e) => {
    const newPage = e.data;
    setCurrentPage(newPage);
    if (newPage > 0 && !isBookOpen) {
      setIsBookOpen(true);
    }
    const lastPageIndex = flipBookRef.current?.pageFlip()?.getPageCount() - 1;
    if (newPage === lastPageIndex) {
      if (!showQuizButton) {
        setTimeout(() => setShowQuizButton(true), 500);
      }
    }
  };

  const handleOpenBook = () => {
    if (!isBookOpen && flipBookRef.current && flipBookRef.current.pageFlip()) {
      const currentBookPageIdx = flipBookRef.current.pageFlip().getCurrentPageIndex();
      if (currentBookPageIdx === 0) {
        flipBookRef.current.pageFlip().flipNext();
        setIsBookOpen(true);
      }
    }
  };

  const startQuiz = () => navigate('/PetAct1');

  const handlePlayAudio = (pageNumber) => {
    try {
      // Calculate audio file number 
      const audioFileNumber = Math.floor((pageNumber - 1) / 2);
      const audioFileName = `/${audioFileNumber}.mp3`;
      
      if (!audioRef.current || audioRef.current.src !== window.location.origin + audioFileName) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        audioRef.current = new Audio(audioFileName);
        audioRef.current.addEventListener('ended', () => {
          setIsAudioPlaying(false);
          setCurrentAudioPage(null);
        });
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setIsAudioPlaying(false);
          setCurrentAudioPage(null);
          alert(`Audio file not found: ${audioFileName}. Please ensure the file exists in the public folder.`);
        });
      }

      if (isAudioPlaying && currentAudioPage === pageNumber) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsAudioPlaying(false);
        setCurrentAudioPage(null);
      } else {
        if (isAudioPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        setIsAudioPlaying(true);
        setCurrentAudioPage(pageNumber);
        audioRef.current.currentTime = 0;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Playing audio for page ${pageNumber}: ${audioFileName}`);
            })
            .catch((error) => {
              console.error('Audio play failed:', error);
              setIsAudioPlaying(false);
              setCurrentAudioPage(null);
              if (error.name === 'NotAllowedError') {
                alert('Please interact with the page first to enable audio playback.');
              } else {
                alert(`Audio playback failed for ${audioFileName}. Please check if the file exists in the public folder.`);
              }
            });
        }
      }
    } catch (error) {
      console.error('Audio handling error:', error);
      setIsAudioPlaying(false);
      setCurrentAudioPage(null);
    }
  };
  
  // Stop audio when page changes
  useEffect(() => {
    if (isAudioPlaying) {
        audioRef.current?.pause();
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        setIsAudioPlaying(false);
        setCurrentAudioPage(null);
    }
  }, [currentPage]);

  if (!imagesLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading The Tale of Peter Rabbit...</p>
      </div>
    );
  }

  return (
    <div className="flipbook-app">
      <style jsx>{`
        .flipbook-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf8f1 0%, #d4e6c8 100%);
          font-family: 'Georgia', 'Times New Roman', serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .book-title { text-align: center; margin-bottom: 20px; color: #2d5016; }
        .book-title h1 { font-size: 2.5rem; margin-bottom: 0.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
        .book-title p { font-size: 1.2rem; color: #567c3e; font-style: italic; }
        .flipbook-wrapper { width: 100%; max-width: 1100px; height: auto; aspect-ratio: 1100 / 733; display: flex; justify-content: center; align-items: center; margin-bottom: 20px; cursor: ${!isBookOpen ? 'pointer' : 'default'}; }
        .flipbook-instance { width: 100%; height: 100%; box-shadow: 0 10px 25px rgba(45, 80, 22, 0.15); border-radius: 8px; overflow: hidden; }
        
        /* Core page structure - ensure full height usage */
        .page { 
          width: 100%; 
          height: 100%; 
          display: flex; 
          overflow: hidden; 
          background: #faf8f1;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .page-content {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        
        /* Cover page styling */
        .page-cover {
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          background-image: url('https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.07.49_81ccf5b0.jpg?updatedAt=1756750119491');
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #8b4513;
          padding: 0;
          position: relative;
          width: 100%;
          height: 100%;
          margin: 0;
          box-shadow: none !important;
        }

        .page-cover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(250, 248, 241, 0.1);
          z-index: 0;
        }

        .page-cover__content {
          padding: 40px;
          border-radius: 15px;
          text-align: center;
          background: rgba(250, 248, 241, 0.9);
          backdrop-filter: blur(5px);
          border: 2px solid rgba(45, 80, 22, 0.2);
          box-shadow: 0 8px 32px rgba(45, 80, 22, 0.15);
          position: relative;
          z-index: 1;
        }
        
        .cover-title { 
          font-size: 3rem; 
          font-weight: bold; 
          color: #1a3d0f; 
          text-shadow: 2px 2px 4px rgba(255,255,255,0.8); 
          margin-bottom: 1rem;
          letter-spacing: 2px;
        }
        .cover-subtitle { 
          font-size: 1.5rem; 
          color: #2d5016; 
          font-style: italic; 
          text-shadow: 1px 1px 2px rgba(255,255,255,0.8); 
          margin-bottom: 1rem;
        }
        .cover-author { 
          font-size: 1.3rem; 
          color: #3d5a1f; 
          text-shadow: 1px 1px 2px rgba(255,255,255,0.8); 
          font-weight: 600;
          letter-spacing: 1px;
        }
        
        /* Image page - full coverage */
        .image-page .page-content { 
          padding: 0; 
          position: relative;
        }
        .story-illustration-full { 
          position: absolute; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
        }
        .story-image-full { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
        }
        
        /* Text page - maximize content area */
        .text-page .page-content {
          padding: 25px 30px 70px 30px; /* More generous padding, extra bottom for buttons */
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          height: 100%;
          box-sizing: border-box;
          position: relative;
        }
        
        .character-names { 
          text-align: center; 
          font-size: 1.3rem; 
          font-style: italic; 
          color: #6b9dc2; 
          margin: 0 0 25px 0; 
          padding: 20px; 
          background: rgba(107, 157, 194, 0.15); 
          border-radius: 12px; 
          border: 2px solid rgba(107, 157, 194, 0.3);
          flex-shrink: 0;
          font-weight: 500;
        }
        
        .story-text-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly; /* Distribute content evenly */
          padding: 0;
          min-height: 0; /* Allow proper flex behavior */
          background: rgba(255, 255, 255, 0.95);
          border-radius: 0;
          box-shadow: none;
          border: none;
          margin: 0;
          position: absolute;
          top: ${content => content.characterNames ? '90px' : '25px'};
          left: 30px;
          right: 30px;
          bottom: 70px;
        }
        
        .text-page .story-text-content {
          padding: 40px 30px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 0;
          box-shadow: none;
          border: none;
          margin: 0;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-sizing: border-box;
        }
        
        .story-text {
          font-size: 1.25rem;
          line-height: 1.8;
          text-align: left;
          color: #2c3e1d;
          margin-bottom: 15px;
          text-indent: 0;
          font-weight: 400;
          letter-spacing: 0.3px;
          word-spacing: 1px;
        }
        
        .story-subtext {
          font-size: 1.1rem;
          line-height: 1.7;
          text-align: left;
          color: #567c3e;
          font-style: italic;
          border-top: 2px solid rgba(139, 115, 85, 0.3);
          padding-top: 20px;
          margin-top: 20px;
          text-indent: 0;
          letter-spacing: 0.2px;
          word-spacing: 1px;
        }
        
        .story-end { 
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          color: #2d5016;
          margin: 20px 0;
          padding: 20px;
          background: linear-gradient(45deg, rgba(45, 80, 22, 0.2), rgba(143, 188, 143, 0.1));
          border-radius: 15px;
          border: 2px solid #8fbc8f;
          position: relative;
        }

        .story-end::before,
        .story-end::after {
          content: "🐰";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
        }

        .story-end::before {
          left: 20px;
        }

        .story-end::after {
          right: 20px;
        }

        .page-number {
          position: absolute;
          bottom: 10px;
          font-size: 0.8rem;
          color: #2d5016;
          background-color: rgba(255,255,255,0.7);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .audio-play-button { 
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          border: 2px solid #8fbc8f; 
          background-color: rgba(143, 188, 143, 0.9); 
          color: white; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: all 0.3s ease; 
          box-shadow: 0 2px 8px rgba(45, 80, 22, 0.2);
          z-index: 1000;
          pointer-events: auto;
        }
        .audio-play-button:hover { 
          background-color: #567c3e; 
          transform: translateY(-2px) scale(1.05); 
          box-shadow: 0 4px 12px rgba(45, 80, 22, 0.3);
        }
        .audio-play-button.playing { 
          background-color: #dc143c; 
          border-color: #b22222; 
          animation: pulse-audio 1.5s infinite; 
        }
        .audio-play-button.playing:hover {
          background-color: #b02030;
        }
        
        @keyframes pulse-audio {
          0%, 100% { 
            box-shadow: 0 2px 8px rgba(45, 80, 22, 0.2), 0 0 0 0 rgba(220, 20, 60, 0.7);
          }
          50% { 
            box-shadow: 0 4px 12px rgba(45, 80, 22, 0.3), 0 0 0 8px rgba(220, 20, 60, 0);
          }
        }
        
        .navigation-controls { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 20px; 
          margin-top: 10px; 
          color: #2d5016; 
        }
        .nav-button { 
          background-color: #8fbc8f; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 8px; 
          font-size: 1rem; 
          font-weight: 600;
          cursor: pointer; 
          transition: all 0.3s ease; 
          font-family: 'Georgia', serif;
        }
        .nav-button:hover:not(:disabled) { 
          background-color: #567c3e; 
          transform: translateY(-2px);
        }
        .nav-button:disabled { 
          background-color: #ccc; 
          opacity: 0.6;
          cursor: not-allowed; 
        }
        .quiz-button { 
          background-color: #d4af37; 
          font-size: 1.1rem;
          padding: 12px 24px;
          animation: pulse 2s infinite; 
        }
        .quiz-button:hover { 
          background-color: #b8941f; 
        }
        
        .page-indicator {
          font-size: 1rem;
          font-weight: 500;
          color: #567c3e;
          font-family: 'Georgia', serif;
        }

        .mobile-tip {
          margin-top: 10px;
          font-size: 0.9rem;
          color: #2d5016;
          text-align: center;
          font-style: italic;
        }
        
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .loading-screen { 
          position: fixed; 
          inset: 0; 
          background: linear-gradient(135deg, #faf8f1 0%, #d4e6c8 100%); 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          color: #2d5016; 
          z-index: 9999;
        }
        .loading-spinner { 
          width: 50px; 
          height: 50px; 
          border: 4px solid #e9ecef; 
          border-top: 4px solid #8fbc8f; 
          border-radius: 50%; 
          animation: spin 1s linear infinite; 
          margin-bottom: 20px; 
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .flipbook-app {
            padding: 10px;
          }

          .book-title h1 {
            font-size: 2rem;
          }

          .flipbook-wrapper {
            aspect-ratio: 550 / 733;
            height: 70vh;
            max-height: 600px;
            max-width: 90vw;
            width: auto;
            margin: 10px auto;
          }

          .text-page .page-content { 
            padding: 15px 20px 55px 20px; 
          }
          .story-text { 
            font-size: 1.05rem; 
            line-height: 1.7; 
          }
          .story-subtext { 
            font-size: 1rem; 
            line-height: 1.6; 
          }
          .character-names { 
            font-size: 1.1rem; 
            padding: 12px; 
            margin-bottom: 15px;
          }
          .story-text-content {
            justify-content: space-evenly;
            padding: 0;
          }
          .cover-title {
            font-size: 2rem;
          }
          .cover-subtitle {
            font-size: 1.2rem;
          }
          .cover-author {
            font-size: 1rem;
          }
          .story-end {
            font-size: 1.5rem;
            padding: 15px;
          }
          .audio-play-button {
            width: 35px;
            height: 35px;
          }
        }
        
        /* Ensure no unwanted margins/padding */
        * {
          box-sizing: border-box;
        }
        
        .page * {
          margin: 0;
          padding: 0;
        }
        
        .page .story-text,
        .page .story-subtext,
        .page .character-names {
          margin: revert;
          padding: revert;
        }
      `}</style>

      <div className="book-title">
        <h1>The Tale of Peter Rabbit</h1>
        <p>by Beatrix Potter</p>
      </div>

      <div
        className="flipbook-wrapper"
        onClick={!isBookOpen ? handleOpenBook : undefined}
        role={!isBookOpen ? "button" : undefined}
        aria-label={!isBookOpen ? "Open Peter Rabbit storybook" : undefined}
        tabIndex={!isBookOpen ? 0 : undefined}
        onKeyPress={!isBookOpen ? (e) => { 
          if (e.key === 'Enter' || e.key === ' ') handleOpenBook(); 
        } : undefined}
      >
        <HTMLFlipBook
          key={isMobile ? 'mobile-book' : 'desktop-book'}
          ref={flipBookRef}
          width={isMobile ? 350 : 550}
          height={isMobile ? 500 : 733}
          minWidth={isMobile ? 300 : 400}
          maxWidth={isMobile ? 400 : 1000}
          minHeight={isMobile ? 450 : 600}
          maxHeight={isMobile ? 600 : 1350}
          size="stretch"
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={handleFlip}
          className="flipbook-instance"
          swipeDistance={isMobile ? 20 : 50}
          usePortrait={isMobile}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          useMouseEvents={true}
          autoSize={false}
          showPageCorners={!isMobile}
          disableFlipByClick={false}
          clickEventForward={false}
          style={{
            touchAction: isMobile ? 'none' : 'auto'
          }}
        >
          {/* Front Cover */}
          <PageCover backgroundImage="https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.07.49_81ccf5b0.jpg?updatedAt=1756750119491">
            <div className="page-cover__content">
              <div className="cover-title">THE TALE OF<br/>PETER RABBIT</div>
              <div className="cover-subtitle">by Beatrix Potter</div>
              <div className="cover-author">A Classic Children's Story</div>
            </div>
          </PageCover>

          {/* Story Pages - Alternating Image (Left/Even) and Text (Right/Odd) */}
          {STORY_SPREADS.map((spread, index) => [
            <ImagePage 
              key={`image-${index}`} 
              content={spread} 
              pageNumber={(index * 2) + 2}
              onPlayAudio={handlePlayAudio}
              isAudioPlaying={isAudioPlaying}
              currentAudioPage={currentAudioPage}
            />,
            <TextPage 
              key={`text-${index}`} 
              content={spread} 
              pageNumber={(index * 2) + 3}
              onPlayAudio={handlePlayAudio}
              isAudioPlaying={isAudioPlaying}
              currentAudioPage={currentAudioPage}
            />
          ]).flat()}

          {/* Back Cover */}
          <PageCover backgroundImage="https://ik.imagekit.io/td5ykows9/WhatsApp%20Image%202025-09-01%20at%2018.07.49_81ccf5b0.jpg?updatedAt=1756750119491">
            <div style={{ 
              padding: '40px', 
              background: 'rgba(250, 248, 241, 0.9)', 
              borderRadius: '15px',
              textAlign: 'center',
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h2 style={{color: '#2d5016', marginBottom: '20px'}}>The End</h2>
              <p style={{color: '#567c3e', fontSize: '1.1rem', lineHeight: 1.6}}>
                This classic story teaches us about the importance of listening<br/>
                to your parents and the consequences of disobedience.
              </p>
              
              {/* Quiz Button */}
              <button
                onClick={startQuiz}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  backgroundColor: '#8fbc8f',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Georgia, serif',
                  boxShadow: '0 2px 8px rgba(45, 80, 22, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#567c3e';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#8fbc8f';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Start activity"
              >
                Lets go for Activity! 🐰
              </button>
            </div>
          </PageCover>
        </HTMLFlipBook>
      </div>

      <div className="navigation-controls">
        {!isMobile && (
          <button
            onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
            className="nav-button"
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            ← Previous
          </button>
        )}
        
        <span className="page-indicator">
          Page {currentPage + 1} of {totalBookPages}
        </span>
        
        {showQuizButton ? (
          <button
            onClick={startQuiz}
            className="nav-button quiz-button"
            aria-label="Start reading activity"
          >
            Start Activity! 🎯
          </button>
        ) : !isMobile && (
          <button
            onClick={() => flipBookRef.current?.pageFlip().flipNext()}
            className="nav-button"
            disabled={currentPage >= totalBookPages - 1}
            aria-label="Next page"
          >
            Next →
          </button>
        )}
      </div>

      {isMobile && !isBookOpen && (
        <div className="mobile-tip">
          📖 Tap the book to open and start reading!
        </div>
      )}

      {isMobile && isBookOpen && (
        <p className="mobile-tip">👆 Swipe left/right to flip pages</p>
      )}

    </div>
  );
}