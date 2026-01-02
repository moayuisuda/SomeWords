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
    // @ts-ignore - 'format' is supported in download options but missing in types
    await snapdom.download(element as HTMLElement, {
      filename: filename,
      // @ts-ignore
      format: 'jpg', // Change to JPG for smaller file size
      // quality: 0.9,  // Slightly reduce quality for better compression
      scale: 2,    // Reduce scale from 2 to 1.5
      fast: true,    // Skip small idle delays
      embedFonts: true // Ensure web fonts are embedded
    });
  } catch (error) {
    console.error("Failed to save image with snapdom:", error);
  }
};
