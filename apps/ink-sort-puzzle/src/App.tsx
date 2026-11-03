/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Undo2, Trophy, ChevronRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- 常數與型別定義 ---
const TUBE_CAPACITY = 4;
const COLORS = [
  '#FF5252', // Red
  '#448AFF', // Blue
  '#FFEB3B', // Yellow
  '#4CAF50', // Green
  '#E040FB', // Purple
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#9E9E9E', // Grey
  '#FF4081', // Pink
];

// --- 遊戲邏輯 Functions ---

/**
 * 檢查是否過關
 * 條件：每個滴管要麼是空的，要麼是滿的且顏色一致
 */
const checkWin = (tubes: string[][]): boolean => {
  return tubes.every((tube) => {
    if (tube.length === 0) return true;
    if (tube.length !== TUBE_CAPACITY) return false;
    const firstColor = tube[0];
    return tube.every((color) => color === firstColor);
  });
};

/**
 * 取得滴管最頂層的連續相同顏色與數量
 */
const getTopColorGroup = (tube: string[]) => {
  if (tube.length === 0) return null;
  const color = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === color) {
      count++;
    } else {
      break;
    }
  }
  return { color, count };
};

/**
 * 倒水邏輯
 * 回傳新的 tubes 陣列，若不能倒則回傳 null
 */
const pourWater = (tubes: string[][], fromIdx: number, toIdx: number): string[][] | null => {
  if (fromIdx === toIdx) return null;
  const fromTube = [...tubes[fromIdx]];
  const toTube = [...tubes[toIdx]];

  if (fromTube.length === 0) return null;
  if (toTube.length === TUBE_CAPACITY) return null;

  const fromGroup = getTopColorGroup(fromTube);
  if (!fromGroup) return null;

  // 規則：目標必須為空，或頂層顏色相同
  if (toTube.length > 0 && toTube[toTube.length - 1] !== fromGroup.color) {
    return null;
  }

  // 計算可以倒多少格 (受限於目標剩餘空間與來源連續顏色數量)
  const spaceAvailable = TUBE_CAPACITY - toTube.length;
  const amountToPour = Math.min(fromGroup.count, spaceAvailable);

  // 執行倒水
  for (let i = 0; i < amountToPour; i++) {
    const color = fromTube.pop();
    if (color) toTube.push(color);
  }

  const newTubes = [...tubes];
  newTubes[fromIdx] = fromTube;
  newTubes[toIdx] = toTube;

  return newTubes;
};

/**
 * 隨機生成關卡
 */
const generateLevel = (level: number): string[][] => {
  // 隨難度增加顏色數量
  const colorCount = Math.min(3 + Math.floor(level / 2), COLORS.length);
  const emptyTubes = 2;
  const totalTubes = colorCount + emptyTubes;

  // 準備所有墨水格
  let allInks: string[] = [];
  for (let i = 0; i < colorCount; i++) {
    for (let j = 0; j < TUBE_CAPACITY; j++) {
      allInks.push(COLORS[i]);
    }
  }

  // 洗牌 (Fisher-Yates)
  for (let i = allInks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allInks[i], allInks[j]] = [allInks[j], allInks[i]];
  }

  // 分配到滴管
  const tubes: string[][] = [];
  for (let i = 0; i < colorCount; i++) {
    tubes.push(allInks.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
  }
  for (let i = 0; i < emptyTubes; i++) {
    tubes.push([]);
  }

  return tubes;
};

// --- React 元件 ---

