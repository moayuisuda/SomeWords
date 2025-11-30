
export enum AppState {
  IDLE = 'IDLE',
  GENERATING_PROMPT = 'GENERATING_PROMPT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface GeneratedScene {
  imageUrl: string;
  originalText: string;
  sceneDescription: string;
}

export type SceneStyle = 'JAPANESE_SCHOOL' | 'MEDIEVAL_FANTASY' | 'MILLENNIUM_CITY' | 'CASSETTE_FUTURISM';

export const SCENE_STYLES: { id: SceneStyle | 'RANDOM'; label: string }[] = [
  { id: 'JAPANESE_SCHOOL', label: '日式校园' },
  { id: 'MEDIEVAL_FANTASY', label: '中世纪冒险' },
  { id: 'MILLENNIUM_CITY', label: '千禧年都市' },
  { id: 'CASSETTE_FUTURISM', label: '磁带未来主义' },
  { id: 'RANDOM', label: '随机风格' },
];
