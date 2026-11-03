/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, MessageSquare, X, Edit2, Check } from 'lucide-react';
import { Professor } from '../types';

interface VisitItemProps {
  /** 教授資料 */
  prof: Professor;
  /** 切換訪問狀態的函數 */
  onToggle: (id: string) => void;
  /** 刪除紀錄的函數 */
  onDelete: (id: string) => void;
  /** 更新紀錄的函數 */
  onUpdate: (id: string, name: string, lab: string, notes: string) => void;
}

/**
 * 單條紀錄項目組件
 */
const VisitItem: React.FC<VisitItemProps> = ({ prof, onToggle, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(prof.name);
  const [editLab, setEditLab] = useState(prof.lab);
  const [editNotes, setEditNotes] = useState(prof.notes);

  const handleSave = () => {
    onUpdate(prof.id, editName, editLab, editNotes);
    setIsEditing(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    // Reset fields to current prof values if not saved
    setEditName(prof.name);
    setEditLab(prof.lab);
    setEditNotes(prof.notes);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        className={`grid grid-cols-12 gap-1 md:gap-4 items-center group relative transition-all duration-500 py-3 border-b border-border/10 cursor-pointer hover:bg-black/5 ${prof.visited ? 'opacity-60' : ''}`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* 訪問標記 */}
        <div className="col-span-1 flex justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(prof.id);
            }}
            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              prof.visited ? 'seal text-white text-[8px] md:text-[10px]' : 'border-2 border-border opacity-30 hover:opacity-100'
            }`}
          >
            {prof.visited ? '★' : ''}
          </button>
        </div>

        {/* 姓名 - 固定佔位且不換行 */}
        <div className={`col-span-4 md:col-span-5 font-bold text-xs md:text-xl transition-all truncate whitespace-nowrap overflow-hidden ${prof.visited ? 'line-through decoration-border' : ''}`}>
          {prof.name}
        </div>

        {/* 地點/研究領域 - 固定佔位且不換行 */}
        <div className="col-span-4 md:col-span-3 text-[10px] md:text-lg opacity-80 truncate whitespace-nowrap overflow-hidden font-serif italic">
          {prof.lab || '---'}
        </div>

        {/* 操作按鈕 */}
        <div className="col-span-3 text-right flex justify-end gap-1 md:gap-3 text-border items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="p-1 md:p-2 opacity-40 hover:opacity-100 transition-all cursor-pointer"
            title="詳細を表示"
          >
            <MessageSquare size={14} className="md:w-5 md:h-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(prof.id);
            }}
            className="p-1 md:p-2 opacity-20 hover:opacity-100 hover:text-red-800 transition-all cursor-pointer"
            title="削除"
          >
            <Trash2 size={14} className="md:w-5 md:h-5" />
          </button>
        </div>
      </motion.div>

      {/* 備忘錄燈箱 (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md parchment-container p-8 md:p-12 shadow-2xl"
              style={{ filter: 'none' }}
            >
               <button 
                onClick={handleModalClose}
                className="absolute top-4 right-4 p-2 opacity-40 hover:opacity-100 transition-all cursor-pointer text-ink"
              >
                <X size={24} />
              </button>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                  <h4 className="font-display text-2xl medieval-ink">
                    {isEditing ? '情報の修正' : '詳細照會'}
                  </h4>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 opacity-40 hover:opacity-100 transition-all text-ink"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase opacity-70 mb-1">氏名</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="quill-input w-full text-lg font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase opacity-70 mb-1">聖所 / 領域</label>
                      <input
                        type="text"
                        value={editLab}
                        onChange={(e) => setEditLab(e.target.value)}
                        className="quill-input w-full text-lg font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase opacity-70 mb-1">備忘錄</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="quill-input w-full text-base font-serif resize-none border-b-0 border-l border-border/20 pl-2"
                        rows={4}
                      />
                    </div>
                    <button 
                      onClick={handleSave}
                      className="w-full py-2 bg-border text-parchment font-bold flex items-center justify-center gap-2 mt-4"
                    >
                      <Check size={18} /> 修正を保存
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="text-xs opacity-50 uppercase mb-1">對象</div>
                      <div className="text-2xl font-bold">{prof.name}</div>
                    </div>
                    <div className="mb-6">
                      <div className="text-xs opacity-50 uppercase mb-1">所在</div>
                      <div className="text-lg italic font-serif">{prof.lab || '不明'}</div>
                    </div>
                    <div className="mb-2 text-xs opacity-50 uppercase">備忘錄</div>
                    <p className="font-serif text-lg leading-relaxed text-ink/80 whitespace-pre-wrap italic">
                      「 {prof.notes || '無し'} 」
                    </p>
                  </>
                )}

                <div className="mt-8 flex justify-end">
                  <div className="w-12 h-12 seal rounded-full flex items-center justify-center text-white font-display text-xl opacity-30 select-none">
                    記
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisitItem;
