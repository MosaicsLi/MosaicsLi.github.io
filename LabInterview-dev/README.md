<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 研究室見学録 (Academic Inquiry Log)

中世の羊皮紙風（RPG風）デザインを採用した、研究室・実験室の訪問記録Webアプリケーションです。
本プロジェクトは、学術的な探索の旅を美しく記録するとともに、**学校から提供されたGoogleアカウントにおいて「組織限定（学校限定）のOAuth 2.0自動ログイン機能」が実現可能かどうかの実証実験**を兼ねています。

---

## 1. 主な機能 (Core Features)

- **アンティーク調の美麗UI/UX**
  - 中世の羊皮紙や羽ペンをイメージしたビジュアルスタイル。
  - `motion` (Framer Motion) を用いたスムーズなアニメーション演出。
- **オフラインファースト & ローカルキャッシュ**
  - 訪問リストのCRUD操作を、ブラウザの `localStorage` で即座に管理。
- **Google Sheets リアルタイム同期（天の帳 - Ten no Tobari）**
  - Google Sheets API を用いて、訪問データをスプレッドシートへ自動保存・読み込み。
  - Google Drive API を使用して、既存のログ用スプレッドシート（『研究室見学録 - Academic Inquiry Log』）を自動探索。
- **OAuth 2.0 認証と自動ログイン（サイレントログイン）**
  - 初回ログイン後の `refresh_token` を用いて、ブラウザ再開時にポップアップなしで認証状態を更新。

---

## 2. プロジェクト構成 (Project Directory Structure)

