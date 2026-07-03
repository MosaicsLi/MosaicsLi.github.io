# 專案重構提案 (Refactoring Plan)

為了提高本專案的**可讀性**、**可維護性**以及**安全性**，我們針對現有的代碼結構與認證機制設計了此重構案。本專案目前採用 React + Vite + TypeScript 開發，但核心邏輯高度集中於 [App.tsx](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/App.tsx)，且認證資訊的管理存在安全隱憂。

本文件將詳述現有的架構痛點、重構目標、建議的專案結構，以及關鍵模組的實作設計。

---

## 1. 現有架構痛點分析 (Current Issues)

### A. 上帝元件 (God Component)
目前所有的核心狀態（名冊 `professors`、試算表 ID `spreadsheetId`、同步狀態 `syncStatus` 等）以及 API 交互邏輯（登入、同步、輪詢、錯誤處理）都直接寫在 [App.tsx](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/App.tsx) 中。這導致 `App.tsx` 的職責過於龐大（接近 500 行），使程式碼變得難以閱讀與測試。

### B. 安全性隱憂 (Security Vulnerability in Token Storage)
現有的 `refresh_token` 直接儲存在前端的 `localStorage` 中。這在網頁應用程式中容易遭受 **XSS（跨網站指令碼）攻擊**。任何被惡意注入的腳本都可以輕易讀取 `localStorage`，進而獲取使用者的 Google API 長效存取權限。

### C. 缺乏統一的 API 請求與攔截機制
在 [googleSheetsService.ts](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/services/googleSheetsService.ts) 中，所有的 Google API 和自建後端請求都是透過原生的 `fetch` 逐個發送。當遇到 Access Token 過期（401 錯誤）時，代碼必須在各個呼叫點手動抓取錯誤、呼叫更新 Token 機制，並進行手動重試，這產生了大量重複的重複代碼（Boilerplate Code）。

### D. 本地快取與雲端同步邏輯混雜
本地的更新操作（如 `handleAddProfessor`, `handleToggleVisited`）會直接觸發一次非同步的 `syncToCloud`。如果網路環境不穩定，或者同步頻率過高，可能導致請求順序錯亂（Race Conditions），使雲端與本地資料產生不一致。

---

## 2. 重構目標 (Refactoring Goals)

1. **職責分離 (Separation of Concerns)**：將 UI 渲染與業務邏輯、API 請求徹底解耦。
2. **安全性提升 (Security Hardening)**：引入 BFF (Backend-for-Frontend) 模式，以 Secure HttpOnly Cookie 管理權杖。
3. **模組化 API 客戶端 (Modular API Client)**：利用 Axios 攔截器實作自動無感重新整理 Token (Silent Auto-Refresh)。
4. **自定義 Hooks 封裝 (Custom Hooks)**：將狀態管理與同步邏輯提取至自定義 React Hooks，簡化主頁面。

---

## 3. 重構後專案架構 (Target Directory Structure)

建議將 `src` 底下的結構進行以下重組：

```text
src/
├── assets/             # 靜態資源（圖片、字型）
├── components/         # 純 UI 元件（無複雜業務邏輯）
│   ├── Header.tsx
│   ├── VisitForm.tsx
│   ├── VisitList.tsx
│   └── VisitItem.tsx
├── config/             # 設定檔存放區（環境變數定義等）
│   └── env.ts
├── context/            # 全域上下文狀態
│   └── AuthContext.tsx # 提供登入狀態、使用者資訊與登入/登出方法
├── hooks/              # 自定義 React Hooks
│   ├── useAuth.ts      # 封裝與 AuthContext 互動的捷徑
│   └── useVisits.ts    # 封裝名冊管理、本地快取與 Sheets 同步邏輯
├── services/           # API 服務層
│   ├── apiClient.ts    # 封裝 Axios 實例與自動重新整理 Token 攔截器
│   └── sheets.ts       # 封裝 Google Sheets 與 Drive API 的具體請求
├── types/              # 專案 TypeScript 型別定義
│   └── index.ts
├── App.tsx             # 乾淨的主頁面，僅負責佈局與掛載元件
├── index.css
└── main.tsx
```

---

## 4. 關鍵模組重構設計 (Key Component Designs)

### A. 安全性方案：BFF 與 HttpOnly Cookie 模式
為了解決 `refresh_token` 在前端洩露的風險，建議進行以下調整：
- **廢除前端儲存 Refresh Token**：不再將 `google_refresh_token` 存放在 `localStorage`。
- **HttpOnly Cookie**：在後端 API (`/api/auth/google/token` 及 `/refresh`) 將取得的 `refresh_token` 寫入一個 `HttpOnly`, `Secure`, `SameSite=Strict` 的 Cookie 中。這樣前端的 JavaScript 就無法讀取該權杖，從而徹底杜絕 XSS 竊取的風險。
- **前端記憶體儲存 Access Token**：前端僅在 React 狀態中（記憶體中）持有短效的 `access_token`。當頁面重整或 `access_token` 過期時，發送請求給後端，後端自動讀取 Cookie 中的 `refresh_token` 來回傳新的 `access_token`。

