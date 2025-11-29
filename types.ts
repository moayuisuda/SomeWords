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
