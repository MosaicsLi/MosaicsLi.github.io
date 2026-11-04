# MosaicsLi.github.io

個人網站：作品集＋部落格。網址：https://mosaicsli.github.io

用 [Astro](https://docs.astro.build/zh-tw/) 建置，push 到 `main` 後由 GitHub Actions 自動部署。
改版前的舊內容（練習頁、Hexo、Vue 實驗等）都保留在 [`archive` 分支](https://github.com/MosaicsLi/MosaicsLi.github.io/tree/archive)。

## 資料夾結構

```text
src/
  content/blog/     部落格文章（Markdown）
  data/site.ts      名字、自我介紹、聯絡連結
  data/projects.ts  作品清單
  pages/            網站頁面（首頁、作品、部落格、工具、RSS、404）
  lib/media.ts      影音轉檔工具的轉檔邏輯（ffmpeg.wasm）
  layouts/          共用外框（導覽列、頁尾）
  components/       共用元件
  styles/global.css 全站樣式與顏色
public/             原樣複製的檔案（favicon、履歷 PDF 等）
apps/               各作品的原始碼，各自用 Vite 建置
  lab-interview/              → 網址 /LabInterview/
  ink-sort-puzzle/            → 網址 /ink-sort-puzzle/
  cocofolia-voice-extension/  Chrome 擴充功能（不部署，只放原始碼）
.github/workflows/deploy.yml  自動建置與部署
```

## 常用操作

需要先安裝 Node.js 26 LTS（版本寫在 `.nvmrc`）。Node.js 出資安修補時，本機重新安裝同一個大版本的最新版即可；GitHub Actions 每次都會自動裝最新修補版。

### 在本機預覽網站

```bash
npm install
npm run dev        # 打開 http://localhost:4321
```

### 在網頁上寫文章（推薦）

網站內建一個用 [Sveltia CMS](https://sveltiacms.app/) 做的後台：**https://mosaicsli.github.io/admin/**
在後台存檔就會自動 commit 到 `main`，幾分鐘後網站自動更新，不需要碰 git。電腦和手機都能用。

**第一次使用（只需做一次，之後瀏覽器會記住）：**

1. 到 GitHub 建立一組 token：[Settings → Developer settings → Fine-grained tokens → Generate new token](https://github.com/settings/personal-access-tokens/new)
   - Token name：隨便取，例如 `blog-cms`
   - Expiration：自己決定（過期後重做這一步即可）
   - Repository access：選 **Only select repositories** → `MosaicsLi/MosaicsLi.github.io`
   - Permissions → Repository permissions → **Contents** 設成 **Read and write**
   - 按 Generate token，複製產生的字串（只會顯示一次）
2. 打開 `/admin/`，點 **Sign In Using Access Token**（不是 Sign In with GitHub），貼上 token。

**寫文章：** 點「部落格文章」→「新增」，填標題、摘要、日期、標籤和內文，按「儲存」。
- 網址（檔名）預設由標題產生，建議在網址欄位改成簡短的英文，例如 `my-first-post`。
- 勾選「草稿」的文章會存進 repo，但不會出現在網站上。
- 內文可以直接拖圖片進來，圖片會存到 `public/images/blog/`。

後台設定在 `public/admin/config.yml`。之後若在 `src/content.config.ts` 幫文章加新欄位，也要在這裡加上同名欄位。

### 手動寫一篇新文章

1. 在 `src/content/blog/` 新增一個檔案，例如 `my-new-post.md`（檔名就是網址）。
2. 最上面貼上這段並修改：

   ```markdown
   ---
   title: 文章標題
   description: 一句話摘要（會顯示在搜尋結果與 RSS）
   date: 2026-11-03
   tags: [標籤一, 標籤二]
   draft: false   # true = 只在本機顯示，不會發佈
   ---

   這裡開始寫內文。
   ```

3. `git add`、`git commit`、`git push`，幾分鐘後就會出現在網站上。

文章用的圖片放在 `public/images/`，內文用 `![說明](/images/檔名.png)` 引用。

### 修改自我介紹或聯絡方式

編輯 `src/data/site.ts`。

### 新增一個作品

- **只放連結**（作品在別的倉庫或別的網站）：在 `src/data/projects.ts` 加一筆就好。
- **放在這個倉庫一起部署**（Vite 專案）：
  1. 把專案放到 `apps/<名稱>/`。
  2. 在它的 `vite.config.ts` 設定：
     ```ts
     base: '/<名稱>/',
     build: { outDir: '../../dist/<名稱>', emptyOutDir: true },
     ```
  3. 在根目錄 `package.json` 的 `build:apps` 加上 `&& npm run build --prefix apps/<名稱>`。
  4. 在 `.github/workflows/deploy.yml` 的 Install 步驟加上 `npm ci --prefix apps/<名稱>`。
  5. 在 `src/data/projects.ts` 加一筆，`demo` 填 `/<名稱>/`。

### 影音轉檔工具（/tools/media/）

- 用 [ffmpeg.wasm](https://ffmpegwasm.netlify.app/) 在瀏覽器裡執行 FFmpeg，檔案不會上傳。
- 轉檔指令寫在 `src/lib/media.ts`，想加新功能（例如裁切、轉 GIF）就照同樣的寫法加一個函式，再到 `src/pages/tools/media.astro` 加一個區塊。
- 轉檔引擎（`@ffmpeg/core`，約 30MB）跟著網站一起建置，從自己的網域載入，不依賴外部 CDN。使用單執行緒版本，所以 GitHub Pages 不需要特別的 header 設定。
- 新增其他工具時，記得在 `src/pages/tools/index.astro` 的清單加一筆。

### 在本機建置完整網站（含作品）

```bash
npm run build:all  # 結果在 dist/
npm run preview    # 預覽 dist/
```

## 部署

- push 到 `main` → GitHub Actions 自動型別檢查、建置、部署。進度在倉庫的 **Actions** 分頁。
- 開 PR 時也會跑一次建置（不部署），紅燈代表有東西壞了，先別合併。
- 第一次使用前，確認倉庫的 **Settings → Pages → Source** 是「GitHub Actions」。

### LabInterview 需要的設定

LabInterview 建置時會讀兩個變數，請在 **Settings → Secrets and variables → Actions → Variables** 新增：

| 名稱 | 內容 |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud 的 OAuth 用戶端 ID |
| `VITE_API_BASE` | GCP 上後端 API 的網址 |

本機開發時，改成寫在 `apps/lab-interview/.env.local`（不會被 commit）。

## 套件更新

Dependabot 每個月會自動開 PR 更新套件。PR 上的檢查是綠燈就可以直接合併；紅燈的話打開 Actions 紀錄看是哪一步失敗。
