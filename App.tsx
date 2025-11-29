import React, { useState, useCallback, useEffect } from 'react';
import CRTOverlay from './components/CRTOverlay';
import DialogBox from './components/DialogBox';
import RetroButton from './components/RetroButton';
import { generateSceneDescription, generatePixelArtImage } from './services/geminiService';
import { AppState, GeneratedScene, SceneStyle, SCENE_STYLES } from './types';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<SceneStyle | 'RANDOM'>('JAPANESE_SCHOOL');
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
      // Resolve style if random
      let activeStyle: SceneStyle = selectedStyle === 'RANDOM' 
        ? SCENE_STYLES.filter(s => s.id !== 'RANDOM')[Math.floor(Math.random() * 4)].id as SceneStyle
        : selectedStyle as SceneStyle;

      const description = await generateSceneDescription(inputText, activeStyle);
      setAppState(AppState.GENERATING_IMAGE);
      const imageUrl = await generatePixelArtImage(description, activeStyle);

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
  }, [inputText, appState, selectedStyle]);

  const handleReset = () => {
    setIsBPressed(true);
    setTimeout(() => setIsBPressed(false), 200);
    
    setAppState(AppState.IDLE);
    setGeneratedScene(null);
    setInputText('');
  };

  const isLoading = appState === AppState.GENERATING_PROMPT || appState === AppState.GENERATING_IMAGE;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-2 md:p-6 font-sans overflow-x-hidden relative">
       {/* Background pattern */}
       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

      {/* --- TV UNIT --- */}
      {/* Increased max-width to 4xl and adjusted aspect ratio handling */}
      <div className="relative mb-4 md:mb-8 w-full max-w-4xl aspect-[4/3] md:aspect-video bg-[#111] rounded-2xl border-[8px] md:border-[16px] border-[#2a2a2a] shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 z-10 transition-all duration-300">
        
        {/* TV Branding */}
        <div className="absolute -bottom-6 md:-bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
             <div className="bg-[#2a2a2a] px-4 md:px-6 py-0.5 md:py-1 rounded-b-lg text-[#666] font-bold text-[8px] md:text-[10px] tracking-[0.3em] shadow-lg border-t border-black">
                RETRO-VISION
             </div>
        </div>

        {/* Screen Bezel Reflection */}
        <div className="absolute inset-0 rounded-lg pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-30 border border-white/5"></div>

        {/* Screen Content Area */}
        <div className="w-full h-full relative overflow-hidden bg-[#050505] rounded-sm">
           <CRTOverlay />
           
           <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              {/* STATE: IDLE */}
              {appState === AppState.IDLE && (
                <div className="text-center animate-pulse px-4 flex flex-col items-center">
                  <h1 className="font-['Press_Start_2P'] text-xl md:text-4xl text-yellow-400 drop-shadow-[2px_2px_0_#b91c1c] md:drop-shadow-[4px_4px_0_#b91c1c] mb-4 md:mb-6 leading-relaxed">
                    INSERT COIN
                  </h1>
                  <p className="font-['DotGothic16'] text-green-500 text-base md:text-xl tracking-wider mb-8">
                    PLEASE ENTER DIALOGUE BELOW
                  </p>

                  {/* New Controls Instructions */}
                  <div className="border-2 border-white/20 p-2 md:p-4 bg-black/50 rounded text-center">
                      <p className="font-['Press_Start_2P'] text-[8px] md:text-[10px] text-white mb-2 underline decoration-white/50">CONTROLS</p>
                      <div className="grid grid-cols-1 gap-1 text-left">
                        <p className="font-['DotGothic16'] text-xs md:text-sm text-gray-300">
                           <span className="text-red-500 font-bold">START / A</span> : GENERATE
                        </p>
                        <p className="font-['DotGothic16'] text-xs md:text-sm text-gray-300">
                           <span className="text-red-500 font-bold">SELECT / B</span> : RESET
                        </p>
                      </div>
                  </div>
                </div>
              )}

              {/* STATE: LOADING */}
              {isLoading && (
                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                   <div className="font-['Press_Start_2P'] text-white text-[10px] md:text-sm animate-bounce text-center leading-relaxed">
                     {appState === AppState.GENERATING_PROMPT ? "READING CARTRIDGE..." : "RENDERING GRAPHICS..."}
                   </div>
                   <div className="w-32 md:w-48 h-3 md:h-4 border-2 border-white p-0.5">
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
                <div className="text-center bg-black/80 p-4 md:p-6 border-2 border-red-600 mx-4">
                  <h2 className="font-['Press_Start_2P'] text-red-500 text-sm md:text-xl mb-2 md:mb-4 blink">SYSTEM ERROR</h2>
                  <p className="font-['DotGothic16'] text-white text-sm md:text-lg mb-4 md:mb-6">{errorMessage}</p>
                  <RetroButton label="RESET SYSTEM" onClick={handleReset} variant="secondary" />
                </div>
              )}
           </div>
        </div>
      </div>

      {/* --- CABLE --- */}
      <div className="h-8 md:h-16 w-2 md:w-3 bg-[#111] shadow-[inset_0_0_5px_rgba(0,0,0,0.5)] z-0 -mt-4 md:-mt-8 relative">
        <div className="absolute top-0 w-full h-full bg-gradient-to-r from-black via-gray-800 to-black opacity-50"></div>
      </div>

      {/* --- FAMICOM CONTROLLER UNIT --- */}
      <div className="relative w-full max-w-3xl z-10 -mt-1 md:-mt-2">
        
        {/* Main Body (Red) */}
        <div className="bg-[#8b1f26] rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.3)] p-2 md:p-3 border-b-4 md:border-b-8 border-[#580a10]">
          
          {/* Gold Faceplate */}
          <div className="bg-[#cdad5d] w-full rounded-lg p-3 md:p-6 shadow-inner relative overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            
            {/* Brushed Metal Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)'}}></div>
            <div className="absolute inset-0 opacity-10 bg-yellow-900 mix-blend-multiply pointer-events-none"></div>

            {/* Controller Label */}
            <div className="absolute top-2 right-4 text-[#8b1f26] font-['Press_Start_2P'] text-[10px] opacity-90 hidden md:block">
               I CONTROLLER
            </div>

            {/* Left: D-Pad (Decorative) - Hidden on smallest screens to save space, or scaled down */}
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
               <div className="w-full bg-[#111] p-1 rounded shadow-[0_2px_5px_rgba(255,255,255,0.2),inset_0_2px_10px_black] mb-4 md:mb-5 border-b border-white/10 relative group">
                  <div className="bg-[#0a0a0a] border border-[#333] rounded-sm p-2 md:p-3 relative overflow-hidden flex flex-col gap-2">
                    
                    {/* Style Selector (New) */}
                    <div className="flex justify-between items-center border-b border-[#333] pb-1 z-20">
                      <label className="text-[#8b1f26] font-['Press_Start_2P'] text-[6px] md:text-[8px] opacity-70">
                         GAME STYLE
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value as SceneStyle | 'RANDOM')}
                          className="appearance-none bg-transparent text-yellow-500 font-['DotGothic16'] text-xs md:text-sm font-bold focus:outline-none cursor-pointer pr-4 text-right"
                        >
                          {SCENE_STYLES.map(style => (
                            <option key={style.id} value={style.id} className="bg-[#0a0a0a] text-yellow-500">
                              {style.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="w-3 h-3 text-yellow-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="relative w-full">
                       <label className="absolute -top-1 left-0 text-[#8b1f26] font-['Press_Start_2P'] text-[6px] md:text-[8px] opacity-70 z-10">
                          DIALOGUE
                       </label>
                      <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-transparent text-[#4ade80] font-['DotGothic16'] text-base md:text-xl pt-3 pb-1 px-0 resize-none focus:outline-none placeholder-gray-800 leading-snug relative z-20 caret-green-500"
                        rows={2}
                        placeholder="ENTER TEXT..."
                      />
                    </div>

                    {/* Scanline on input */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
                  </div>
               </div>

               {/* Start / Select Buttons */}
               <div className="flex gap-4 md:gap-8">
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleReset}
                      className="active:translate-y-[2px] active:shadow-none transition-all w-16 md:w-20 h-4 md:h-6 bg-[#1a1a1a] rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] border border-white/5"
                    ></button>
                    <div className="flex flex-col items-center mt-1 md:mt-2">
                        <span className="font-['Press_Start_2P'] text-[8px] md:text-[10px] text-[#8b1f26] font-bold tracking-widest">SELECT</span>
                        <span className="font-['DotGothic16'] text-[8px] md:text-[10px] text-[#8b1f26] opacity-80 font-bold tracking-tight">(RESET)</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="active:translate-y-[2px] active:shadow-none transition-all w-16 md:w-20 h-4 md:h-6 bg-[#1a1a1a] rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] border border-white/5"
                    ></button>
                    <div className="flex flex-col items-center mt-1 md:mt-2">
                        <span className="font-['Press_Start_2P'] text-[8px] md:text-[10px] text-[#8b1f26] font-bold tracking-widest">START</span>
                        <span className="font-['DotGothic16'] text-[8px] md:text-[10px] text-[#8b1f26] opacity-80 font-bold tracking-tight">(GENERATE)</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: A/B Buttons */}
            <div className="flex gap-4 items-end pb-1 md:pb-4 ml-0 md:ml-4 justify-center md:justify-start mt-2 md:mt-0">
               {/* B Button (Reset) */}
               <div className="flex flex-col items-center relative top-2 md:top-4">
                  <button 
                    onClick={handleReset}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-t border-white/20 flex items-center justify-center transition-all 
                      ${isBPressed ? 'translate-y-[4px] shadow-none bg-[#66151a]' : 'shadow-[0_4px_0_#4a050a,0_8px_10px_rgba(0,0,0,0.4)] bg-[#8b1f26]'}
                    `}
                  >
                  </button>
                  <div className="flex flex-col items-center mt-2 md:mt-3">
                    <span className="font-['Press_Start_2P'] text-[10px] md:text-[12px] text-[#8b1f26] font-bold">B</span>
                    <span className="font-['DotGothic16'] text-[8px] md:text-[10px] text-[#8b1f26] opacity-80 font-bold -mt-0.5">(RESET)</span>
                  </div>
               </div>

               {/* A Button (Generate) */}
               <div className="flex flex-col items-center relative -top-1 md:-top-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-t border-white/20 flex items-center justify-center transition-all 
                      ${isAPressed ? 'translate-y-[4px] shadow-none bg-[#66151a]' : 'shadow-[0_4px_0_#4a050a,0_8px_10px_rgba(0,0,0,0.4)] bg-[#8b1f26]'}
                      ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}
                    `}
                  >
                  </button>
                  <div className="flex flex-col items-center mt-2 md:mt-3">
                    <span className="font-['Press_Start_2P'] text-[10px] md:text-[12px] text-[#8b1f26] font-bold">A</span>
                    <span className="font-['DotGothic16'] text-[8px] md:text-[10px] text-[#8b1f26] opacity-80 font-bold -mt-0.5">(GENERATE)</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default App;