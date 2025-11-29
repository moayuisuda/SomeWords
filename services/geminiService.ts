import { GoogleGenAI, Type } from "@google/genai";
import { SceneStyle } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get style-specific prompt details
const getStylePrompts = (style: SceneStyle) => {
  switch (style) {
    case 'MEDIEVAL_FANTASY':
      return {
        desc: 'Medieval fantasy RPG, stone castles, dungeons, forests, torches, knights, magic, Dragon Quest style.',
        visual: 'Medieval fantasy aesthetic, earth tones, brick textures, medieval architecture, swords and sorcery atmosphere, flickering torchlight, mysterious shadows.'
      };
    case 'MODERN_CITY':
      return {
        desc: 'Modern urban city, night life, street lights, concrete buildings, convenience stores, traffic, River City Ransom style.',
        visual: 'Urban city aesthetic, neon lights against dark buildings, asphalt, modern clothing, city pop vibe, melancholic night rain, street lamps.'
      };
    case 'CASSETTE_FUTURISM':
      return {
        desc: '80s retro-futurism, analog tech, CRT monitors, wires, industrial sci-fi, beige and orange plastics, Metal Gear/Snatcher style.',
        visual: 'Cassette futurism aesthetic, lo-fi sci-fi, industrial pipes, computer terminals, retro tech atmosphere, cold florescent lighting, messy wires.'
      };
    case 'JAPANESE_SCHOOL':
    default:
      return {
        desc: 'Japanese high school, classroom, hallway, rooftop, cherry blossoms, nostalgic, sentimental.',
        visual: 'Japanese visual novel style, school uniforms, clean lines, nostalgic atmosphere, warm sunset light, sentimental mood, cherry blossom petals.'
      };
  }
};

// 1. Expand the user's text into a visual description suitable for an NES game scene.
export const generateSceneDescription = async (userText: string, style: SceneStyle): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const styleInfo = getStylePrompts(style);

    const prompt = `
      You are an expert at directing retro 8-bit video game scenes (Famicom/NES style).
      
      User's dialogue line: "${userText}"
      Selected Style: ${style} (${styleInfo.desc})
      
      Task: Create a visual description of a video game scene that captures the *emotion* and *story* of the dialogue.
      Don't just list objects. Focus on the mood, lighting, weather, and environmental storytelling details.
      The scene must feel like a frozen moment in a touching story, not a generic background.
      
      Requirements:
      - Style: 8-bit pixel art, Famicom/NES color palette.
      - Perspective: **Strictly Top-Down 2D RPG view** (like Zelda: Link's Awakening, Final Fantasy, Pokemon, or Mother/Earthbound).
      - Mood: Match the emotion of the text (e.g., lonely, hopeful, tense, cozy).
      - Content: Describe the environment and the character's placement. Use lighting and weather to tell the story.
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
export const generatePixelArtImage = async (sceneDescription: string, style: SceneStyle): Promise<string> => {
  try {
    const model = 'gemini-3-pro-image-preview'; // Using the high-quality model for better pixel art adherence
    const styleInfo = getStylePrompts(style);
    
    // We append specific style markers to ensure the look is correct
    const finalPrompt = `
      (Pixel Art style), (NES Famicom graphics), (8-bit), (retro video game screenshot).
      ${styleInfo.visual}
      Perspective: Top-down 2D RPG view.
      Scene: ${sceneDescription}.
      
      Art Direction: Cinematic composition, emotional atmosphere, storytelling environment. 
      Visuals: Extremely low resolution, macro pixels, jagged edges, aliased.
      Palette: Limited color palette (NES palette), blocky shapes, dithering.
      Negative prompt: No anti-aliasing, no gradients, no photorealism, no 3D render, no isometric, no text, no HUD, no UI elements.
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