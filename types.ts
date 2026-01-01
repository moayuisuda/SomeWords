
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

export const SCENE_STYLE_IDS: (SceneStyle | 'RANDOM')[] = [
  'JAPANESE_SCHOOL',
  'MEDIEVAL_FANTASY',
  'MILLENNIUM_CITY',
  'CASSETTE_FUTURISM',
  'RANDOM',
];

export type Language = 'en' | 'zh';

export type SubtitleType = 'HORIZONTAL' | 'VERTICAL_LEFT' | 'HORIZONTAL_NO_BG' | 'VERTICAL_LEFT_NO_BG';
