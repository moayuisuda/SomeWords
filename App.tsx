import React, { useState, useCallback, useEffect } from 'react';
import CRTOverlay from './components/CRTOverlay';
import DialogBox from './components/DialogBox';
import RetroButton from './components/RetroButton';
import { generateSceneDescription, generatePixelArtImage } from './services/geminiService';
import { AppState, GeneratedScene } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedScene, setGeneratedScene] = useState<GeneratedScene | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Audio for button clicks (optional visual feedback, keeping it silent but visual)
  const [isAPressed, setIsAPressed] = useState(false);
  const [isBPressed, setIsBPressed] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim() || appState === AppState.GENERATING_PROMPT || appState === AppState.GENERATING_IMAGE) return;

    setIsAPressed(true);
    setTimeout(() => setIsAPressed(false), 200);

    setAppState(AppState.GENERATING_PROMPT);
    setErrorMessage('');
    
    try {
      const description = await generateSceneDescription(inputText);
      setAppState(AppState.GENERATING_IMAGE);
      const imageUrl = await generatePixelArtImage(description);

      setGeneratedScene({
        imageUrl,
        originalText: inputText,
        sceneDescription: description
      });

      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMessage(err.message || "Game Over. Check cartridge.");
    }
  }, [inputText, appState]);

  const handleReset = () => {
    setIsBPressed(true);
    setTimeout(() => setIsBPressed(false), 200);
    
    setAppState(AppState.IDLE);
    setGeneratedScene(null);
    setInputText('');
  };

  const isLoading = appState === AppState.GENERATING_PROMPT || appState === AppState.GENERATING_IMAGE;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden relative">
       {/* Background pattern */}
       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

      {/* --- TV UNIT --- */}
      <div className="relative mb-8 w-full max-w-2xl aspect-[4/3] md:aspect-video bg-[#111] rounded-2xl border-[16px] border-[#2a2a2a] shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 z-10">
        
        {/* TV Branding */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
             <div className="bg-[#2a2a2a] px-6 py-1 rounded-b-lg text-[#666] font-bold text-[10px] tracking-[0.3em] shadow-lg border-t border-black">
                RETRO-VISION
             </div>
        </div>

        {/* Screen Bezel Reflection */}
        <div className="absolute inset-0 rounded-lg pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-30 border border-white/5"></div>

        {/* Screen Content Area */}
        <div className="w-full h-full relative overflow-hidden bg-[#050505] rounded-sm">
           <CRTOverlay />
           
           <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* STATE: IDLE */}
              {appState === AppState.IDLE && (
                <div className="text-center animate-pulse">
                  <h1 className="font-['Press_Start_2P'] text-3xl md:text-4xl text-yellow-400 drop-shadow-[4px_4px_0_#b91c1c] mb-6">
                    INSERT COIN
                  </h1>
                  <p className="font-['DotGothic16'] text-green-500 text-xl tracking-wider">
                    PLEASE ENTER DIALOGUE BELOW
                  </p>
                </div>
              )}

              {/* STATE: LOADING */}
              {isLoading && (
                <div className="flex flex-col items-center space-y-6">
                   <div className="font-['Press_Start_2P'] text-white text-xs md:text-sm animate-bounce">
                     {appState === AppState.GENERATING_PROMPT ? "READING CARTRIDGE..." : "RENDERING GRAPHICS..."}
                   </div>
                   <div className="w-48 h-4 border-2 border-white p-0.5">
                      <div className="h-full bg-red-600 animate-[width_1.5s_ease-in-out_infinite]" style={{width: '100%'}}></div>
                   </div>
                </div>
              )}

              {/* STATE: COMPLETE */}
              {appState === AppState.COMPLETE && generatedScene && (
                <div className="w-full h-full relative animate-[fadeIn_0.5s_ease-out]">
                   <img 
                    src={generatedScene.imageUrl} 
                    alt="Scene" 
                    className="w-full h-full object-cover rendering-pixelated"
                    style={{ imageRendering: 'pixelated' }}
                   />
                   <DialogBox text={generatedScene.originalText} />
                </div>
              )}

              {/* STATE: ERROR */}
              {appState === AppState.ERROR && (
                <div className="text-center bg-black/80 p-6 border-2 border-red-600">
                  <h2 className="font-['Press_Start_2P'] text-red-500 text-xl mb-4 blink">SYSTEM ERROR</h2>
                  <p className="font-['DotGothic16'] text-white text-lg mb-6">{errorMessage}</p>
                  <RetroButton label="RESET SYSTEM" onClick={handleReset} variant="secondary" />
                </div>
              )}
           </div>
        </div>
      </div>

      {/* --- CABLE --- */}
      <div className="h-16 w-3 bg-[#111] shadow-[inset_0_0_5px_rgba(0,0,0,0.5)] z-0 -mt-8 relative">
        <div className="absolute top-0 w-full h-full bg-gradient-to-r from-black via-gray-800 to-black opacity-50"></div>
      </div>

      {/* --- FAMICOM CONTROLLER UNIT --- */}
      <div className="relative w-full max-w-3xl z-10 -mt-2">
        
        {/* Main Body (Red) */}
        <div className="bg-[#8b1f26] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.3)] p-2 md:p-3 border-b-8 border-[#580a10]">
          
          {/* Gold Faceplate */}
          <div className="bg-[#cdad5d] w-full rounded-lg p-4 md:p-6 shadow-inner relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
            
            {/* Brushed Metal Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)'}}></div>
            <div className="absolute inset-0 opacity-10 bg-yellow-900 mix-blend-multiply pointer-events-none"></div>

            {/* Controller Label */}
            <div className="absolute top-2 right-4 text-[#8b1f26] font-['Press_Start_2P'] text-[10px] opacity-90 hidden md:block">
               I CONTROLLER
            </div>

            {/* Left: D-Pad (Decorative) */}
            <div className="shrink-0 hidden md:flex flex-col items-center justify-center mr-2">
              <div className="w-28 h-28 relative drop-shadow-xl">
                <div className="absolute top-0 left-[34%] w-[32%] h-full bg-[#1a1a1a] rounded-[2px]"></div>
                <div className="absolute top-[34%] left-0 w-full h-[32%] bg-[#1a1a1a] rounded-[2px]"></div>
                <div className="absolute top-[35%] left-[35%] w-[30%] h-[30%] bg-[#111] rounded-full radial-gradient inset-shadow"></div>
                {/* Direction Arrows */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-[#333]"></div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#333]"></div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#333]"></div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#333]"></div>
              </div>
            </div>

            {/* Center: Input & Start/Select */}
            <div className="flex-grow w-full flex flex-col items-center z-10">
               
               {/* Input "Screen" */}
               <div className="w-full bg-[#111] p-1 rounded shadow-[0_2px_5px_rgba(255,255,255,0.2),inset_0_2px_10px_black] mb-5 border-b border-white/10 relative group">
                  <div className="bg-[#0a0a0a] border border-[#333] rounded-sm p-3 relative overflow-hidden">
                    <label className="absolute top-2 left-2 text-[#8b1f26] font-['Press_Start_2P'] text-[8px] md:text-[10px] opacity-70 z-10">
                        DIALOGUE
                    </label>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-transparent text-[#4ade80] font-['DotGothic16'] text-lg md:text-xl pt-6 pb-1 px-1 resize-none focus:outline-none placeholder-gray-800 uppercase leading-snug relative z-20 caret-green-500"
                      rows={2}
                      placeholder="ENTER TEXT..."
                    />
                    {/* Scanline on input */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
                  </div>
               </div>

               {/* Start / Select Buttons */}
               <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleReset}
                      className="active:translate-y-[2px] active:shadow-none transition-all w-20 h-6 bg-[#1a1a1a] rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] border border-white/5"
                    ></button>
                    <span className="mt-2 font-['Press_Start_2P'] text-[10px] text-[#8b1f26] font-bold tracking-widest">SELECT</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="active:translate-y-[2px] active:shadow-none transition-all w-20 h-6 bg-[#1a1a1a] rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] border border-white/5"
                    ></button>
                    <span className="mt-2 font-['Press_Start_2P'] text-[10px] text-[#8b1f26] font-bold tracking-widest">START</span>
                  </div>
               </div>
            </div>

            {/* Right: A/B Buttons */}
            <div className="flex gap-4 items-end pb-2 md:pb-4 ml-0 md:ml-4 justify-center md:justify-start">
               {/* B Button (Reset) */}
               <div className="flex flex-col items-center relative top-4">
                  <button 
                    onClick={handleReset}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-t border-white/20 flex items-center justify-center transition-all 
                      ${isBPressed ? 'translate-y-[4px] shadow-none bg-[#66151a]' : 'shadow-[0_4px_0_#4a050a,0_8px_10px_rgba(0,0,0,0.4)] bg-[#8b1f26]'}
                    `}
                  >
                  </button>
                  <span className="mt-3 font-['Press_Start_2P'] text-[12px] text-[#8b1f26] font-bold">B</span>
               </div>

               {/* A Button (Generate) */}
               <div className="flex flex-col items-center relative -top-2 md:-top-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-t border-white/20 flex items-center justify-center transition-all 
                      ${isAPressed ? 'translate-y-[4px] shadow-none bg-[#66151a]' : 'shadow-[0_4px_0_#4a050a,0_8px_10px_rgba(0,0,0,0.4)] bg-[#8b1f26]'}
                      ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}
                    `}
                  >
                  </button>
                  <span className="mt-3 font-['Press_Start_2P'] text-[12px] text-[#8b1f26] font-bold">A</span>
               </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default App;