---

### B. 模組化 API 用戶端：利用 Axios 攔截器自動刷新 Token
重構 `apiClient` 導入 Axios，並設計兩個攔截器（Interceptor）：
1. **Request Interceptor**：若記憶體中存有 `access_token`，則自動在所有 Google API 或後端請求的 Header 中加入 `Authorization: Bearer <token>`。
2. **Response Interceptor**：當 API 回傳 `401 Unauthorized` 時，暫停所有待發送的請求，發送一個刷新 Token 的請求給後端。刷新成功後，更新記憶體中的 Token，並自動重試剛才失敗的請求。這將完全對業務邏輯層隱藏 Token 刷新的複雜度。

#### 設計範例：`src/services/apiClient.ts`
```typescript
import axios from 'axios';

// 建立用於與自建後端互動的 Axios 實例
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true, // 確保發送後端請求時會自動帶上 HttpOnly Cookie
});

// 建立用於與 Google API 互動的 Axios 實例
export const googleApi = axios.create({
  baseURL: 'https://www.googleapis.com',
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 全域記憶體 Access Token (由 AuthContext 管理並注入)
let _accessToken: string | null = null;
export const setGlobalAccessToken = (token: string | null) => {
  _accessToken = token;
};

// 注入 Request 攔截器，自動帶上 Bearer Token
googleApi.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// 注入 Response 攔截器，處理 401 錯誤並靜默刷新 Token
googleApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return googleApi(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 向自建後端請求刷新 Access Token (後端會讀取 HttpOnly Cookie 中的 Refresh Token)
        const response = await api.post('/api/auth/google/refresh');
        const { access_token } = response.data;
        
        setGlobalAccessToken(access_token);
        processQueue(null, access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return googleApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // 刷新失敗代表認證已過期，需強制登出或提示重新授權
        setGlobalAccessToken(null);
        window.dispatchEvent(new Event('auth:expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

### C. 自定義 Hook 封裝：`useVisits.ts`
將 `professors` 狀態的管理、本地 `localStorage` 同步、雲端同步防毒（防 Race Condition）等業務邏輯移出 [App.tsx](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/App.tsx)。

#### 設計範例：`src/hooks/useVisits.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { Professor } from '../types';
import { syncVisitsToSheet, fetchSpreadsheetValues, createSpreadsheet, findExistingSpreadsheet } from '../services/sheets';
import { useAuth } from './useAuth';

export function useVisits() {
  const { isLoggedIn, accessToken } = useAuth();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    () => localStorage.getItem('google_spreadsheet_id')
  );
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 同步到 Google Sheets
  const syncToCloud = useCallback(async (currentData: Professor[]) => {
    if (!isLoggedIn || !accessToken) return;
    setSyncStatus('syncing');
    try {
      let currentId = spreadsheetId;
      if (!currentId) {
        currentId = await createSpreadsheet(accessToken, '研究室見学録 - Academic Inquiry Log');
        setSpreadsheetId(currentId);
        localStorage.setItem('google_spreadsheet_id', currentId);
      }
      await syncVisitsToSheet(accessToken, currentId, currentData);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || '同步失敗');
    }
  }, [isLoggedIn, accessToken, spreadsheetId]);

  // 新增教授
  const addProfessor = useCallback((name: string, lab: string, notes: string) => {
    const newProf: Professor = {
      id: crypto.randomUUID(),
      name,
      lab,
      visited: false,
      date: new Date().toLocaleDateString('ja-JP'),
      notes,
    };
    const updated = [newProf, ...professors];
    setProfessors(updated);
    localStorage.setItem('research_visits', JSON.stringify(updated));
    syncToCloud(updated);
  }, [professors, syncToCloud]);

  // 其他操作：toggle, delete, update 等...

  return {
    professors,
    syncStatus,
    errorMessage,
    spreadsheetId,
    addProfessor,
    // ... toggle, delete, update
  };
}
```

---

## 5. 重構執行步驟 (Refactoring Action Plan)

1. **第一階段：建立基礎設施**
   - 安裝 Axios，並建立 `src/services/apiClient.ts`。
   - 封裝 Google Sheets 的 API 方法至 `src/services/sheets.ts`，以 Axios 重寫。
2. **第二階段：狀態與邏輯抽離**
   - 建立 `AuthContext`，將登入狀態、Token 保存邏輯與 `google.accounts.oauth2` 整合。
   - 實作 `useVisits` 自定義 hook，整理並簡化原本在 `App.tsx` 中的 CRUD 和同步代碼。
3. **第三階段：UI 淨化與重構 App.tsx**
   - 將 `App.tsx` 中的邏輯完全替換為調用自定義 hook，只保留佈局與子元件傳參。
   - 修正設定 modal (禁忌之書庫設定) 與主頁面之間的狀態流動。
4. **第四階段：安全性加固 (後端配合)**
   - 調整後端的 token 核發機制，啟用 `HttpOnly` Cookie，並在 `apiClient.ts` 中移除對前端 localStorage 讀寫 `refresh_token` 的依賴。
