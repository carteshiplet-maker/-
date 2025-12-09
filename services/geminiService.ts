import { GoogleGenAI } from "@google/genai";
import { PosterRequest, PosterMode, ArtStyle, CompositionType, LightingType, BrandAnalysisResult } from "../types";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix
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
      return "Art Style: 'New Chinese' Rustic Luxury (Wabi-Sabi). Photorealistic. Atmospheric cinematic lighting. Earth tones (terracotta, slate grey, moss green, deep warm browns). Natural textures: rough pottery, aged wood, rice paper, stone. Text should look like a branded stamp or calligraphy overlaid on a scenic view. NOT cartoonish. Elegant, quiet, high-end commercial photography vibe.";
    case ArtStyle.HIGH_FASHION_EDITORIAL:
      return "Art Style: High-end Kinfolk magazine editorial. Ultra-minimalist. Massive negative space. Soft natural window lighting, muted earth tones (beige, sage, cream). Serif typography, elegant, sophisticated, quiet luxury. 8k resolution commercial photography.";
    case ArtStyle.SOFT_3D_POP:
      return "Art Style: 3D Blender/C4D render. Claymorphism and Glassmorphism. Soft, bubbly shapes, matte pastel colors, soft studio lighting. Cute, trendy, youthful. Floating 3D elements, high gloss, octane render, cheerful atmosphere.";
    case ArtStyle.ACID_Y2K:
      return "Art Style: Acid Graphics / Y2K. Liquid metal chrome textures, holographic gradients, distorted grid patterns. Neon pink and lime green on black. Retro-futuristic, experimental layout, edgy, cyberpunk vibes, glitch art elements.";
    case ArtStyle.EXPERIMENTAL_TYPOGRAPHY:
      return "Art Style: Swiss International Style met Gen-Z chaotic typography. Giant bold typography as the main visual element. High contrast black and white with one accent color. Asymmetrical balance, grid-breaking layout, artistic and bold.";
    case ArtStyle.DARK_LUXURY_GOLD:
      return "Art Style: Dark Atmospheric Luxury. Moody, low-key lighting (Chiaroscuro). Emphasis on shadows and textures (smoke, velvet, dark wood). Gold accents are subtle and antique. Premium, mysterious, exclusive club atmosphere.";
    default:
      return "Art Style: Modern Commercial Design. Clean, professional, appetizing.";
  }
};

const getCompositionPrompt = (comp: CompositionType): string => {
  switch (comp) {
    case CompositionType.MINIMAL_CENTER: return "Composition: Center-weighted, symmetrical, lots of breathing room around the subject. Minimalist.";
    case CompositionType.GOLDEN_RATIO: return "Composition: Strictly adhering to the Golden Ratio (Rule of Thirds). Balanced, pleasing to the eye, professional photo structure.";
    case CompositionType.ASYMMETRIC_DYNAMIC: return "Composition: Asymmetrical, dynamic angles, leading lines creating movement. High energy.";
    case CompositionType.MAGAZINE_GRID: return "Composition: Structured grid layout, editorial style, precise alignment of elements. Clean and orderly.";
    case CompositionType.FULL_BLEED: return "Composition: Full bleed image, immersive, elements extending beyond the frame, macro details. Impactful.";
    default: return "";
  }
};

const getLightingPrompt = (light: LightingType): string => {
  switch (light) {
    case LightingType.NATURAL_SOFT: return "Lighting: Soft, diffused daylight. No harsh shadows. Creamy highlights.";
    case LightingType.CINEMATIC_WARM: return "Lighting: Golden hour sun rays, volumetric lighting (God rays), warm orange and teal contrast.";
    case LightingType.STUDIO_CRISP: return "Lighting: High-key commercial studio lighting. Three-point lighting setup. Sharp details, crisp white light.";
    case LightingType.MOODY_DARK: return "Lighting: Low-key, dramatic shadows, rim lighting (backlighting) to separate subject from background. Mysterious.";
    case LightingType.NEON_CYBER: return "Lighting: Artificial neon light sources (pink/blue/purple). High contrast, glowing effects, reflections.";
    default: return "";
  }
};

