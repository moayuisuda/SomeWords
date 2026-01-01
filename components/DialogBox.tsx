import React, { useState, useEffect } from 'react';
import { SubtitleType } from '../types';

interface DialogBoxProps {
  text: string;
  type?: SubtitleType;
}

const DialogBox: React.FC<DialogBoxProps> = ({ text, type = 'HORIZONTAL' }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // 1.5s delay before showing the dialog box
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(showTimer);
  }, []);

  // Typewriter effect - starts only after box is visible
  useEffect(() => {
    if (!isVisible) return;

    setDisplayedLength(0);
    const speed = 120; // ms per char
    
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev < text.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [text, isVisible]);

  if (!isVisible) return null;

  if (type === 'VERTICAL_LEFT' || type === 'VERTICAL_LEFT_NO_BG') {
    const isNoBg = type === 'VERTICAL_LEFT_NO_BG';
    return (
      <div className="absolute top-2 left-2 bottom-2 w-auto max-w-[30%] min-w-[40px] sm:w-auto sm:max-w-[20%] sm:min-w-[60px] sm:top-6 sm:left-6 sm:bottom-6 z-40 animate-[fadeIn_0.3s_ease-out]">
        {isNoBg ? (
           <div className="h-full p-2 sm:p-3 relative writing-vertical-rl flex items-center justify-center">
             <p className="font-['DotGothic16'] text-white text-xs sm:text-base md:text-xl lg:text-2xl leading-relaxed tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] break-words whitespace-pre-wrap max-h-full overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'upright', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
               {text.slice(0, displayedLength)}
               <span className="animate-waiting inline-block mt-1 text-white">_</span>
             </p>
           </div>
        ) : (
          /* Outer Border (White) */
          <div className="bg-white p-0.5 sm:p-1 rounded-sm shadow-[2px_0_0_rgba(0,0,0,0.5)] sm:shadow-[4px_0_0_rgba(0,0,0,0.5)] h-full inline-block">
            {/* Inner Border (Black) */}
            <div className="bg-black p-0.5 sm:p-1 h-full">
              {/* Text Area */}
              <div className="bg-black border border-white sm:border-2 h-full p-2 sm:p-3 relative writing-vertical-rl flex items-center justify-center">
                  <p className="font-['DotGothic16'] text-white text-xs sm:text-base md:text-xl lg:text-2xl leading-relaxed tracking-wide shadow-black drop-shadow-md break-words whitespace-pre-wrap max-h-full overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                    {text.slice(0, displayedLength)}
                    <span className="animate-waiting inline-block mt-1 text-white">_</span>
                  </p>
                  
                  {/* Continue indicator */}
                  {displayedLength >= text.length && (
                    <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 animate-bounce">
                      <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] sm:border-l-[6px] sm:border-r-[6px] sm:border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Horizontal (Default)
  const isNoBg = type === 'HORIZONTAL_NO_BG';
  return (
    <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-6 z-40 animate-[fadeIn_0.3s_ease-out]">
      {isNoBg ? (
         <div className="min-h-[50px] sm:min-h-[100px] p-2 sm:p-4 relative">
            <p className="font-['DotGothic16'] text-white text-sm sm:text-xl md:text-2xl leading-snug sm:leading-relaxed tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] break-words whitespace-pre-wrap" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
              {text.slice(0, displayedLength)}
              <span className="animate-waiting inline-block ml-1 text-white">_</span>
            </p>
         </div>
      ) : (
        /* Outer Border (White) */
        <div className="bg-white p-0.5 sm:p-1 rounded-sm shadow-[0_2px_0_rgba(0,0,0,0.5)] sm:shadow-[0_4px_0_rgba(0,0,0,0.5)]">
          {/* Inner Border (Black) */}
          <div className="bg-black p-0.5 sm:p-1">
            {/* Text Area */}
            <div className="bg-black border border-white sm:border-2 min-h-[50px] sm:min-h-[100px] p-2 sm:p-4 relative">
                <p className="font-['DotGothic16'] text-white text-sm sm:text-xl md:text-2xl leading-snug sm:leading-relaxed tracking-wide shadow-black drop-shadow-md break-words whitespace-pre-wrap">
                  {text.slice(0, displayedLength)}
                  <span className="animate-waiting inline-block ml-1 text-white">_</span>
                </p>
                
                {/* Continue indicator - only show when typing is done */}
                {displayedLength >= text.length && (
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 animate-bounce">
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] sm:border-l-[6px] sm:border-r-[6px] sm:border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialogBox;