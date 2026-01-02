import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { SceneStyle } from "../../../types";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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

export async function POST(request: Request) {
  try {
    const { sceneDescription, style, aspectRatio = "16:9" } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const styleInfo = getStylePrompts(style);
    
    const model = 'gemini-3-pro-image-preview';
    
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
      5. VIEWPOINT: Top-down Isometric perspective. The view should be zoomed out (not too close) to capture the scene. Ensure correct proportions and scale for all objects.
      6. NO TEXT: The image must contain NO text, labels, or HUD elements.
      
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
      if (part.inlineData && part.inlineData.data) {
        // Optimization: Save Base64 to local file system to avoid large JSON payloads
        // Note: In production (e.g. Vercel), this should upload to Blob Storage (S3, Vercel Blob) instead.
        const base64Data = part.inlineData.data;
        
        // Fix for Read-Only File System (Serverless/Vercel):
        // We cannot write to the local filesystem (except /tmp, which is not accessible publicly).
        // Returning Base64 Data URL allows the frontend to display the image immediately.
        // For production apps, consider uploading 'buffer' to S3 or Vercel Blob.
        const imageUrl = `data:image/png;base64,${base64Data}`;
        
        return NextResponse.json({ imageUrl });
      }
    }
    
    throw new Error("No image data found in response.");
    
  } catch (error: any) {
    console.error("Error generating image:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image." }, { status: 500 });
  }
}
