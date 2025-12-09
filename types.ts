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

export interface PosterRequest {
  restaurantName: string;
  description: string; // Product description or vibe description
  brandStory: string; // Brand philosophy/intro
  targetAudience: string; // Customer group
  style: ArtStyle;
  images?: string[]; // Global: Can be reference images (Vibe) or subject images (Dish)
  mode: PosterMode;
}

export interface GeneratedPoster {
  imageUrl: string;
  promptUsed: string;
  timestamp: number;
}