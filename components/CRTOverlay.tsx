import React from "react";
import { SubtitleType } from "../types";
import DialogBox from "./DialogBox";

interface CRTOverlayProps {
  dialogText?: string;
  subtitleType?: SubtitleType;
}

const CRTOverlay: React.FC<CRTOverlayProps> = ({
  dialogText,
  subtitleType = "HORIZONTAL",
}) => {
  return (
    <div>
      {/* Scanlines */}
      <div className="absolute z-20 inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

      {/* Slight Flicker/Noise */}

      {/* Dialog Box (if text is present) */}
      {dialogText && <DialogBox text={dialogText} type={subtitleType} />}

      <div className="absolute z-20 inset-0 bg-white animate-[flicker-overlay_0.2s_infinite] pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-30"></div>
    </div>
  );
};

export default CRTOverlay;