export default function App() {
  const [level, setLevel] = useState<number>(1);
  const [tubes, setTubes] = useState<string[][]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [history, setHistory] = useState<string[][][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);

  // 初始化關卡
  useEffect(() => {
    const savedLevel = localStorage.getItem('ink-sort-level');
    const startLevel = savedLevel ? parseInt(savedLevel, 10) : 1;
    setLevel(startLevel);
    startNewLevel(startLevel);
  }, []);

  const startNewLevel = (lvl: number) => {
    const newTubes = generateLevel(lvl);
    setTubes(newTubes);
    setHistory([]);
    setSelectedTube(null);
    setIsWon(false);
    setShowWinModal(false);
  };

  const handleTubeClick = (index: number) => {
    if (isWon) return;

    if (selectedTube === null) {
      // 選取來源 (不能選空管)
      if (tubes[index].length > 0) {
        setSelectedTube(index);
      }
    } else {
      // 嘗試倒水
      if (selectedTube === index) {
        setSelectedTube(null); // 取消選取
        return;
      }

      const nextTubes = pourWater(tubes, selectedTube, index);
      if (nextTubes) {
        setHistory([...history, tubes]);
        setTubes(nextTubes);
        setSelectedTube(null);

        // 檢查過關
        if (checkWin(nextTubes)) {
          setIsWon(true);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: COLORS
          });
          setTimeout(() => setShowWinModal(true), 1000);
        }
      } else {
        // 如果不能倒，則切換選取目標 (如果點擊的是非空管)
        if (tubes[index].length > 0) {
          setSelectedTube(index);
        } else {
          setSelectedTube(null);
        }
      }
    }
  };

  const undo = () => {
    if (history.length > 0 && !isWon) {
      const prevTubes = history[history.length - 1];
      setTubes(prevTubes);
      setHistory(history.slice(0, -1));
      setSelectedTube(null);
    }
  };

  const restart = () => {
    startNewLevel(level);
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    localStorage.setItem('ink-sort-level', nextLvl.toString());
    startNewLevel(nextLvl);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col items-center p-4 select-none touch-none">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-8 pt-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Ink Sort</h1>
          <span className="text-sm font-medium text-stone-500 uppercase tracking-widest">Level {level}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0 || isWon}
            className="p-3 rounded-2xl bg-white shadow-sm border border-stone-200 active:scale-95 transition-transform disabled:opacity-30"
            title="Undo"
            id="undo-btn"
          >
            <Undo2 size={24} />
          </button>
          <button
            onClick={restart}
            className="p-3 rounded-2xl bg-white shadow-sm border border-stone-200 active:scale-95 transition-transform"
            title="Restart"
            id="restart-btn"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 w-full max-w-md flex flex-wrap justify-center content-center gap-x-6 gap-y-12 pb-20">
        {tubes.map((tube, idx) => (
          <div
            key={idx}
            onClick={() => handleTubeClick(idx)}
            className={`relative cursor-pointer transition-all duration-300 ${
              selectedTube === idx ? '-translate-y-4' : ''
            }`}
            id={`tube-${idx}`}
          >
            {/* Tube Container */}
            <div 
              className={`w-14 h-40 rounded-b-3xl rounded-t-lg border-2 bg-white/50 backdrop-blur-sm relative overflow-hidden flex flex-col-reverse items-center p-1 transition-colors ${
                selectedTube === idx ? 'border-stone-800 ring-4 ring-stone-800/10' : 'border-stone-300'
              }`}
            >
              {/* Ink Layers */}
              <AnimatePresence initial={false}>
                {tube.map((color, colorIdx) => (
                  <motion.div
                    key={`${idx}-${colorIdx}-${color}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '24%', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-full rounded-md mb-0.5 last:mb-0"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Selection Indicator */}
            {selectedTube === idx && (
              <motion.div 
                layoutId="selector"
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-800"
              />
            )}
          </div>
        ))}
      </main>

      {/* Footer Instructions */}
      <footer className="w-full max-w-md text-center py-6">
        <p className="text-stone-400 text-sm font-medium">
          {selectedTube === null ? 'Select a tube to pour' : 'Select target tube'}
        </p>
      </footer>

      {/* Win Modal */}
      <AnimatePresence>
        {showWinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-md"
            id="win-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} />
              </div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Level Complete!</h2>
              <p className="text-stone-500 mb-8">You sorted all the inks perfectly.</p>
              
              <button
                onClick={nextLevel}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-stone-900/20"
                id="next-level-btn"
              >
                Next Level <ChevronRight size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen (Optional, if level 1 and no history) */}
      {level === 1 && history.length === 0 && !selectedTube && !isWon && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 bg-white px-6 py-3 rounded-full shadow-xl border border-stone-100 flex items-center gap-3 pointer-events-none"
        >
          <Play size={18} className="text-stone-400" />
          <span className="text-stone-600 font-medium">Tap a tube to start playing</span>
        </motion.div>
      )}
    </div>
  );
}
