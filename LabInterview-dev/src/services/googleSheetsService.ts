/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Professor } from '../types';

declare const google: any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE = import.meta.env.VITE_API_BASE;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * 獲取 Google API 存取權杖 (Access Token)
 */
export const getAccessToken = (forcePrompt = false): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // 1. 檢查快取
    if (accessToken && Date.now() < tokenExpiresAt && !forcePrompt) {
      return resolve(accessToken);
    }

    // 2. 嘗試 Refresh Token
    const savedRefreshToken = localStorage.getItem('google_refresh_token');
    if (savedRefreshToken && !forcePrompt) {
      try {
        const response = await fetch(`${API_BASE}/api/auth/google/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: savedRefreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
          if (data.refresh_token) localStorage.setItem('google_refresh_token', data.refresh_token);
          return resolve(accessToken!);
        }
      } catch (error) {
        console.warn('Token refresh failed');
      }
    }

    // 3. 彈窗授權
    if (!google?.accounts?.oauth2) return reject(new Error('Google API not loaded'));

    const client = google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPES + ' https://www.googleapis.com/auth/drive.readonly', // 增加 Drive 讀取權限來搜尋檔案
      ux_mode: 'popup',
      callback: async (response: any) => {
        if (response.code) {
          try {
            const tokenResponse = await fetch(`${API_BASE}/api/auth/google/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                code: response.code,
                redirectUri: 'postmessage'
              }),
            });
            const data = await tokenResponse.json();
            accessToken = data.access_token;
            tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
            if (data.refresh_token) localStorage.setItem('google_refresh_token', data.refresh_token);
            resolve(accessToken!);
          } catch (err) { reject(err); }
        } else { reject(new Error('Auth failed')); }
      },
    });
    client.requestCode();
  });
};

/**
 * 搜尋現有的試算表
 */
export const findExistingSpreadsheet = async (token: string, title: string): Promise<string | null> => {
  const query = encodeURIComponent(`name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
};

/**
 * 在使用者雲端硬碟建立一個新的試算表
 */
export const createSpreadsheet = async (token: string, title: string): Promise<string> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error('Failed to create spreadsheet: ' + (error.error?.message || response.statusText));
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;

  // 初始化表頭
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/シート1!A1:E1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [['教授姓名', '研究室/領域', '訪問狀態', '登記日期', '備註']],
    }),
  });
  
  return spreadsheetId;
};

/**
 * 將訪問紀錄同步至指定的試算表
 */
export const syncVisitsToSheet = async (token: string, spreadsheetId: string, professors: Professor[]) => {
  // 1. 先徹底清空 A2 到最後的資料
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/シート1!A2:E1000:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (professors.length === 0) return;

  // 2. 將資料轉換為二維陣列
  const values = professors.map(p => [
    p.name,
    p.lab,
    p.visited ? '已訪問' : '待訪問',
    p.date,
    p.notes,
  ]);

  // 3. 寫入新資料
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/シート1!A2?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values,
    }),
  });
};

/**
 * 從指定試算表獲取資料
 */
export const fetchSpreadsheetValues = async (token: string, spreadsheetId: string): Promise<Professor[]> => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/シート1!A2:E`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Failed to fetch values from sheet');
  }

  const data = await response.json();
  if (!data.values) return [];

  return data.values.map((row: any[], index: number) => ({
    id: `sheet-${index}-${Date.now()}`,
    name: row[0] || '',
    lab: row[1] || '',
    visited: row[2] === '已訪問',
    date: row[3] || '',
    notes: row[4] || '',
  }));
};
