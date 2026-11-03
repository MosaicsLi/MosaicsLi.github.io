---
title: 用 Astro 重建個人網站
description: 把散落的練習頁整理掉，改用 Astro 統一部落格與作品集，並用 GitHub Actions 自動部署。
date: 2026-11-03
tags: [Astro, GitHub Pages, GitHub Actions]
---

> 這是改版時建立的第一篇文章，可以直接改寫成你自己的版本。

## 為什麼要重建

舊的網站是很多實驗的集合：純 HTML、用 CDN 載入的 Vue、Bootstrap、React + Vite，還有一個手動複製編譯結果的 Hexo 部落格。每個東西用法都不一樣，過一段時間就忘了怎麼更新。

這次的目標有三個：

1. 部落格和作品集放在同一個網站。
2. 所有東西都用同一套工具建置。
3. 只要 `git push`，網站就自動更新，不需要記任何手動步驟。

## 為什麼選 Astro

- 文章就是 Markdown，放進 `src/content/blog/` 就好。
- 預設輸出純 HTML，速度快。
- 底層是 Vite + TypeScript，跟我其他 React 作品是同一套工具。

## 現在的結構

```text
src/          Astro 網站（首頁、作品、部落格）
apps/         各個作品的原始碼，各自用 Vite 建置
.github/      GitHub Actions：建置全部並部署到 GitHub Pages
```

舊的內容都保留在 `archive` 分支，需要時可以回去找。
