import React, { useState, useRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { useNavigate } from "react-router-dom";

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
    {/* <div className="page-content page-cover__content">
      {children}
    </div> */}
  </div>
));

// Image Page (Left side - even page numbers)
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

// Text Page (Right side - odd page numbers)
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
          {content.quote && (
            <div className="story-quote">"{content.quote}"</div>
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
          color: '#8b4513',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 100
        }}>
          {pageNumber}
        </div>
        
        {/* Audio Play Button on right side */}
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

// ** UPDATED STORY CONTENT **
const STORY_SPREADS = [
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi1.jpg?updatedAt=1756723280113",
    alt: "Three bears in their cozy woodland home with their belongings",
    text: "Once upon a time there were three Bears, who lived together in a house of their own, in a wood. One of them was a Little Wee Bear, and one was a Middle-sized Bear, and the other was a Great Big Bear. They had each a bowl for their porridge; a little bowl for the Little Wee Bear; and a middle-sized bowl for the Middle-sized Bear; and a great bowl for the Great Big Bear. And they had each a chair to sit in; a little chair for the Little Wee Bear; and a middle-sized chair for the Middle-sized Bear; and a great chair for the Great Big Bear. And they had each a bed to sleep in; a little bed for the Little Wee Bear; and a middle-sized bed for the Middle-sized Bear; and a great bed for the Great Big Bear.",
    characterNames: ["Little Wee Bear,", "Middle-sized Bear,", "and Great Big Bear"]
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi2.jpg?updatedAt=1756723615540",
    alt: "Bears walking through the forest while Goldilocks approaches their house",
    text: "One day, after they had made the porridge for their breakfast, and poured it into their porridge-bowls, they walked out into the wood while the porridge was cooling, that they might not burn their mouths by beginning too soon, for they were polite, well-brought-up Bears. And while they were away a little girl called Goldilocks, who lived at the other side of the wood and had been sent on an errand by her mother, passed by the house, and looked in at the window. And then she peeped in at the keyhole, for she was not at all a well-brought-up little girl. Then seeing nobody in the house she lifted the latch."
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi3.jpg?updatedAt=1756723737220",
    alt: "Goldilocks entering the bears' house and seeing the porridge",
    text: "The door was not fastened, because the Bears were good Bears, who did nobody any harm, and never suspected that anybody would harm them. So Goldilocks opened the door and went in; and well pleased was she when she saw the porridge on the table. If she had been a well-brought-up little girl she would have waited till the Bears came home, and then, perhaps, they would have asked her to breakfast; for they were good Bears—a little rough or so, as the manner of Bears is, but for all that very good-natured and hospitable. But she was an impudent, rude little girl, and so she set about helping herself. First she tasted the porridge of the Great Big Bear, and that was too hot for her. Next she tasted the porridge of the Middle-sized Bear, but that was too cold for her. And then she went to the porridge of the Little Wee Bear, and tasted it, and that was neither too hot nor too cold, but just right, and she liked it so well that she ate it all up, every bit!"
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi5.jpg?updatedAt=1756723891593",
    alt: "Goldilocks trying the three chairs and breaking the small one",
    text: "Then Goldilocks, who was tired, for she had been catching butterflies instead of running on her errand, sate down in the chair of the Great Big Bear, but that was too hard for her. And then she sate down in the chair of the Middle-sized Bear, and that was too soft for her. But when she sat down in the chair of the Little Wee Bear, that was neither too hard nor too soft, but just right. So she seated herself in it, and there she sate till the bottom of the chair came out, and down she came, plump upon the ground; and that made her very cross, for she was a bad-tempered little girl. Now, being determined to rest, Goldilocks went upstairs into the bedchamber in which the Three Bears slept. And first she lay down upon the bed of the Great Big Bear, but that was too high at the head for her. And next she lay down upon the bed of the Middle-sized Bear, and that was too high at the foot for her. And then she lay down upon the bed of the Little Wee Bear, and that was neither too high at the head nor at the foot, but just right. So she covered herself up comfortably, and lay there till she fell fast asleep."
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi7.jpg?updatedAt=1756723957462",
    alt: "The Three Bears returning home and discovering their disturbed belongings",
    text: "By this time the Three Bears thought their porridge would be cool enough for them to eat it properly; so they came home to breakfast. Now careless Goldilocks had left the spoon of the Great Big Bear standing in his porridge.",
    quote: "SOMEBODY HAS BEEN AT MY PORRIDGE!",
    subText: "said the Great Big Bear in his great, rough, gruff voice. Then the Middle-sized Bear looked at his porridge and saw the spoon was standing in it too. \"SOMEBODY HAS BEEN AT MY PORRIDGE!\" said the Middle-sized Bear in his middle-sized voice. Then the Little Wee Bear looked at his, and there was the spoon in the porridge-bowl, but the porridge was all gone! \"SOMEBODY HAS BEEN AT MY PORRIDGE, AND HAS EATEN IT ALL UP!\" said the Little Wee Bear in his little wee voice."
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi8.jpg?updatedAt=1756723994002",
    alt: "The three disturbed chairs, with one broken",
    text: "Upon seeing the empty porridge bowl, the Three Bears began to look about them. Now the careless Goldilocks had not put the hard cushion straight when she rose from the chair of the Great Big Bear.",
    quote: "SOMEBODY HAS BEEN SITTING IN MY CHAIR!",
    subText: "said the Great Big Bear in his great, rough, gruff voice. And the careless Goldilocks had squatted down the soft cushion of the Middle-sized Bear. \"SOMEBODY HAS BEEN SITTING IN MY CHAIR!\" said the Middle-sized Bear in his middle-sized voice. \"SOMEBODY HAS BEEN SITTING IN MY CHAIR, AND HAS SATE THE BOTTOM THROUGH!\" said the Little Wee Bear in his little wee voice."
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi9.jpg?updatedAt=1756724018163",
    alt: "Three Bears going upstairs to investigate their bedroom",
    text: "Then the Three Bears thought they had better make further search, so they went upstairs into their bedchamber. Now Goldilocks had pulled the pillow of the Great Big Bear out of its place.",
    quote: "SOMEBODY HAS BEEN LYING IN MY BED!",
    subText: "said the Great Big Bear in his great, rough, gruff voice. And Goldilocks had pulled the bolster of the Middle-sized Bear out of its place. \"SOMEBODY HAS BEEN LYING IN MY BED!\" said the Middle-sized Bear in his middle-sized voice."
  },
  {
    illustration: "https://ik.imagekit.io/td5ykows9/Goldi11.jpg?updatedAt=1756724129048",
    alt: "Goldilocks waking up to find the Three Bears and jumping out the window",
    text: "But when the Little Wee Bear came to look at his bed, there was the bolster in its place, and the pillow in its place; and upon the pillow was the head of Goldilocks—for she had no business there.",
    quote: "SOMEBODY HAS BEEN LYING IN MY BED,—AND HERE SHE IS STILL!",
    subText: "cried the Little Wee Bear in his little wee voice. This voice was so sharp and shrill that it awakened Goldilocks at once. Up she started; and when she saw the Three Bears on one side of the bed, she tumbled herself out at the other, and ran to the open window. Out the little girl jumped, and ran away into the woods. And the Three Bears never saw anything more of her.",
    isEnd: true
  }
];

