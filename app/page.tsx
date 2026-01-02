"use client";

import React, { useState, useCallback } from "react";
import CRTOverlay from "../components/CRTOverlay";
import RetroButton from "../components/RetroButton";
import { saveImage } from "../utils/imageSaver";
import {
  AppState,
  GeneratedScene,
  SceneStyle,
  SCENE_STYLE_IDS,
  Language,
  SubtitleType,
} from "../types";
import { translations } from "../utils/translations";
import {
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
} from "@heroicons/react/20/solid";
import { useDailyLimit } from "../hooks/useDailyLimit";

const App: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<SceneStyle | "RANDOM">(
    "JAPANESE_SCHOOL"
  );
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedScene, setGeneratedScene] = useState<GeneratedScene | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleType, setSubtitleType] = useState<SubtitleType>("HORIZONTAL");

  // Daily Limit Hook
  const { isLimitReached, incrementUsage } = useDailyLimit();

  // Audio for button clicks (optional visual feedback, keeping it silent but visual)
  const [isAPressed, setIsAPressed] = useState(false);
  const [isBPressed, setIsBPressed] = useState(false);

  const t = translations[language];

  // Font Helper: Use "Press Start 2P" for English headers, "DotGothic16" for Chinese headers
  const headerFont =
    language === "en"
      ? "font-['Press_Start_2P']"
      : "font-['DotGothic16'] font-bold tracking-widest";
  const pixelFont = "font-['DotGothic16']";

  const handleGenerate = useCallback(async () => {
    if (
      !inputText.trim() ||
      appState === AppState.GENERATING_PROMPT ||
      appState === AppState.GENERATING_IMAGE
    )
      return;

    if (isLimitReached) {
      setErrorMessage(t.dailyLimitReached);
      setAppState(AppState.ERROR);
      return;
    }

    setIsAPressed(true);
    setTimeout(() => setIsAPressed(false), 200);

    setAppState(AppState.GENERATING_PROMPT);
    setErrorMessage("");
    setShowSubtitles(true); // Reset subtitles to visible on new generation

    try {
      // Resolve style if random
      let activeStyle: SceneStyle =
        selectedStyle === "RANDOM"
          ? (SCENE_STYLE_IDS.filter((s) => s !== "RANDOM")[
              Math.floor(Math.random() * 4)
            ] as SceneStyle)
          : (selectedStyle as SceneStyle);

      // Call API for description
      const descResponse = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userText: inputText, style: activeStyle }),
      });

      if (!descResponse.ok) {
        const err = await descResponse.json();
        throw new Error(err.error || "Failed to generate description");
      }

      const { description } = await descResponse.json();

      setAppState(AppState.GENERATING_IMAGE);

      // Determine aspect ratio based on screen width
      // 768px matches the md: breakpoint in Tailwind
      const isMobile = window.innerWidth < 768;
      const aspectRatio = isMobile ? "4:3" : "16:9";

      // Call API for image
      const imgResponse = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneDescription: description,
          style: activeStyle,
          aspectRatio,
        }),
      });

      if (!imgResponse.ok) {
        const err = await imgResponse.json();
        throw new Error(err.error || "Failed to generate image");
      }

      const { imageUrl } = await imgResponse.json();

      setGeneratedScene({
        imageUrl,
        originalText: inputText,
        sceneDescription: description,
      });

      incrementUsage(); // Deduct credit
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
    setInputText("");
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (generatedScene) {
      setIsSaving(true);
      try {
        await saveImage(`retro_scene_${Date.now()}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "zh" : "en"));
  };

  const cycleSubtitleStyle = () => {
    setSubtitleType((prev) => {
      switch (prev) {
        case "HORIZONTAL":
          return "HORIZONTAL_NO_BG";
        case "HORIZONTAL_NO_BG":
          return "VERTICAL_LEFT";
        case "VERTICAL_LEFT":
          return "VERTICAL_LEFT_NO_BG";
        case "VERTICAL_LEFT_NO_BG":
          return "HORIZONTAL";
        default:
          return "HORIZONTAL";
      }
    });
  };

  const isLoading =
    appState === AppState.GENERATING_PROMPT ||
    appState === AppState.GENERATING_IMAGE;

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

        {/* Screen Content Area */}
        <div className="w-full h-full relative overflow-hidden bg-[#050505] rounded-sm group/screen">
          <div className="h-full p-4 md:p-8">
            <div
              id="main-screen-content"
              className="relative h-full main-content flex items-center justify-center"
            >
              <CRTOverlay
                dialogText={
                  appState === AppState.COMPLETE &&
                  showSubtitles &&
                  generatedScene
                    ? generatedScene.originalText
                    : undefined
                }
                subtitleType={subtitleType}
              />

              {/* STATE: IDLE */}
              {appState === AppState.IDLE && (
                <div className="text-center animate-waiting px-4 flex flex-col items-center">
                  <h1
                    className={`${headerFont} text-xl md:text-4xl text-yellow-400 drop-shadow-[2px_2px_0_#b91c1c] md:drop-shadow-[4px_4px_0_#b91c1c] mb-4 md:mb-6 leading-relaxed`}
                  >
                    {t.insertCoin}
                  </h1>
                  <p
                    className={`${pixelFont} text-green-500 text-base md:text-xl tracking-wider mb-8`}
                  >
                    {t.enterDialogue}
                  </p>

                  {/* New Controls Instructions */}
                  <div className="border-2 border-white/20 p-2 md:p-4 bg-black/50 rounded text-center">
                    <p
                      className={`${headerFont} text-[8px] md:text-[10px] text-white mb-2 underline decoration-white/50`}
                    >
                      {t.controls}
                    </p>
                    <div className="grid grid-cols-1 gap-1 text-left">
                      <p
                        className={`${pixelFont} text-xs md:text-sm text-gray-300`}
                      >
                        <span className="text-red-500 font-bold">
                          START / A
                        </span>{" "}
                        : {t.generate}
                      </p>
                      <p
                        className={`${pixelFont} text-xs md:text-sm text-gray-300`}
                      >
                        <span className="text-red-500 font-bold">
                          SELECT / B
                        </span>{" "}
                        : {t.reset}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE: LOADING */}
              {isLoading && (
                <div className="flex flex-col items-center space-y-4 md:space-y-6">
                  <div
                    className={`${headerFont} text-white text-[10px] md:text-sm animate-waiting text-center leading-relaxed`}
                  >
                    {appState === AppState.GENERATING_PROMPT
                      ? t.readingCartridge
                      : t.renderingGraphics}
                  </div>
                  <div className="w-32 md:w-48 h-3 md:h-4 border-2 border-white p-0.5">
                    <div
                      className="h-full opacity-60 bg-red-600 animate-[width_1.5s_ease-in-out_infinite]"
                      style={{ width: "100%" }}
                    ></div>
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
                    style={{ imageRendering: "pixelated" }}
                  />

                  {/* Subtitle Layer - Visibility controlled by state */}
                  {/* NOTE: DialogBox is now rendered inside CRTOverlay for better layering */}
                </div>
              )}

              {/* STATE: ERROR */}
              {appState === AppState.ERROR && (
                <div className="text-center bg-black/80 p-4 md:p-6 border-2 border-red-600 mx-4">
                  <h2
                    className={`${headerFont} text-red-500 text-sm md:text-xl mb-2 md:mb-4 blink`}
                  >
                    {t.systemError}
                  </h2>
                  <p
                    className={`${pixelFont} text-white text-sm md:text-lg mb-4 md:mb-6`}
                  >
                    {errorMessage}
                  </p>
                  <RetroButton
                    label={t.resetSystem}
                    onClick={handleReset}
                    variant="secondary"
                    fontClass={headerFont}
                  />
                </div>
              )}
            </div>
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
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)",
              }}
            ></div>
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
                  {/* Style Selector */}
                  <div className="flex justify-between items-center border-b border-[#333] pb-1 z-20">
                    <label
                      className={`text-[#8b1f26] ${headerFont} text-[6px] md:text-[8px] opacity-70`}
                    >
                      {t.gameStyle}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedStyle}
                        onChange={(e) =>
                          setSelectedStyle(
                            e.target.value as SceneStyle | "RANDOM"
                          )
                        }
                        className={`appearance-none bg-transparent text-yellow-500 ${pixelFont} text-xs md:text-sm font-bold focus:outline-none cursor-pointer pr-4 text-right`}
                      >
                        {SCENE_STYLE_IDS.map((id) => (
                          <option
                            key={id}
                            value={id}
                            className="bg-[#0a0a0a] text-yellow-500"
                          >
                            {t.styles[id]}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="w-3 h-3 text-yellow-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="relative w-full">
                    <label
                      className={`absolute -top-1 left-0 text-[#8b1f26] ${headerFont} text-[6px] md:text-[8px] opacity-70 z-10`}
                    >
                      {t.dialogue}
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isLoading}
                      className={`w-full bg-transparent text-[#4ade80] ${pixelFont} text-base md:text-xl pt-3 pb-1 px-0 resize-none focus:outline-none placeholder-gray-800 leading-snug relative z-20 caret-green-500`}
                      rows={2}
                      placeholder={t.enterDialogue + "..."}
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
                    onClick={cycleSubtitleStyle}
                    className="active:translate-y-[2px] active:shadow-none transition-all w-16 md:w-20 h-4 md:h-6 bg-[#1a1a1a] rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] border border-white/5"
                  ></button>
                  <div className="flex flex-col items-center mt-1 md:mt-2">
                    <span
                      className={`text-[#8b1f26] font-bold tracking-widest text-[8px] md:text-[10px] ${headerFont}`}
                    >
                      STYLE
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={toggleLanguage}
                    className="active:translate-y-[2px] active:shadow-none transition-all w-16 md:w-20 h-4 md:h-6 bg-[#1a1a1a] rounded-full shadow-[0_4px_0_rgba(0,0,0,0.5)] border border-white/5"
                  ></button>
                  <div className="flex flex-col items-center mt-1 md:mt-2">
                    <span
                      className={`text-[#8b1f26] font-bold tracking-widest text-[8px] md:text-[10px] ${headerFont}`}
                    >
                      LANGUAGE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: A/B Buttons */}
            <div className="flex gap-4 items-end pb-1 md:pb-4 ml-0 md:ml-4 justify-center md:justify-start">
              {/* B Button (Reset) */}
              <div className="flex flex-col items-center relative top-2 md:top-4">
                <button
                  onClick={handleReset}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-t border-white/20 flex items-center justify-center transition-all 
                      ${
                        isBPressed
                          ? "translate-y-[4px] shadow-none bg-[#66151a]"
                          : "shadow-[0_4px_0_#4a050a,0_8px_10px_rgba(0,0,0,0.4)] bg-[#8b1f26]"
                      }
                    `}
                ></button>
                <div className="flex flex-col items-center mt-2 md:mt-3">
                  <span
                    className={`text-[#8b1f26] font-bold text-[10px] md:text-[12px] ${headerFont}`}
                  >
                    {t.reset}
                  </span>
                </div>
              </div>

              {/* A Button (Generate) */}
              <div className="flex flex-col items-center relative -top-1 md:-top-4">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-t border-white/20 flex items-center justify-center transition-all 
                      ${
                        isAPressed
                          ? "translate-y-[4px] shadow-none bg-[#66151a]"
                          : "shadow-[0_4px_0_#4a050a,0_8px_10px_rgba(0,0,0,0.4)] bg-[#8b1f26]"
                      }
                      ${isLoading ? "opacity-80 cursor-not-allowed" : ""}
                    `}
                ></button>
                <div className="flex flex-col items-center mt-2 md:mt-3">
                  <span
                    className={`text-[#8b1f26] font-bold text-[10px] md:text-[12px] ${headerFont}`}
                  >
                    {t.generate}
                  </span>
                </div>
              </div>

              {/* Extra Controls: Screenshot & Subtitles */}
              <div className="flex flex-col gap-3 ml-4 md:ml-4 mb-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-10 md:w-12 h-8 md:h-10 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-[0_2px_0_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none flex items-center justify-center text-white/60 hover:text-white/90 transition-all ${
                    isSaving ? "opacity-50" : ""
                  }`}
                  title={t.save}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <CameraIcon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </button>
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className="w-10 md:w-12 h-8 md:h-10 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-[0_2px_0_rgba(0,0,0,0.5)] active:translate-y-[1px] active:shadow-none flex items-center justify-center text-white/60 hover:text-white/90 transition-all"
                  title={showSubtitles ? t.hideText : t.showText}
                >
                  {showSubtitles ? (
                    <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
