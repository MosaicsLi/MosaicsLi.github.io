/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence } from 'motion/react';
import VisitItem from './VisitItem';
import { Professor } from '../types';

interface VisitListProps {
  /** 教授名單陣列 */
  professors: Professor[];
  /** 登入狀態 */
  isLoggedIn: boolean;
  /** 切換訪問狀態的回調 */
  onToggle: (id: string) => void;
  /** 刪除紀錄的回調 */
  onDelete: (id: string) => void;
  /** 更新紀錄的回調 */
  onUpdate: (id: string, name: string, lab: string, notes: string) => void;
}

/**
 * 訪問紀錄清單組件
 */
const VisitList: React.FC<VisitListProps> = ({ professors, isLoggedIn, onToggle, onDelete, onUpdate }) => {
  return (
    <section className="w-full md:w-2/3 flex flex-col md:overflow-hidden order-2 md:order-1">
      {/* 列表表頭 */}
      <div className="grid grid-cols-12 gap-1 md:gap-4 border-b-2 border-border pb-2 mb-4 font-bold text-[10px] md:text-lg opacity-70 italic whitespace-nowrap">
        <div className="col-span-1 text-center">訪</div>
        <div className="col-span-4 md:col-span-5">賢者の名</div>
        <div className="col-span-4 md:col-span-3">聖所 / 領域</div>
        <div className="col-span-3 text-right pr-2">操作</div>
      </div>
      
      {/* 列表主體：支援自定義樣式的滾動條 */}
      <div className="md:flex-1 md:overflow-y-auto md:pr-4 space-y-2 custom-scrollbar min-h-[300px]">
        <AnimatePresence mode='popLayout'>
          {!isLoggedIn ? (
            <div className="text-center py-24 md:py-32 opacity-30 italic text-lg md:text-2xl font-serif px-4 flex flex-col items-center gap-4">
              <span>「 封印されし日誌、主を待つ 」</span>
              <span className="text-xs uppercase tracking-widest opacity-50">請先點擊登入以同步雲端記憶</span>
            </div>
          ) : professors.length === 0 ? (
            <div className="text-center py-24 md:py-32 opacity-20 italic text-xl md:text-3xl font-serif px-4">
              學術の旅はまだ、白紙のページにあります...
            </div>
          ) : (
            professors.map((prof) => (
              <VisitItem 
                key={prof.id} 
                prof={prof} 
                onToggle={onToggle} 
                onDelete={onDelete} 
                onUpdate={onUpdate}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default VisitList;