export const analyzeBrandManual = async (pdfBase64: string): Promise<BrandAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-2.5-flash'; // Use flash for fast text/document analysis

  const prompt = `
    You are a Senior Brand Strategist. Analyze the attached Brand Manual (PDF).
    Extract the following information in strict JSON format:
    
    1. "restaurantName": The official name of the brand.
    2. "brandStory": A concise summary of the brand's philosophy, origin, and core values (in Chinese).
    3. "targetAudience": Description of the target customer group (in Chinese).
    4. "visualStyle": Key visual elements, colors, and mood described or shown in the document (in Chinese).

    Return ONLY the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("Analysis failed: No text returned");
    
    return JSON.parse(text) as BrandAnalysisResult;
  } catch (error: any) {
    console.error("PDF Analysis Error:", error);
    throw new Error("Unable to analyze PDF. Please ensure it is a valid document.");
  }
};

export const generatePoster = async (request: PosterRequest): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-2.5-flash-image';
  
  let parts: any[] = [];

  // Senior Designer Logic: Creativity Temperature
  const creativityPrompt = request.creativityLevel > 70 
    ? "CREATIVE FREEDOM: HIGH. You are a bold Art Director. Feel free to interpret the concept abstractly and artistically. Surprise the client." 
    : "CREATIVE FREEDOM: BALANCED. Adhere strictly to the professional guidelines while maintaining artistic integrity.";

  const textInstruction = `
    *** CRITICAL TEXT ENFORCEMENT ***
    1. The Brand Name is: "${request.restaurantName}"
    2. IT MUST BE WRITTEN EXACTLY AS: "${request.restaurantName}"
    3. LANGUAGE: CHINESE (Simplified).
    4. CHARACTER COUNT: The name consists of exactly ${request.restaurantName.length} Chinese characters. Count them.
    5. DO NOT SUBSTITUTE CHARACTERS. For example, do not change "可" to "巨". 
    6. Treat "${request.restaurantName}" as a fixed graphical logo asset. It must be legible, high-contrast, and spelled correctly.
    7. Typography style: Matches "${request.style}" (e.g., Brush calligraphy for Neo-Chinese, Elegant Serif for Luxury).
  `;

  const cleanlinessInstruction = `
    *** CLEANLINESS PROTOCOL ***
    1. STRICTLY FORBIDDEN: Watermarks, Stock photo text, Platform logos (Dianping/Meituan), Website URLs.
    2. If the reference image contains a watermark (like "大众点评"), REMOVE IT completely in the generation.
    3. Final output must look like a pristine, printed high-end poster.
  `;

  const contextBlock = `
    Client Profile:
    - Name: "${request.restaurantName}"
    - Brand Story: ${request.brandStory}
    - Target Audience: ${request.targetAudience}
    - Commercial Scale: High-end Chain Brand. Consistent, scalable visual identity.
  `;

  const technicalSpecs = `
    Technical Specs:
    - ${getCompositionPrompt(request.composition)}
    - ${getLightingPrompt(request.lighting)}
    - Resolution: 8k, Ultra-HD.
    - Render Engine: Octane Render / Unreal Engine 5 style / Commercial Photography.
    - ${creativityPrompt}
  `;

  let mainPrompt = "";
  const styleDescription = getStylePrompt(request.style);

  if (request.mode === PosterMode.VIBE) {
    mainPrompt = `
      Role: Senior Art Director for a Luxury Restaurant Group.
      Task: Design a Master Visual Poster (MVP).

      ${contextBlock}
      ${textInstruction}
      ${cleanlinessInstruction}

      ART DIRECTION:
      ${styleDescription}
      ${technicalSpecs}
      
      SCENE DESCRIPTION:
      ${request.description}
      
      ${request.images && request.images.length > 0 ? "VISUAL REFERENCES: Analyze the uploaded images for texture, color palette, and architecture. Re-create this vibe in a higher quality, watermark-free render." : ""}
      
      FINAL VERIFICATION:
      Ensure the text "${request.restaurantName}" is present and spelled correctly. It must be "${request.restaurantName}".
    `;
    
    if (request.images) {
      request.images.forEach(base64 => {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64 } });
      });
    }
    parts.push({ text: mainPrompt });

  } else if (request.mode === PosterMode.DISH) {
    if (!request.images || request.images.length === 0) {
      throw new Error("Reference images required for Dish mode.");
    }

    mainPrompt = `
      Role: Senior Food Stylist & Graphic Designer.
      Task: Create a Gourmet Product Poster.

      ${contextBlock}
      ${textInstruction}
      ${cleanlinessInstruction}

      ART DIRECTION:
      ${styleDescription}
      ${technicalSpecs}
      
      PRODUCT DETAILS:
      ${request.description}
      
      EXECUTION:
      - Composite the provided food images into a cohesive, high-art scene.
      - Apply the specified lighting "${request.lighting}" to the food to make it appetizing and dramatic.
      - Ensure the layout "${request.composition}" guides the eye effectively.
      - Remove any messy backgrounds or watermarks from source images.
      
      FINAL VERIFICATION:
      The text "${request.restaurantName}" MUST be visible and correct. Do not misspell it.
    `;

    request.images.forEach(base64 => {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64 } });
    });
    parts.push({ text: mainPrompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: parts },
      config: {
        imageConfig: { aspectRatio: "3:4" }
      }
    });

    if (response.candidates && response.candidates[0].content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Design generation failed.");
  }
};