```text
LabInterview-dev/
├── doc/
│   └── refactoring_plan.md   # プロジェクトの可読性・保守性向上のための重構築案
├── src/
│   ├── components/           # UI コンポーネント群
│   │   ├── Header.tsx        # ヘッダー（特定クリックで隠し設定を開く）
│   │   ├── VisitForm.tsx     # 新規訪問リスト登録用フォーム
│   │   ├── VisitItem.tsx     # 訪問レコード表示・個別編集・削除
│   │   └── VisitList.tsx     # リスト全体コンテナ・未ログイン状態のプレースホルダー
│   ├── services/             # 外部APIとの通信ロジック
│   │   └── googleSheetsService.ts # Google OAuth 2.0 認証 & Sheets/Drive API
│   ├── types.ts              # TypeScript 型定義ファイル
│   ├── App.tsx               # アプリケーションのメインエントリー（状態・ロジックの管理）
│   ├── index.css             # Tailwind CSS & アンティークフォントや紙質感のスタイル定義
│   └── main.tsx              # React レンダリングエントリー
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 学校アカウントによる「学校組織限定（組織内のみ）OAuth 2.0 自動ログイン」の実験と検証

本プロジェクトの重要なテーマは、学校から提供された Google Workspace アカウントを用いて、「学校組織内限定」の安全な自動ログインを実現できるかどうかの技術検証です。以下に実験から得られた知見をまとめます。

### A. 組織限定（School-Only）アクセスの実現
- **Google Cloud Console での設定**：
  OAuth 同意画面（OAuth Consent Screen）を作成する際、アプリケーションの公開ステータスを **「Internal（内部）」** に設定します。
  これにより、**その学校の Workspace ドメイン（例：`@school.edu`）の所属ユーザーのみがログイン・認証を許可**されるようになります。外部の一般 `@gmail.com` アカウントは認証段階で拒否されます。

### B. 自動ログイン（サイレントログイン）の仕組み
- **Refresh Token を用いたトークン更新**：
  ユーザーが初回ログイン時に認証コード（Auth Code）を発行すると、それをバックエンドでアクセストークン（`access_token`）およびリフレッシュトークン（`refresh_token`）と交換します。
  フロントエンドまたはバックエンド側で `refresh_token` を保持し、ページ再読み込み時に Google のトークンエンドポイントに裏でリクエストを投げることで、ユーザーが毎回ログインボタンを押すことなく、ポップアップ無しの「自動ログイン（サイレントログイン）」を実現できます。

### C. 学校アカウント（Google Workspace）特有の制約と注意点
1. **管理者によるサードパーティアプリ制限**：
   多くの学校（教育機関）の Google Workspace 組織では、セキュリティポリシーに基づき、管理者（IT部門）が「未承認のサードパーティ製アプリへのアカウントアクセス」をブロックしています。この場合、OAuth画面で「管理者の承認が必要です」と表示されログインできません。実用化には、管理者にクライアントIDを提示して承認（ホワイトリストへの登録）を求める必要があります。
2. **スコープ（Scopes）の制限**：
   本アプリのようにスプレッドシートへの直接書き込み（`spreadsheets`）やドライブ検索（`drive.readonly`）といった強力な権限（敏感なスコープ）を要求する場合、組織の管理ポリシーによって、組織内アプリであっても追加のセキュリティレビューや制限がかけられることがあります。

---

## 4. 特徴的なコードの抜粋 (Selected Code Snippets)

本プロジェクトから学べる、認証およびAPI連携のコア実装例です。

### ① サイレントログインとポップアップ認証の切り替え ([googleSheetsService.ts](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/services/googleSheetsService.ts#L20-L78))

本実装では、ローカルの `refresh_token` が存在する場合はバックエンドへサイレントに更新（Refresh）を求め、存在しない、または強制（`forcePrompt`）された場合のみポップアップによるインタラクティブな OAuth 認証を起動します。

```typescript
export const getAccessToken = (forcePrompt = false): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // 1. メモリキャッシュの有効チェック
    if (accessToken && Date.now() < tokenExpiresAt && !forcePrompt) {
      return resolve(accessToken);
    }

    // 2. ローカルに保存された refresh_token によるサイレント更新の試行
    const savedRefreshToken = localStorage.getItem('google_refresh_token');
    if (savedRefreshToken && !forcePrompt) {
      try {
        const response = await fetch(`${API_BASE}/api/auth/google/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: savedRefreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
          if (data.refresh_token) localStorage.setItem('google_refresh_token', data.refresh_token);
          return resolve(accessToken!);
        }
      } catch (error) {
        console.warn('Token refresh failed');
      }
    }

    // 3. トークンがない、またはエラーの場合は Google Pop-up 認証を起動
    if (!google?.accounts?.oauth2) return reject(new Error('Google API not loaded'));

    const client = google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      ux_mode: 'popup',
      callback: async (response: any) => {
        if (response.code) {
          try {
            const tokenResponse = await fetch(`${API_BASE}/api/auth/google/token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: response.code,
                redirectUri: 'postmessage'
              }),
            });
            const data = await tokenResponse.json();
            accessToken = data.access_token;
            tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
            if (data.refresh_token) localStorage.setItem('google_refresh_token', data.refresh_token);
            resolve(accessToken!);
          } catch (err) { reject(err); }
        } else { reject(new Error('Auth failed')); }
      },
    });
    client.requestCode();
  });
};
```

### ② スプレッドシートデータの再構築と全同期 ([googleSheetsService.ts](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/services/googleSheetsService.ts#L152-L188))

データの整合性を保つため、同期時には一度スプレッドシートの対象行範囲（`A2:E1000`）をクリアし、現在のローカル状態を一括で再書き込みします。

```typescript
export const syncVisitsToSheet = async (token: string, spreadsheetId: string, professors: Professor[]) => {
  // 1. スプレッドシート側の既存レコードを一度全クリア
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/シート1!A2:E1000:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (professors.length === 0) return;

  // 2. データを API 用の2次元配列に変換
  const values = professors.map(p => [
    p.name,
    p.lab,
    p.visited ? '已訪問' : '待訪問',
    p.date,
    p.notes,
  ]);

  // 3. 新しいレコード群を一括書き込み
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/シート1!A2?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('SHEET_NOT_FOUND');
    throw new Error(`Sync failed with status: ${response.status}`);
  }
};
```

---

## 5. 設計・重構案（リファクタリング）について

現在、アプリケーションの主要ロジック（UI、認証状態、自動同期、エラーハンドリング）が単一のコンポーネントである [App.tsx](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/src/App.tsx) に集中しており、将来的な機能拡張やメンテナンスが難しい状態になっています。また、`refresh_token` をローカルストレージへ直接保存することによるXSS（クロスサイトスクリプティング）の脆弱性も存在します。

これらを解消し、プロダクションレディな設計に移行するための**詳細な重構築案（リファクタリング計画）**を別途作成しました。

詳しい内容については、以下のドキュメントをご参照ください：
👉 **[リファクタリング提案書 (doc/refactoring_plan.md)](file:///C:/Users/tamak/Documents/VSC/MosaicsLi.github.io/LabInterview-dev/doc/refactoring_plan.md)**

---

## 6. ローカルでの起動方法 (How to Run)

**前提条件：** Node.js がインストールされていること

1. **依存パッケージのインストール**
   ```bash
   npm install
   ```
2. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
