
import { Language, SceneStyle } from '../types';

interface TranslationSet {
  insertCoin: string;
  enterDialogue: string;
  controls: string;
  start: string;
  select: string;
  generate: string;
  reset: string;
  gameStyle: string;
  dialogue: string;
  readingCartridge: string;
  renderingGraphics: string;
  systemError: string;
  resetSystem: string;
  saveToDisk: string;
  imgOnly: string;
  withText: string;
  hideText: string;
  showText: string;
  save: string;
  horizontalText: string;
  verticalText: string;
  horizontalNoBg: string;
  verticalNoBg: string;
  dailyLimitReached: string;
  remainingCredits: string;
  styles: Record<SceneStyle | 'RANDOM', string>;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    insertCoin: "INSERT COIN",
    enterDialogue: "PLEASE ENTER DIALOGUE BELOW",
    controls: "CONTROLS",
    start: "START",
    select: "SELECT",
    generate: "START",
    reset: "RESET",
    gameStyle: "GAME STYLE",
    dialogue: "DIALOGUE",
    readingCartridge: "READING CARTRIDGE...",
    renderingGraphics: "RENDERING GRAPHICS...",
    systemError: "SYSTEM ERROR",
    resetSystem: "RESET SYSTEM",
    saveToDisk: "SAVE TO DISK",
    imgOnly: "IMG ONLY",
    withText: "WITH TEXT",
    hideText: "HIDE TEXT",
    showText: "SHOW TEXT",
    save: "SAVE",
    horizontalText: "Horizontal Text",
    verticalText: "Vertical Text",
    horizontalNoBg: "Horizontal (No BG)",
    verticalNoBg: "Vertical (No BG)",
    dailyLimitReached: "DAILY LIMIT REACHED (3/3)",
    remainingCredits: "CREDITS:",
    styles: {
      JAPANESE_SCHOOL: "Japanese School",
      MEDIEVAL_FANTASY: "Medieval Fantasy",
      MILLENNIUM_CITY: "Millennium City",
      CASSETTE_FUTURISM: "Cassette Futurism",
      RANDOM: "Random Style"
    }
  },
  zh: {
    insertCoin: "投入代币",
    enterDialogue: "请在下方输入对话",
    controls: "操作说明",
    start: "开始",
    select: "选择",
    generate: "生成",
    reset: "重置",
    gameStyle: "游戏风格",
    dialogue: "剧情文本",
    readingCartridge: "读取卡带中...",
    renderingGraphics: "渲染画面中...",
    systemError: "系统错误",
    resetSystem: "重启系统",
    saveToDisk: "保存到磁盘",
    imgOnly: "仅图片",
    withText: "带字幕",
    hideText: "隐藏字幕",
    showText: "显示字幕",
    save: "保存截图",
    horizontalText: "横向字幕",
    verticalText: "竖向字幕",
    horizontalNoBg: "横向字幕 (无背景)",
    verticalNoBg: "竖向字幕 (无背景)",
    dailyLimitReached: "今日次数已用完 (3/3)",
    remainingCredits: "剩余次数:",
    styles: {
      JAPANESE_SCHOOL: "日式校园",
      MEDIEVAL_FANTASY: "中世纪冒险",
      MILLENNIUM_CITY: "千禧年都市",
      CASSETTE_FUTURISM: "磁带未来主义",
      RANDOM: "随机风格"
    }
  }
};
