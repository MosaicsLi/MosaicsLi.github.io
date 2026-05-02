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
 * 支援透過 Refresh Token 自動續期，達成長期免登入
 */
export const getAccessToken = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // 1. 檢查內部變數快取
    if (accessToken && Date.now() < tokenExpiresAt) {
      return resolve(accessToken);
    }

    // 2. 嘗試從 localStorage 獲取 Refresh Token 進行背景續期
    const savedRefreshToken = localStorage.getItem('google_refresh_token');
    if (savedRefreshToken) {
      try {
        const response = await fetch(`${API_BASE}/api/auth/google/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: savedRefreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000; // 提前5分鐘過期
          
          // 如果有返回新的 refresh_token 則更新 (通常 refresh token 是持久的)
          if (data.refresh_token) {
            localStorage.setItem('google_refresh_token', data.refresh_token);
          }
          
          return resolve(accessToken!);
        } else {
          // Refresh Token 可能已失效，清除之
          localStorage.removeItem('google_refresh_token');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    // 3. 若上述失敗，觸發 Code Flow 授權彈窗
    if (!CLIENT_ID) {
      return reject(new Error('VITE_GOOGLE_CLIENT_ID is not configured.'));
    }

    try {
      const client = google.accounts.oauth2.initCodeClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        ux_mode: 'popup',
        callback: async (response: any) => {
          if (response.code) {
            try {
              // 向後端交換正式 Token
              const tokenResponse = await fetch(`${API_BASE}/api/auth/google/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  code: response.code,
                  //redirectUri: (`${API_BASE}/auth/callback`)
                  redirectUri: 'postmessage'
                }),
              });

              if (!tokenResponse.ok) throw new Error('Token exchange failed');
              
              const data = await tokenResponse.json();
              accessToken = data.access_token;
              tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

              // 關鍵：將 Refresh Token 存入本地，實現長期免登入
              if (data.refresh_token) {
                localStorage.setItem('google_refresh_token', data.refresh_token);
              }

              resolve(accessToken!);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error('Auth failed: ' + (response.error || 'No code returned')));
          }
        },
      });
      client.requestCode();
    } catch (error) {
      reject(error);
    }
  });
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
