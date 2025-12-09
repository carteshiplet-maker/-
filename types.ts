export enum PosterMode {
  VIBE = 'VIBE',
  DISH = 'DISH',
}

export enum ArtStyle {
  NEO_CHINESE_CHIC = 'Neo-Chinese Chic', // 国潮/新中式 (Updated to be more Wabi-Sabi/High-end)
  ACID_Y2K = 'Acid Graphics / Y2K', // 酸性/Y2K
  SOFT_3D_POP = '3D Soft Pop', // C4D/3D泡泡
  HIGH_FASHION_EDITORIAL = 'High-Fashion Minimal', // 高级杂志感
  DARK_LUXURY_GOLD = 'Dark Luxury Gold', // 黑金奢华
  EXPERIMENTAL_TYPOGRAPHY = 'Experimental Typography', // 实验排版
}

// New Pro Features
export enum CompositionType {
  MINIMAL_CENTER = 'Minimalist Center Focus',
  GOLDEN_RATIO = 'Golden Ratio / Rule of Thirds',
  ASYMMETRIC_DYNAMIC = 'Asymmetric / Dynamic Diagonal',
  MAGAZINE_GRID = 'Editorial Grid Layout',
  FULL_BLEED = 'Immersive Full Bleed',
}

export enum LightingType {
  NATURAL_SOFT = 'Natural Window Light (Soft)',
  CINEMATIC_WARM = 'Cinematic Warm (Golden Hour)',
  STUDIO_CRISP = 'High-End Studio (Crisp)',
  MOODY_DARK = 'Moody / Chiaroscuro (Dark)',
  NEON_CYBER = 'Neon / Artificial (Cyber)',
}

export interface PosterRequest {
  restaurantName: string;
  description: string;
  brandStory: string;
  targetAudience: string;
  style: ArtStyle;
  images?: string[];
  mode: PosterMode;
  // New Pro Fields
  composition: CompositionType;
  lighting: LightingType;
  creativityLevel: number; // 0 to 100
}

export interface GeneratedPoster {
  imageUrl: string;
  promptUsed: string;
  timestamp: number;
}

export interface BrandAnalysisResult {
  restaurantName: string;
  brandStory: string;
  targetAudience: string;
  visualStyle: string;
}
