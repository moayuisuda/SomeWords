
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
    case 'MILLENNIUM_CITY':
      return {
        desc: 'Early 2000s Asian metropolis (like Tokyo, Taipei, or Seoul). Nostalgic urban memory, Kairosoft simulation game style. Dense streets, overhead power lines against the sky, vending machines, small shops, concrete apartments with balconies, outdoor air conditioning units. Realistic everyday life, not sci-fi.',
        visual: 'Detailed isometric pixel art, early 2000s Asian city aesthetic (Tokyo/Seoul/Taipei), PS1/PS2 era pre-rendered background style. Features: Dense urban landscape, narrow streets, tangled overhead power lines, outdoor air conditioning units on balconies, vending machines, vertical signage, convenience stores, tiled concrete building facades. Color Palette: Natural urban tones, slightly desaturated, soft daylight, early digital photography feel, urban grey and concrete. Atmosphere: Nostalgic, dense but quiet, lived-in, not yellow or sepia.'
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
        visual: 'Japanese visual novel style, school uniforms, clean lines, nostalgic atmosphere, sentimental mood, cherry blossom petals.'
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
      
      CRITICAL - Character Dynamics & Interaction:
      - Analyze the dialogue to determine the characters.
      - IF TWO CHARACTERS ARE PRESENT: They must be **INTERACTING**, not just standing nearby.
         - Describe specific body language (e.g., pointing, holding hands, handing an item, fighting, comforting, turning away in anger).
      - If solitary: Describe the character engaging with the environment (looking at the sky, sitting at a desk, etc.).
      
      Requirements:
      - Style: 8-bit pixel art, Famicom/NES color palette.
      - Perspective: **Isometric view** (like Final Fantasy Tactics, Tactics Ogre, Solstice, or Landstalker).
      - Mood: Match the emotion of the text (e.g., lonely, hopeful, tense, cozy).
      - Content: Describe the environment and the characters' placement/interaction. Use lighting and weather to tell the story.
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
export const generatePixelArtImage = async (
  sceneDescription: string, 
  style: SceneStyle,
  aspectRatio: "16:9" | "4:3" = "16:9"
): Promise<string> => {
  try {
    const model = 'gemini-3-pro-image-preview'; // Using the high-quality model for better pixel art adherence
    const styleInfo = getStylePrompts(style);
    
    // We append specific style markers to ensure the look is correct
    const finalPrompt = `
      (Pixel Art style), (NES Famicom graphics), (8-bit), (retro video game screenshot).
      ${styleInfo.visual}
      Perspective: Isometric view.
      Scene: ${sceneDescription}.
      Composition: Center-top focus. Single full screen image.
      
      Art Direction: Cinematic composition, emotional atmosphere, storytelling environment. 
      Character Interaction: Characters must be facing each other or interacting with the environment. Avoid characters looking directly at the camera/viewer. Strong connection between subjects.
      Visuals: Extremely low resolution, macro pixels, jagged edges, aliased.
      Palette: Limited color palette (NES palette), blocky shapes, dithering.
      Negative prompt: Split screen, multiple panels, black bar, border, collage, sprite sheet, characters looking at camera, breaking the fourth wall, passport photo style, floating heads, text, HUD, UI elements, anti-aliasing, gradients, photorealism, 3D render.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
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
