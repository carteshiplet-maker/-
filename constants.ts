import { ArtStyle, CompositionType, LightingType } from './types';

export const STYLE_OPTIONS = [
  { 
    value: ArtStyle.NEO_CHINESE_CHIC, 
    label: '新中式国潮 (Neo-Chinese)', 
    description: '东方美学、Wabi-Sabi、书法元素、沉稳大气' 
  },
  { 
    value: ArtStyle.HIGH_FASHION_EDITORIAL, 
    label: '极简杂志风 (Editorial)', 
    description: '大面积留白、Kinfolk风格、高级灰调、冷淡奢华' 
  },
  { 
    value: ArtStyle.DARK_LUXURY_GOLD, 
    label: '黑金奢华 (Dark Luxury)', 
    description: '暗调灯光、金色质感、神秘高级、适合高端餐饮' 
  },
  { 
    value: ArtStyle.SOFT_3D_POP, 
    label: '3D 软萌波普 (3D Pop)', 
    description: 'C4D风格、磨砂玻璃、年轻活力、适合甜品快餐' 
  },
  { 
    value: ArtStyle.ACID_Y2K, 
    label: '酸性金属/Y2K (Acid)', 
    description: '液态金属、霓虹渐变、未来感、适合酒吧夜店' 
  },
  { 
    value: ArtStyle.EXPERIMENTAL_TYPOGRAPHY, 
    label: '实验排版 (Typographic)', 
    description: '文字为主、强烈对比、艺术冲击力、品牌宣言' 
  },
];

export const COMPOSITION_OPTIONS = [
  { value: CompositionType.MINIMAL_CENTER, label: '极简居中 (Center Focus)' },
  { value: CompositionType.GOLDEN_RATIO, label: '黄金分割 (Golden Ratio)' },
  { value: CompositionType.ASYMMETRIC_DYNAMIC, label: '动态非对称 (Dynamic)' },
  { value: CompositionType.MAGAZINE_GRID, label: '杂志网格 (Grid Layout)' },
  { value: CompositionType.FULL_BLEED, label: '沉浸式全幅 (Full Bleed)' },
];

export const LIGHTING_OPTIONS = [
  { value: LightingType.NATURAL_SOFT, label: '自然柔光 (Natural Soft)' },
  { value: LightingType.CINEMATIC_WARM, label: '电影暖调 (Cinematic)' },
  { value: LightingType.STUDIO_CRISP, label: '商业影棚 (Studio Crisp)' },
  { value: LightingType.MOODY_DARK, label: '静谧暗调 (Moody Dark)' },
  { value: LightingType.NEON_CYBER, label: '霓虹光感 (Neon Cyber)' },
];

export const APP_NAME = "GourmetArt Pro";