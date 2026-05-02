/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VisitForm from './components/VisitForm';
import VisitList from './components/VisitList';
import { Professor } from './types';
import { getAccessToken, createSpreadsheet, syncVisitsToSheet, fetchSpreadsheetValues, findExistingSpreadsheet } from './services/googleSheetsService';
import { CloudUpload, RefreshCw, CheckCircle2, AlertCircle, LogIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * 應用程式主入口：研究室訪問紀錄系統
 * 設計風格：中世紀羊皮紙風格
 */
export default function App() {
  // 核心狀態：訪問名錄與同步 ID
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempId, setTempId] = useState('');

  // 1. 初始化檢查：僅檢查是否有 Refresh Token，不主動彈窗
  useEffect(() => {
    const checkLogin = async () => {
      const hasToken = localStorage.getItem('google_refresh_token');
      if (hasToken) {
        // 如果有 token，嘗試背景靜默獲取並讀取資料
        try {
          const token = await getAccessToken();
          setIsLoggedIn(true);

          // 嘗試讀取已知的 Spreadsheet ID
          const savedId = localStorage.getItem('google_spreadsheet_id');
          let currentId = savedId;

          if (!currentId) {
            const foundId = await findExistingSpreadsheet(token, '研究室見学録 - Academic Inquiry Log');
            if (foundId) {
              currentId = foundId;
              setSpreadsheetId(foundId);
            }
          } else {
            setSpreadsheetId(currentId);
          }

          if (currentId) {
            try {
              const cloudData = await fetchSpreadsheetValues(token, currentId);
              if (cloudData) setProfessors(cloudData);
            } catch (error: any) {
              if (error.message === 'SHEET_NOT_FOUND') {
                console.warn('Saved spreadsheet not found, attempting to re-find...');
                localStorage.removeItem('google_spreadsheet_id');
                setSpreadsheetId(null);
                const reFoundId = await findExistingSpreadsheet(token, '研究室見学録 - Academic Inquiry Log');
                if (reFoundId) {
                  setSpreadsheetId(reFoundId);
                  const retryData = await fetchSpreadsheetValues(token, reFoundId);
                  if (retryData) setProfessors(retryData);
                }
              } else if (error.message === 'SCOPE_INSUFFICIENT') {
                console.warn('Insufficient scopes');
                setErrorMessage('「天の帳を覗く権限が足りぬ。再度、契約を結び直すべし」');
                setSyncStatus('error');
              }
            }
            setSyncStatus('idle');
          }
        } catch (error) {
          console.warn('Silent login failed');
        }
      }
    };
    checkLogin();
  }, []);

  // 1.5 實時輪詢 (每 60 秒檢查一次雲端更新)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollCloud = async () => {
      if (isLoggedIn && spreadsheetId && syncStatus === 'idle') {
        try {
          const token = await getAccessToken();
          const cloudData = await fetchSpreadsheetValues(token, spreadsheetId);
          if (cloudData && JSON.stringify(cloudData) !== JSON.stringify(professors)) {
            setProfessors(cloudData);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    };

    if (isLoggedIn && spreadsheetId) {
      interval = setInterval(pollCloud, 60000);
    }

    return () => clearInterval(interval);
  }, [isLoggedIn, spreadsheetId, professors, syncStatus]);

  // 當名冊變動時，自動同步到本地存儲 (localStorage)
  useEffect(() => {
    localStorage.setItem('research_visits', JSON.stringify(professors));
  }, [professors]);

  // 同步 spreadsheetId 到 localStorage
  useEffect(() => {
    if (spreadsheetId) {
      localStorage.setItem('google_spreadsheet_id', spreadsheetId);
    }
  }, [spreadsheetId]);

  /**
   * 同步資料至 Google Sheets (內部調用)
   */
  const syncToCloud = async (currentProfessors: Professor[]) => {
    if (!isLoggedIn) return;

    setSyncStatus('syncing');
    try {
      const token = await getAccessToken();
      let currentId = spreadsheetId;

      if (!currentId) {
        currentId = await createSpreadsheet(token, '研究室見学録 - Academic Inquiry Log');
        setSpreadsheetId(currentId);
      }

      try {
        await syncVisitsToSheet(token, currentId, currentProfessors);
      } catch (error: any) {
        // 如果同步時發現試算表不存在
        if (error.message.includes('404') || error.message.includes('not found') || error.message === 'SHEET_NOT_FOUND') {
          localStorage.removeItem('google_spreadsheet_id');
          setSpreadsheetId(null);
          // 可以在下次同步時重新建立，或是現在就重試一次建立後的同步
        }
        throw error;
      }
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Auto-sync Error:', error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '「天との縁が途絶えたり」');
    }
  };

  /**
   * 手動同步按鈕具
   */
  const handleSync = async () => {
    await syncToCloud(professors);
  };

  /**
   * 更新教授資料
   */
  const handleUpdateProfessor = (id: string, name: string, lab: string, notes: string) => {
    const updated = professors.map(p =>
      p.id === id ? { ...p, name, lab, notes } : p
    );
    setProfessors(updated);
    syncToCloud(updated); // 觸發實時同步
  };

  /**
   * 登入功能：包含搜尋現有表單
   */
  const handleLogin = async () => {
    setSyncStatus('loading');
    setErrorMessage('');
    try {
      // 強制觸發授權
      const token = await getAccessToken(true);
      setIsLoggedIn(true);

      // 1. 搜尋雲端是否有現成表單
      const existingId = await findExistingSpreadsheet(token, '研究室見学録 - Academic Inquiry Log');

      let currentId = existingId;
      if (existingId) {
        setSpreadsheetId(existingId);
      } else {
        // 如果沒找到，才建立新的
        currentId = await createSpreadsheet(token, '研究室見学録 - Academic Inquiry Log');
        setSpreadsheetId(currentId);
      }

      // 2. 下載雲端資料
      if (currentId) {
        try {
          const cloudData = await fetchSpreadsheetValues(token, currentId);
          if (cloudData) setProfessors(cloudData);
        } catch (e: any) {
          if (e.message === 'SHEET_NOT_FOUND') {
            localStorage.removeItem('google_spreadsheet_id');
            setSpreadsheetId(null);
            // 本應搜尋，但 login 流程上方已搜過，若走到這代表搜尋結果也是無效的，建立新的
            const newId = await createSpreadsheet(token, '研究室見学録 - Academic Inquiry Log');
            setSpreadsheetId(newId);
          } else {
            throw e;
          }
        }
      }

      setSyncStatus('idle');
    } catch (error: any) {
      console.error('Login error:', error);
      setSyncStatus('error');
      if (error.message === 'DRIVE_API_DISABLED') {
        setErrorMessage('「天の帳を探す術（Drive API）が封印されており。至急、Google Cloudにて封印を解くべし」');
      } else if (error.message === 'SCOPE_INSUFFICIENT') {
        setErrorMessage('「権限が不足しておる。一度ログアウトし、全ての権限を認めて再度契約を結び直すべし」');
      } else {
        setErrorMessage('天との契約（登入）に失敗せり');
      }
    }
  };

  /**
   * 新增一位教授到名冊中
   */
  const handleAddProfessor = (name: string, lab: string, notes: string) => {
    const newProf: Professor = {
      id: crypto.randomUUID(),
      name,
      lab,
      visited: false,
      date: new Date().toLocaleDateString('ja-JP'), // 使用日文日期格式
      notes,
    };

    const updated = [newProf, ...professors];
    setProfessors(updated);
    syncToCloud(updated); // 觸發實時同步
  };

  /**
   * 切換紀錄的訪問狀態 (已訪 / 未訪)
   */
  const handleToggleVisited = (id: string) => {
    const updated = professors.map(p =>
      p.id === id ? { ...p, visited: !p.visited } : p
    );
    setProfessors(updated);
    syncToCloud(updated); // 觸發實時同步
  };

  /**
   * 從名簿中移除特定的紀錄
   */
  const handleDeleteProfessor = (id: string) => {
    const updated = professors.filter(p => p.id !== id);
    setProfessors(updated);
    syncToCloud(updated); // 觸發實時同步
  };

  // 計算累計已訪問的人數
  const visitedCount = professors.filter(p => p.visited).length;

  return (
    <div className="w-full max-w-5xl md:h-[90vh] parchment-container flex flex-col p-4 md:p-12 overflow-y-auto md:overflow-hidden select-none antique-font ink-text transition-all duration-700">

      {/* 頂部標題 - 點擊 5 次開啟隱秘設定 */}
      <div onClick={() => {
        const now = Date.now();
        // @ts-ignore
        const lastClick = window._lastHeaderClick || 0;
        // @ts-ignore
        const count = (now - lastClick < 500) ? (window._headerClickCount || 0) + 1 : 1;
        // @ts-ignore
        window._lastHeaderClick = now;
        // @ts-ignore
        window._headerClickCount = count;

        if (count >= 5) {
          setShowSettings(true);
          setTempId(spreadsheetId || '');
          // @ts-ignore
          window._headerClickCount = 0;
        }
      }}>
        <Header />
      </div>

      {/* 主要內容區域：分為清單與輸入表單 */}
      <div className="w-full flex flex-col md:flex-row justify-between gap-6 md:gap-12 flex-1 md:overflow-hidden">

        {/* 左側：訪問名單 */}
        <VisitList
          professors={professors}
          isLoggedIn={isLoggedIn}
          onToggle={handleToggleVisited}
          onDelete={handleDeleteProfessor}
          onUpdate={handleUpdateProfessor}
        />

        {/* 右側：側邊欄表單與座右銘 */}
        <aside className="w-full md:w-1/3 flex flex-col gap-6 md:gap-8 md:border-l md:border-border md:pl-12 order-1 md:order-2 pb-8 md:pb-0">
          {/* 輸入表單 */}
          <VisitForm onAdd={handleAddProfessor} isLoggedIn={isLoggedIn} />

          {/* Google Sheets 同步按鈕區域 */}
          <div className="p-4 border border-border border-dashed rounded-sm bg-white bg-opacity-5">
            <div className="flex flex-col gap-3">
              {!isLoggedIn ? (
                <button
                  onClick={handleLogin}
                  className="py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold border border-border transition-all cursor-pointer font-serif bg-border text-parchment hover:brightness-110"
                >
                  <LogIn size={16} /> 名を記し、天つ文を紐解け
                </button>
              ) : (
                <button
                  onClick={handleSync}
                  disabled={syncStatus === 'syncing' || syncStatus === 'loading'}
                  className={`py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold border border-border transition-all cursor-pointer font-serif shadow-sm ${(syncStatus === 'syncing' || syncStatus === 'loading') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-border/10 active:scale-95'
                    }`}
                >
                  {syncStatus === 'syncing' || syncStatus === 'loading' ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : syncStatus === 'success' ? (
                    <CheckCircle2 size={16} className="text-green-700" />
                  ) : (
                    <CloudUpload size={16} />
                  )}
                  {
                    syncStatus === 'loading' ? '記憶を辿り中...' :
                      syncStatus === 'syncing' ? '天つ文と照合中...' :
                        syncStatus === 'success' ? '記憶の継承、完了なり' :
                          '天の帳へ記さん'
                  }
                </button>
              )}

              {syncStatus === 'error' && (
                <div className="flex items-center gap-1 text-[10px] text-red-800 font-serif">
                  <AlertCircle size={12} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-center underline opacity-60 hover:opacity-100 font-serif"
                >
                  天の帳を検分せん
                </a>
              )}

              {!spreadsheetId && (
                <p className="text-[9px] text-center opacity-40 font-serif">
                  「初めての契りにて、天の領域に新たなる帳が結ばれん」
                </p>
              )}
            </div>
          </div>

          {/* 底部格言與日期 */}
          <div className="hidden md:flex mt-auto text-center opacity-60 font-serif flex-col">
            <p className="text-sm italic">"知識は唯一不滅の灯火なり"</p>
            <p className="text-xs mt-2">皇紀二六八六年 四月 誌</p>
          </div>
        </aside>
      </div>

      {/* 底部資訊欄 */}
      <footer className="mt-6 md:mt-8 pt-4 w-full border-t border-border border-opacity-30 flex flex-col md:flex-row justify-between text-[9px] md:text-[10px] opacity-70 uppercase tracking-widest italic font-serif gap-2">
        <div className="text-center md:text-left">學術調查日誌卷軸：第 042 號</div>
        <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4">
          <span>訪問者：{visitedCount} 名</span>
          <span>全紀錄：{professors.length} 名</span>
        </div>
      </footer>
      {/* 隱秘設定 Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="parchment-container p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 opacity-40 hover:opacity-100"
              >
                <X size={20} />
              </button>
              <h3 className="font-display text-xl mb-6 border-b border-border pb-2">「禁忌の書庫・設定」</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase opacity-50 block mb-1">天の帳（Sheet ID）</label>
                  <input
                    type="text"
                    value={tempId}
                    onChange={(e) => setTempId(e.target.value)}
                    className="quill-input w-full text-xs font-serif break-all"
                    placeholder="IDを入力せよ..."
                  />
                </div>
                <button
                  onClick={async () => {
                    setSpreadsheetId(tempId);
                    localStorage.setItem('google_spreadsheet_id', tempId);
                    setShowSettings(false);
                    // 重新載入資料
                    if (isLoggedIn && tempId) {
                      setSyncStatus('loading');
                      try {
                        const token = await getAccessToken();
                        const cloudData = await fetchSpreadsheetValues(token, tempId);
                        if (cloudData) setProfessors(cloudData);
                        setSyncStatus('idle');
                      } catch (e) {
                        setSyncStatus('error');
                      }
                    }
                  }}
                  className="w-full py-2 bg-border text-parchment font-bold hover:brightness-110 active:scale-95 transition-all text-sm"
                >
                  縁を書き換えん
                </button>
                <p className="text-[9px] opacity-40 leading-tight">警告：IDを誤れば、記憶は異空へと消え去らん。慎重に選ぶべし。</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

