/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Feather } from 'lucide-react';

interface VisitFormProps {
  /** 新增訪問紀錄的回調函數 */
  onAdd: (name: string, lab: string, notes: string) => void;
  /** 登入狀態 */
  isLoggedIn: boolean;
}

/**
 * 新增訪問對象的表單組件
 */
const VisitForm: React.FC<VisitFormProps> = ({ onAdd, isLoggedIn }) => {
  const [name, setName] = useState('');
  const [lab, setLab] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    if (!name.trim()) return;
    onAdd(name, lab, notes);
    // 清空輸入框
    setName('');
    setLab('');
    setNotes('');
  };

  return (
    <div className="p-4 md:p-6 border border-border bg-white bg-opacity-10 shadow-inner rounded-sm relative">
      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 italic underline underline-offset-8 flex items-center gap-2">
        <Feather size={20} /> 新規訪問記録
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 姓名輸入 */}
        <div>
          <label className="block text-[10px] uppercase tracking-tighter opacity-70 mb-1">氏名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isLoggedIn}
            className={`quill-input w-full text-base md:text-xl font-serif ${!isLoggedIn ? 'opacity-50' : ''}`}
            placeholder={isLoggedIn ? "賢者の名を記す..." : "自分の名を名乗れ..."}
          />
        </div>
        
        {/* 地點/領域輸入 */}
        <div>
          <label className="block text-[10px] uppercase tracking-tighter opacity-70 mb-1">研究聖所 / 領域</label>
          <input
            type="text"
            value={lab}
            onChange={(e) => setLab(e.target.value)}
            disabled={!isLoggedIn}
            className={`quill-input w-full text-base md:text-xl font-serif ${!isLoggedIn ? 'opacity-50' : ''}`}
            placeholder="例：工程館302..."
          />
        </div>
        
        {/* 備註輸入 */}
        <div>
          <label className="block text-[10px] uppercase tracking-tighter opacity-70 mb-1">備忘（特記事項）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!isLoggedIn}
            className={`quill-input w-full text-xs md:text-base font-serif resize-none border-b-0 border-l border-border/20 pl-2 ${!isLoggedIn ? 'opacity-50' : ''}`}
            placeholder="交わした言葉や印象..."
            rows={2}
          />
        </div>
        
        {/* 提交按鈕：仿羊皮紙印記風格 */}
        <button
          type="submit"
          disabled={!isLoggedIn}
          className={`mt-2 md:mt-4 w-full py-2 md:py-3 font-bold shadow-lg transition-all flex items-center justify-center gap-2 font-display tracking-widest ${
            isLoggedIn 
              ? 'bg-border text-parchment text-base md:text-xl hover:brightness-110 active:scale-95 cursor-pointer' 
              : 'bg-gray-400/20 text-ink/40 text-sm cursor-not-allowed'
          }`}
        >
          {isLoggedIn ? '銘 刻 す る' : '名を名乗れ'}
        </button>
      </form>
    </div>
  );
};

export default VisitForm;
