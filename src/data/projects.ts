// 作品清單：新增作品時在這裡加一筆
// featured: true 的作品會顯示在首頁
export type Project = {
  name: string;
  summary: string;
  tags: string[];
  demo?: string; // 線上 Demo 網址
  source: string; // 原始碼網址
  featured?: boolean;
};

const repo = 'https://github.com/MosaicsLi/MosaicsLi.github.io/tree/main/apps';

export const projects: Project[] = [
  {
    name: '研究室見學録 LabInterview',
    summary:
      '記錄研究室參訪的 Web App。用 Google OAuth 2.0 登入，資料同步到 Google Sheets，並驗證「只限學校帳號登入」的 Internal OAuth 設定。附重構計畫（BFF + HttpOnly Cookie）。',
    tags: ['React', 'TypeScript', 'Google OAuth 2.0', 'Google Sheets API', 'Tailwind CSS'],
    demo: '/LabInterview/',
    source: `${repo}/lab-interview`,
    featured: true,
  },
  {
    name: 'Ink Sort Puzzle',
    summary: '把同色墨水倒進同一支試管的益智小遊戲。關卡依等級自動產生、難度遞增，支援復原與重來，進度存在 localStorage。',
    tags: ['React', 'TypeScript', '遊戲邏輯', 'Motion'],
    demo: '/ink-sort-puzzle/',
    source: `${repo}/ink-sort-puzzle`,
    featured: true,
  },
  {
    name: 'Cocofolia Voice Trigger',
    summary: 'Chrome 擴充功能：用 MutationObserver 監看 Cocofolia 聊天室，偵測以 voice 開頭的新訊息，呼叫 VOICEVOX 自動朗讀。',
    tags: ['Chrome 擴充功能', 'Manifest V3', 'JavaScript', 'MutationObserver'],
    source: `${repo}/cocofolia-voice-extension`,
    featured: true,
  },
];
