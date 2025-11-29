import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// 1. Expand the user's text into a visual description suitable for an NES game scene.
export const generateSceneDescription = async (userText: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert at describing retro 8-bit video game scenes (Famicom/NES style).
      
      User's dialogue line: "${userText}"
      
      Task: Create a visual description of a video game scene where this dialogue would take place. 
      The description should be optimized for an image generation model to create a pixel art style image.
      
      Requirements:
      - Style: 8-bit pixel art, Famicom/NES color palette.
      - View: Side-scrolling view or Isometric view (choose what fits best).
      - Content: Describe the environment, characters, and mood.
      - IMPORTANT: Do NOT include any text bubbles or text inside the image description. The text will be added later via UI.
      - Keep it concise (under 50 words).
      
      Output only the description.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "A generic 8-bit pixel art background.";
  } catch (error) {
    console.error("Error generating scene description:", error);
    throw new Error("Failed to interpret the text.");
  }
};

// 2. Generate the image based on the description.
export const generatePixelArtImage = async (sceneDescription: string): Promise<string> => {
  try {
    const model = 'gemini-3-pro-image-preview'; // Using the high-quality model for better pixel art adherence
    
    // We append specific style markers to ensure the look is correct
    const finalPrompt = `
      (Pixel Art style), (NES Famicom graphics), (8-bit), (retro video game screenshot).
      ${sceneDescription}.
      Clean pixel lines, dithering, limited color palette.
      No text, no HUD, no UI elements.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K",
        },
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate the pixel art.");
  }
};
