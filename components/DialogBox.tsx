import React, { useState, useEffect } from 'react';

interface DialogBoxProps {
  text: string;
}

const DialogBox: React.FC<DialogBoxProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const speed = 50; // ms per char
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="absolute bottom-2 left-2 right-2 sm:bottom-6 sm:left-6 sm:right-6 z-40">
      {/* Outer Border (White) */}
      <div className="bg-white p-0.5 sm:p-1 rounded-sm shadow-[0_2px_0_rgba(0,0,0,0.5)] sm:shadow-[0_4px_0_rgba(0,0,0,0.5)]">
        {/* Inner Border (Black) */}
        <div className="bg-black p-0.5 sm:p-1">
           {/* Text Area */}
           <div className="bg-black border border-white sm:border-2 min-h-[50px] sm:min-h-[100px] p-2 sm:p-4 relative">
              <p className="font-['DotGothic16'] text-white text-sm sm:text-xl md:text-2xl leading-snug sm:leading-relaxed tracking-wide shadow-black drop-shadow-md">
                {displayedText}
                <span className="animate-pulse inline-block ml-1 text-green-400">_</span>
              </p>
              
              {/* Continue indicator */}
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 animate-bounce">
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] sm:border-l-[6px] sm:border-r-[6px] sm:border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;