export default function GoldilocksFlipbook() {
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
  
  // ** UPDATED PAGE COUNT **
  const totalBookPages = 18; // Front cover + 16 story pages + back cover

  const handleFlip = (e) => {
    const newPage = e.data;
    setCurrentPage(newPage);

    if (newPage > 0 && !isBookOpen) {
      setIsBookOpen(true);
    }

    const lastPageIndex = flipBookRef.current?.pageFlip()?.getPageCount() - 1;

    if (newPage === lastPageIndex) {
      if (!showQuizButton) {
        console.log('Reached back cover, showing quiz button');
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

  const startQuiz = () => {
    navigate('/GodAct1');
  };

  const handlePlayAudio = (pageNumber) => {
    try {
      // Calculate audio file number 
      const audioFileIndex = Math.floor((pageNumber - 3) / 2);
      const audioFileLetter = String.fromCharCode(97 + audioFileIndex); // 97 is 'a' in ASCII
      const audioFileName = `/${audioFileLetter}.mp3`;

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

  // Remove shadows from covers after component mounts
  useEffect(() => {
    const removeCoverShadows = () => {
      if (flipBookRef.current) {
        const flipbookElement = flipBookRef.current.pageFlip().getElement();
        
        // Remove shadows from all elements in the flipbook
        const allElements = flipbookElement.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.style.boxShadow) {
            const parent = el.closest('[data-density="hard"]');
            if (parent) {
              el.style.boxShadow = 'none';
            }
          }
        });

        // Specifically target cover pages (first and last)
        const pages = flipbookElement.querySelectorAll('[data-density="hard"]');
        pages.forEach(page => {
          page.style.boxShadow = 'none';
          const allChildren = page.querySelectorAll('*');
          allChildren.forEach(child => {
            child.style.boxShadow = 'none';
          });
        });
      }
    };

    // Run immediately and after a delay to catch dynamically generated shadows
    const timer1 = setTimeout(removeCoverShadows, 100);
    const timer2 = setTimeout(removeCoverShadows, 500);
    const timer3 = setTimeout(removeCoverShadows, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [imagesLoaded]);

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
        <p>Loading Goldilocks and the Three Bears...</p>
      </div>
    );
  }

  return (
    <div className="flipbook-app">
      <style jsx>{`
        .flipbook-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff8dc 0%, #daa520 100%);
          font-family: 'Georgia', 'Times New Roman', serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }

        .book-title {
          text-align: center;
          margin-bottom: 20px;
          color: #8b4513;
        }

        .book-title h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .book-title p {
          font-size: 1.2rem;
          color: #a0522d;
          font-style: italic;
        }

        .flipbook-wrapper {
          width: 100%;
          max-width: 1100px;
          height: auto;
          aspect-ratio: 1100 / 733;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
          cursor: ${!isBookOpen ? 'pointer' : 'default'};
        }

        .flipbook-instance {
          width: 100%;
          height: 100%;
          box-shadow: 0 10px 25px rgba(139, 69, 19, 0.15), 0 6px 10px rgba(139, 69, 19, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .page {
          width: 100%;
          height: 100%;
          display: flex;
          overflow: hidden;
          background: #fff8dc;
        }

        .page-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 25px;
          box-sizing: border-box;
        }

        .page-cover {
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          background-image: url('https://ik.imagekit.io/td5ykows9/jino.jpg?updatedAt=1756725138698');
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

        /* Aggressively remove all shadows from covers */
        .flipbook-instance .stf__parent .stf__block .stf__item[data-density="hard"],
        .flipbook-instance .stf__parent .stf__block .stf__item[data-density="hard"] *,
        .flipbook-instance .stf__parent .stf__block .stf__item[data-density="hard"]:before,
        .flipbook-instance .stf__parent .stf__block .stf__item[data-density="hard"]:after {
          box-shadow: none !important;
          filter: none !important;
          background-shadow: none !important;
        }

        /* Target the flipbook's internal shadow elements */
        .flipbook-instance .stf__parent .stf__block .stf__item:first-child,
        .flipbook-instance .stf__parent .stf__block .stf__item:last-child {
          box-shadow: none !important;
        }

        /* Remove shadows from page wrapper elements */
        .flipbook-instance div[style*="box-shadow"] {
          box-shadow: none !important;
        }

        /* Override any dynamically applied shadow styles */
        .page-cover,
        .page-cover * {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        .page-cover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 248, 220, 0.1);
          z-index: 0;
        }

        .page-cover__content {
          padding: 40px;
          border-radius: 15px;
          text-align: center;
          background: rgba(255, 248, 220, 0.9);
          backdrop-filter: blur(5px);
          border: 2px solid rgba(139, 69, 19, 0.2);
          box-shadow: 0 8px 32px rgba(139, 69, 19, 0.15);
          position: relative;
          z-index: 1;
          
        }
         

        .cover-title {
          font-size: 3rem;
          font-weight: bold;
          color: #8b4513;
          text-shadow: 2px 2px 4px rgba(255,255,255,0.5);
          margin-bottom: 1rem;
          letter-spacing: 2px;
        }

        .cover-subtitle {
          font-size: 1.5rem;
          color: #a0522d;
          font-style: italic;
          margin-bottom: 1rem;
        }

        .cover-author {
          font-size: 1.3rem;
          color: #d2691e;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .image-page {
          background: #fff8dc;
        }

        .text-page {
          background: #fff8dc;
        }

        .story-illustration-full {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overflow: hidden;
        }

        .story-image-full {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0;
          box-shadow: none;
        }

        .character-names {
          text-align: center;
          font-size: 1.2rem;
          font-style: italic;
          color: #cd853f;
          margin: 15px 0;
          padding: 15px;
          background: rgba(205, 133, 63, 0.1);
          border-radius: 8px;
          border: 2px solid rgba(205, 133, 63, 0.3);
        }

        .character-name {
          margin: 5px 0;
        }

        .story-text-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
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

        .text-page .page-content {
          padding: 0;
        }

        .image-page .page-content {
          padding: 0;
          position: relative;
        }

        .story-text {
          font-size: 1.1rem;
          line-height: 1.8;
          text-align: left;
          color: #654321;
          margin-bottom: 15px;
          text-indent: 0;
          font-weight: 400;
          letter-spacing: 0.3px;
          word-spacing: 1px;
        }

        .story-subtext {
          font-size: 1rem;
          line-height: 1.7;
          text-align: left;
          color: #a0522d;
          font-style: italic;
          margin-bottom: 15px;
          text-indent: 0;
          letter-spacing: 0.2px;
          word-spacing: 1px;
          border-top: 1px solid rgba(139, 69, 19, 0.3);
          padding-top: 15px;
        }

        .story-quote {
          font-size: 1.1rem;
          line-height: 1.6;
          text-align: center;
          color: #8b4513;
          font-weight: bold;
          margin: 15px 0;
          padding: 15px;
          background: rgba(218, 165, 32, 0.1);
          border-radius: 8px;
          border-left: 4px solid #daa520;
          font-style: italic;
        }

        .story-end {
          text-align: center;
          font-size: 2rem;
          display: none;
          font-weight: bold;
          color: #8b4513;
          margin: 20px 0;
          padding: 20px;
          background: linear-gradient(45deg, rgba(218, 165, 32, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 15px;
          border: 2px solid #daa520;
          position: relative;
        }

        .story-end::before,
        .story-end::after {
          content: "🐻";
          position: absolute;
          top: 50%;
          display: none;
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
          color: #8b4513;
          background-color: rgba(255,255,255,0.7);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .audio-play-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #daa520;
          background-color: rgba(218, 165, 32, 0.9);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
          z-index: 1000;
          pointer-events: auto;
        }

        .audio-play-button:hover {
          background-color: #b8860b;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
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
            box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2), 0 0 0 0 rgba(220, 20, 60, 0.7);
          }
          50% { 
            box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3), 0 0 0 8px rgba(220, 20, 60, 0);
          }
        }

        .navigation-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
          color: #8b4513;
        }

        .nav-button {
          background-color: #daa520;
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
          background-color: #b8860b;
          transform: translateY(-2px);
        }

        .nav-button:disabled {
          background-color: #ccc;
          opacity: 0.6;
          cursor: not-allowed;
        }

        .quiz-button {
          background-color: #ff6347;
          font-size: 1.1rem;
          padding: 12px 24px;
          animation: pulse 2s infinite;
        }

        .quiz-button:hover {
          background-color: #dc143c;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .page-indicator {
          font-size: 1rem;
          font-weight: 500;
          color: #a0522d;
          font-family: 'Georgia', serif;
        }

        .mobile-tip {
          margin-top: 10px;
          font-size: 0.9rem;
          color: #8b4513;
          text-align: center;
          font-style: italic;
        }

        .loading-screen {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #fff8dc 0%, #daa520 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #8b4513;
          z-index: 9999;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e9ecef;
          border-top: 4px solid #daa520;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

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

          .story-text {
            font-size: 1rem;
            line-height: 1.7;
          }

          .story-subtext {
            font-size: 0.95rem;
            line-height: 1.6;
          }

          .story-text-content {
            padding: 15px;
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
            display: none;
          }

          .page-content {
            padding: 15px;
          }

          .audio-play-button {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>

      <div className="book-title">
        <h1>Goldilocks and the Three Bears</h1>
        <p>A Classic Fairy Tale</p>
      </div>

      <div
        className="flipbook-wrapper"
        onClick={!isBookOpen ? handleOpenBook : undefined}
        role={!isBookOpen ? "button" : undefined}
        aria-label={!isBookOpen ? "Open Goldilocks storybook" : undefined}
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
          <PageCover
            className="front-cover"
            backgroundImage="https://ik.imagekit.io/td5ykows9/jino.jpg?updatedAt=1756725138698"
          >
            <div className="cover-title">GOLDILOCKS<br/>AND THE<br/>THREE BEARS</div>
            <div className="cover-subtitle">A Classic Fairy Tale</div>
            <div className="cover-author">TRADITIONAL STORY</div>
          </PageCover>

          {/* Story Pages - Alternating Image (Left/Even) and Text (Right/Odd) */}
          {STORY_SPREADS.map((spread, index) => [
            // Left page (Image) - Even page numbers (2, 4, 6, etc.)
            <ImagePage 
              key={`image-page-${index}`} 
              content={spread} 
              pageNumber={(index * 2) + 2}
              onPlayAudio={handlePlayAudio}
              isAudioPlaying={isAudioPlaying}
              currentAudioPage={currentAudioPage}
            />,
            // Right page (Text) - Odd page numbers (3, 5, 7, etc.)
            <TextPage 
              key={`text-page-${index}`} 
              content={spread} 
              pageNumber={(index * 2) + 3}
              onPlayAudio={handlePlayAudio}
              isAudioPlaying={isAudioPlaying}
              currentAudioPage={currentAudioPage}
            />
          ]).flat()}

          {/* Back Cover */}
          <PageCover
            className="back-cover"
            backgroundImage="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&h=600&fit=crop"
          >
            <div style={{
              padding: '40px',
              background: 'rgba(255, 248, 220, 0.9)',
              borderRadius: '15px',
              textAlign: 'center',
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h2 style={{color: '#8b4513', marginBottom: '20px'}}>The End</h2>
              <p style={{color: '#a0522d', fontSize: '1.1rem', lineHeight: 1.6}}>
                This classic fairy tale teaches us about respect for others' property<br/>
                and the consequences of our actions.
              </p>
              
              {/* Quiz Button */}
              <button
                onClick={startQuiz}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  backgroundColor: '#daa520',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Georgia, serif',
                  boxShadow: '0 2px 8px rgba(139, 69, 19, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b8860b';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#daa520';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Start quiz"
              >
                Lets go for Activity! 🐻
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
            aria-label="Start reading quiz"
          >
            Lets go for Activity! 🎯
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