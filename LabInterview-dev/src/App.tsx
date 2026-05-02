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
import { getAccessToken, createSpreadsheet, syncVisitsToSheet, fetchSpreadsheetValues } from './services/googleSheetsService';
import { CloudUpload, RefreshCw, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';

/**
 * 應用程式主入口：研究室訪問紀錄系統
 * 設計風格：中世紀羊皮紙風格
 */
export default function App() {
  // 從本地存儲中讀取現有的名冊，若無則初始化為空陣列
  const [professors, setProfessors] = useState<Professor[]>(() => {
    const saved = localStorage.getItem('research_visits');
    return saved ? JSON.parse(saved) : [];
  });

  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('google_spreadsheet_id');
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. 初始化登入並嘗試從雲端獲取最新資料
  useEffect(() => {
    const initApp = async () => {
      // 在啟動時嘗試獲取 Token
      try {
        const token = await getAccessToken();
        setIsLoggedIn(true);

        if (spreadsheetId) {
          setSyncStatus('loading');
          const cloudData = await fetchSpreadsheetValues(token, spreadsheetId);
          if (cloudData) {
            setProfessors(cloudData);
            // 同步回本地存儲
            localStorage.setItem('research_visits', JSON.stringify(cloudData));
          }
          setSyncStatus('idle');
        }
      } catch (error) {
        console.warn('Initial session check failed or no active session:', error);
        // 如果本地有名單，先維持顯示
      }
    };

    // 延遲執行以確保 Google API 已加載
    const timer = setTimeout(initApp, 1000);
    return () => clearTimeout(timer);
  }, []); // 僅在組件掛載時執行一次

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

      await syncVisitsToSheet(token, currentId, currentProfessors);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Auto-sync Error:', error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '自動同步失敗');
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
   * 登入功能
   */
  const handleLogin = async () => {
    try {
      await getAccessToken();
      setIsLoggedIn(true);
      if (spreadsheetId) handleSync();
    } catch (error) {
      setErrorMessage('Login failed');
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

      {/* 頂部標題 */}
      <Header />

      {/* 主要內容區域：分為清單與輸入表單 */}
      <div className="w-full flex flex-col md:flex-row justify-between gap-6 md:gap-12 flex-1 md:overflow-hidden">

        {/* 左側：訪問名單 */}
        <VisitList
          professors={professors}
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
                  查看線上試算表
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
    </div>
  );
}

