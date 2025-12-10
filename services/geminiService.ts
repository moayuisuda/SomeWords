
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
        visual: 'Medieval fantasy RPG (Dragon Quest IV style), stone brick textures, medieval architecture, pixelated torchlight using dithering, high contrast shadows, chiptune aesthetic.'
      };
    case 'MILLENNIUM_CITY':
      return {
        desc: 'Early 2000s Asian metropolis (like Tokyo, Taipei, or Seoul). Nostalgic urban memory, Kairosoft simulation game style. Dense streets, overhead power lines against the sky, vending machines, small shops, concrete apartments with balconies, outdoor air conditioning units. Realistic everyday life, not sci-fi.',
        visual: 'Detailed isometric pixel art, Asian city aesthetic (Tokyo/Seoul), PS1/GBA era pre-rendered background style. Features: Dense urban landscape, overhead power lines, air conditioning units, vending machines, tiled concrete. Colors: Urban greys, faded signage colors, hard edges, no blur.'
      };
    case 'CASSETTE_FUTURISM':
      return {
        desc: '80s retro-futurism, analog tech, CRT monitors, wires, industrial sci-fi, beige and orange plastics, Metal Gear/Snatcher style.',
        visual: 'Cassette futurism, NES sci-fi (like Metal Gear or Snatcher), industrial pipes, green screen terminals, retro tech atmosphere, cold florescent lighting using solid colors, limited palette.'
      };
    case 'JAPANESE_SCHOOL':
    default:
      return {
        desc: 'Japanese high school, classroom, hallway, rooftop, cherry blossoms, nostalgic, sentimental.',
        visual: 'Japanese adventure game (AVG) background, uniforms, clean pixel lines, nostalgic atmosphere, cherry blossom petals, hard shadows.'
      };
  }
};

// 1. Expand the user's text into a visual description suitable for an NES game scene.
export const generateSceneDescription = async (userText: string, style: SceneStyle): Promise<string> => {
  try {
    const model = 'gemini-2.5-pro';
    const styleInfo = getStylePrompts(style);

    const prompt = `
      You are an expert at directing retro 8-bit video game scenes (Famicom/NES style).
      
      User's dialogue line: "${userText}"
      Selected Style: ${style} (${styleInfo.desc})
      
      Task: Create a visual description of a video game scene that captures the *emotion* and *story* of the dialogue.
      
      CRITICAL - Character Dynamics & Interaction:
      - Analyze the dialogue to determine the characters.
      - IF MULTIPLE CHARACTERS ARE PRESENT: They should be **INTERACTING**.
         - Describe specific body language (e.g., pointing, holding hands, handing an item, comforting).
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
    // Optimized for authentic NES/FC feel, avoiding "AI smoothing"
    const finalPrompt = `
      Create an authentic 8-bit NES/Famicom video game screenshot.
      
      Scene Context: ${sceneDescription}
      Style Specifics: ${styleInfo.visual}
      
      VISUAL RULES (STRICTLY ENFORCE):
      1. HARDWARE LIMITATIONS: Simulate the NES 54-color palette limitation. Use high contrast.
      2. PIXELATION: The image must look like it was drawn pixel-by-pixel. MACRO PIXELS.
      3. SHADING: Use DITHERING (checkerboard patterns) for shading. DO NOT use gradients, soft light, or bloom.
      4. EDGES: Hard, aliased edges only. NO anti-aliasing.
      5. VIEWPOINT: Isometric or classic side-scroller perspective depending on context, but prefer Isometric 2.5D.
      
      Negative Prompt:
      Vector art, smooth lines, anti-aliasing, blur, bloom, glow effects, modern indie game style, high resolution details, photorealism, 3D rendering, gradients, soft shadows, oil painting, watercolor, text, UI overlay, glitch, noise, chromatic aberration.
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
