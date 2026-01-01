import { snapdom } from '@zumer/snapdom';

/**
 * Captures the main content element and saves it as an image using snapdom.
 * This preserves all CSS effects including glow, scanlines, and text overlays.
 */
export const saveImage = async (filename: string) => {
  const element = document.querySelector('.main-content');
  if (!element) {
    console.error("Could not find .main-content element to capture");
    return;
  }

  try {
    await snapdom.download(element as HTMLElement, {
      filename: filename,
      scale: 2, // Higher resolution
      fast: true, // Skip small idle delays
      embedFonts: true // Ensure web fonts are embedded
    });
  } catch (error) {
    console.error("Failed to save image with snapdom:", error);
  }
};
