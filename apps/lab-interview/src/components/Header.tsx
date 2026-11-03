/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * 網頁頂部標題組件
 */
const Header: React.FC = () => {
  return (
    <header className="text-center mb-6 md:mb-10 w-full relative">
      {/* 主標題：使用 MedievalSharp 字體營造中世紀氛圍 */}
      <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest border-b-2 border-border pb-2 md:pb-4 mb-2 font-display">
        研 究 室 見 学 録
      </h1>
      
      {/* 副標題：英文藝術字風格 */}
      <p className="italic text-base md:text-xl opacity-80 font-serif">
        Archive of Learned Sages & Academic Sanctums
      </p>
      
      {/* 裝飾性蠟封簽名 (僅在桌面版顯示) */}
      <div className="absolute top-0 right-0 hidden lg:block">
        <div className="w-16 h-16 seal rounded-full flex items-center justify-center text-white font-display text-2xl rotate-12">
          印
        </div>
      </div>
    </header>
  );
};

export default Header;
