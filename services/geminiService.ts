import { GoogleGenAI } from "@google/genai";
import { PosterRequest, PosterMode, ArtStyle } from "../types";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getStylePrompt = (style: ArtStyle): string => {
  switch (style) {
    case ArtStyle.NEO_CHINESE_CHIC:
      // Updated to match "Xihe Tavern" aesthetic: Wabi-sabi, Rustic, Cinematic, High-End
      return "Art Style: 'New Chinese' Rustic Luxury (Wabi-Sabi). Photorealistic. Atmospheric cinematic lighting. Earth tones (terracotta, slate grey, moss green, deep warm browns). Natural textures: rough pottery, aged wood, rice paper, stone. Text should look like a branded stamp or calligraphy overlaid on a scenic view. NOT cartoonish. NOT flat vector. Elegant, quiet, high-end commercial photography vibe.";
    
    case ArtStyle.HIGH_FASHION_EDITORIAL:
      return "Art Style: High-end Kinfolk magazine editorial. Ultra-minimalist. Massive negative space (70% whitespace). Soft natural window lighting, muted earth tones (beige, sage, cream). Serif typography, elegant, sophisticated, quiet luxury. 8k resolution commercial photography.";
    
    case ArtStyle.SOFT_3D_POP:
      return "Art Style: 3D Blender/C4D render. Claymorphism and Glassmorphism. Soft, bubbly shapes, matte pastel colors, soft studio lighting. Cute, trendy, youthful. Floating 3D elements, high gloss, octane render, cheerful atmosphere.";
    
    case ArtStyle.ACID_Y2K:
      return "Art Style: Acid Graphics / Y2K. Liquid metal chrome textures, holographic gradients, distorted grid patterns. Neon pink and lime green on black. Retro-futuristic, experimental layout, edgy, cyberpunk vibes, glitch art elements.";
    
    case ArtStyle.EXPERIMENTAL_TYPOGRAPHY:
      return "Art Style: Swiss International Style met Gen-Z chaotic typography. Giant bold typography as the main visual element. High contrast black and white with one accent color. Asymmetrical balance, grid-breaking layout, artistic and bold.";
    
    case ArtStyle.DARK_LUXURY_GOLD:
      return "Art Style: Dark Atmospheric Luxury. Moody, low-key lighting (Chiaroscuro). Emphasis on shadows and textures (smoke, velvet, dark wood). Gold accents are subtle and antique, not shiny cheap gold. Premium, mysterious, exclusive club atmosphere.";
      
    default:
      return "Art Style: Modern Commercial Design. Clean, professional, appetizing.";
  }
};

export const generatePoster = async (request: PosterRequest): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-2.5-flash-image';
  
  let parts: any[] = [];

  // --- ENHANCED TEXT HANDLING STRATEGY ---
  const textInstruction = `
    CRITICAL REQUIREMENT - TEXT RENDERING:
    1. The text "${request.restaurantName}" MUST appear on the poster.
    2. Treat "${request.restaurantName}" as the MAIN ARTISTIC LOGO.
    3. The characters MUST be written in correct Simplified Chinese: "${request.restaurantName}".
    4. Do not invent strokes. Do not merge characters. Write them clearly.
    5. Font suggestion: For Neo-Chinese, use Calligraphy or Songti. For others, use clean Sans-serif.
    6. Ensure high readability against the background (use drop shadows or clean zones if needed).
  `;

  // --- ANTI-WATERMARK PROTOCOL ---
  const cleanlinessInstruction = `
    CRITICAL REQUIREMENT - CLEANLINESS:
    1. STRICTLY NO WATERMARKS.
    2. STRICTLY NO PLATFORM LOGOS (e.g., No "Dianping", No "Meituan", No "Little Red Book" icons).
    3. STRICTLY NO COPYRIGHT TEXT or website URLs in the corners.
    4. If the input reference images contain watermarks or logos, you MUST REMOVE them in the generated output. The final image must look like a clean, original print file.
    5. No camera UI elements, no timestamps, no battery icons.
  `;

  // Context Construction
  const contextBlock = `
    Brand Identity:
    - Name: "${request.restaurantName}"
    - Philosophy/Story: ${request.brandStory || "Quality and creativity"}
    - Target Audience: ${request.targetAudience || "Gen-Z and foodies"}
  `;

  const qualityModifiers = "Award-winning poster design, trending on Behance, Pinterest aesthetic, 8k resolution, ultra-detailed, perfect composition, cinematic lighting, clean finish.";

  let mainPrompt = "";
  const styleDescription = getStylePrompt(request.style);

  // --- VIBE MODE ---
  if (request.mode === PosterMode.VIBE) {
    mainPrompt = `
      Design a professional, artistic high-end promotional poster for a restaurant.
      
      ${contextBlock}
      ${textInstruction}
      ${cleanlinessInstruction}

      VISUAL DIRECTION & STYLE:
      ${styleDescription}
      
      SCENE/VIBE DETAILS:
      ${request.description}
      
      ${request.images && request.images.length > 0 ? "IMPORTANT: The user has provided reference images (menu, environment, or brochure). Analyze the VISUAL STYLE, COLOR PALETTE, and TEXTURES from these images and apply them to the poster. Do not just copy the images, but adopt their 'High-End' aesthetic. IGNORE any watermarks on these reference images." : ""}
      
      COMPOSITION RULES:
      - Integrate the environment/vibe description with the art style.
      - Ensure the text "${request.restaurantName}" is the focal point or visually balanced.
      - Make it look like a real printed poster found in a high-end gallery or luxury establishment.
      
      ${qualityModifiers}
    `;
    
    // Add images as context/reference if they exist
    if (request.images && request.images.length > 0) {
      request.images.forEach(base64Image => {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        });
      });
    }
    
    parts.push({ text: mainPrompt });

  // --- DISH MODE ---
  } else if (request.mode === PosterMode.DISH) {
    if (!request.images || request.images.length === 0) {
      throw new Error("At least one image is required for Dish Composition mode.");
    }

    mainPrompt = `
      Create a high-fashion, artistic composite poster featuring specific food dishes.
      
      ${contextBlock}
      ${textInstruction}
      ${cleanlinessInstruction}

      VISUAL DIRECTION:
      ${styleDescription}
      
      DISH/PRODUCT DETAILS:
      ${request.description}
      
      COMPOSITION RULES:
      1. Use the provided images as the MAIN subjects.
      2. Do NOT just paste the images. Blend them artistically into the scene using the "${request.style}" aesthetic.
      3. Create a layout that leads the eye to the brand name "${request.restaurantName}".
      4. Ensure the food looks delicious, premium, and artfully arranged.
      5. REMOVE ANY WATERMARKS found on the original food photos.
      
      ${qualityModifiers}
    `;

    // Add images
    request.images.forEach(base64Image => {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      });
    });

    parts.push({ text: mainPrompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          // 3:4 is standard poster ratio
          aspectRatio: "3:4",
        }
      }
    });

    // Parse Response
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
             return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("Generation successful but no image returned. The model might have been blocked or returned only text.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate poster. Please try again.");
  }
};