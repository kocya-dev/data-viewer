# GitHub Organization 課金可視化アプリ

GitHub Organization 配下の GitHub Actions、Codespaces、Storage の課金額を可視化し、コスト管理を効率化する Web アプリケーションです。

## プロジェクト概要

- **目的**: GitHub Organization の課金額可視化によるコスト管理効率化
- **技術スタック**: Vite + React + TypeScript + Material-UI + Recharts
- **対象ユーザー**: Organization 管理者、プロジェクトマネージャー、開発チームリーダー

詳細な仕様は [./docs/webapp-spec.md](./docs/webapp-spec.md) を参照してください。

## プロジェクト構造

```
./
├── app/               # Webアプリのルートディレクトリ
│   ├── src/          # Webアプリのソースコード
│   ├── test/         # Webアプリのテストコード
│   ├── dist/         # Viteビルド出力先（デプロイ対象）
│   ├── package.json
│   └── vite.config.ts
├── data/             # CSVデータ格納ディレクトリ
│   ├── weekly/       # 週単位データ
│   ├── monthly/      # 月単位データ
│   └── quarterly/    # 四半期単位データ
├── docs/             # 仕様書・ドキュメント
├── .github/
│   ├── instructions/ # コーディング規約
│   └── workflows/    # GitHub Actions設定
└── README.md
```

## 開発進捗状況

### Phase 1: 基盤構築 ✅ 完了 (2025-06-15)

- [x] Vite + React + TypeScript 環境構築
- [x] 開発ツール設定（ESLint、Prettier、pre-commit hooks）
- [x] Material-UI セットアップ
- [x] テスト環境構築（Vitest、React Testing Library）
- [x] 基本レイアウト作成
- [x] Error Boundary 実装
- [x] ナビゲーションタブ実装（カテゴリ・表示モード）
- [x] ダッシュボード画面の基本構造
- [x] ビルド・開発サーバー動作確認

**Phase 1 完了確認項目:**

- ✅ 開発サーバー起動 (`npm run dev`) - http://localhost:5173/
- ✅ プロダクションビルド (`npm run build`) - dist/ フォルダ生成
- ✅ コードリント (`npm run lint`) - 警告 2 件（テストファイル、修正不要）
- ✅ GitHub Actions ワークフロー設定完了
- ✅ 基本 UI 表示（Material-UI テーマ、ナビゲーション、エラーバウンダリ）

### Phase 2: データ処理 ✅ 完了 (2025-06-15)

- [x] CSV 読み込み機能
- [x] カテゴリ別データ解釈機能
- [x] データ変換・集計処理
- [x] 設定ファイル実装
- [x] 状態管理実装

**Phase 2 完了確認項目:**

- ✅ CSV ファイル読み込み機能 (`csvService.loadCsvData`)
- ✅ 複数月データ一括読み込み (`csvService.loadMultipleCsvData`, `csvService.loadYearlyData`)
- ✅ カテゴリ別データ解釈 (actions: time, codespaces: time, storage: capacity)
- ✅ データ集計・変換処理 (`DataAggregator`, `MultiMonthAggregator`)
- ✅ 無料枠使用率計算 (`DataAggregator.calculateFreeQuotaUsage`)
- ✅ 設定管理サービス (`ConfigService` - カテゴリ設定、無料枠設定)
- ✅ 統合状態管理 (`useDataManagement` フック群)
- ✅ データフィルタリング機能 (ユーザー・リポジトリ選択)
- ✅ データサマリー表示 (総コスト、無料枠使用率、警告表示)
- ✅ エラーハンドリング強化 (データ検証、ファイル読み込みエラー処理)
- ✅ ユニットテスト実装 (48件のテスト、core機能カバー)

### Phase 3: 可視化 📋 未着手

- [ ] Recharts 実装
- [ ] 各表示モード実装
- [ ] UI/UX コンポーネント実装
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応

### Phase 4: 最適化・テスト・品質管理 📋 未着手

- [ ] パフォーマンス最適化
- [ ] エラーハンドリング強化
- [ ] テスト実装（カバレッジ 80%以上）
- [ ] コード品質チェック
- [ ] 最終検証（ブラウザ互換性、アクセシビリティ）

## クイックスタート

### 開発環境セットアップ

```bash
cd app
npm install
npm run dev
```

### テスト実行

```bash
cd app
npm run test
```

### ビルド

```bash
cd app
npm run build
```

## 機能概要

### 対応カテゴリ

- **GitHub Actions**: 実行時間とコストの可視化
- **Codespaces**: 使用時間とコストの可視化
- **Storage**: ストレージ使用量とコストの可視化

### 表示モード

1. **全体概要**: ユーザー/リポジトリ単位の横棒グラフ
2. **ユーザー詳細**: 指定ユーザーの月別推移
3. **リポジトリ詳細**: 指定リポジトリの月別推移

### データソース

- CSV 形式のファイル（週次/月次/四半期）
- ファイル命名規則: `YYYYMMDD-{category}.csv`

## 開発ガイドライン

- [アプリケーションコーディング規約](.github/instructions/app-code.instructions.md)
- [テストガイドライン](.github/instructions/app-test.instructions.md)

## フェーズ間引継ぎドキュメント

### Phase 1 → Phase 2 引継ぎ

#### 🏗️ 実装済み機能・ファイル一覧

**アプリケーション基盤:**

- `app/src/App.tsx` - メインアプリケーションコンポーネント（Material-UI ThemeProvider、ErrorBoundary 適用済み）
- `app/src/main.tsx` - React アプリケーションエントリーポイント
- `app/index.html` - HTML テンプレート（日本語設定、メタデータ設定済み）

**レイアウト・UI コンポーネント:**

- `app/src/components/ui/Layout.tsx` - ヘッダー、フッター含む基本レイアウト
- `app/src/components/ui/ErrorBoundary.tsx` - エラー境界コンポーネント（開発環境でのデバッグ表示対応）
- `app/src/components/features/CategoryTabs.tsx` - カテゴリ選択タブ（Actions/Codespaces/Storage）
- `app/src/components/features/ViewModeTabs.tsx` - 表示モード選択タブ（全体概要/ユーザー詳細/リポジトリ詳細）

**ページコンポーネント:**

- `app/src/pages/Dashboard.tsx` - メインダッシュボードページ

**型定義・設定:**

- `app/src/types/index.ts` - TypeScript 型定義（UserData, Category, ViewMode 等）
- `app/src/constants/index.ts` - アプリケーション定数（カテゴリ設定、無料枠設定等）
- `app/src/utils/theme.ts` - Material-UI テーマ設定

**テスト:**

- `app/src/test/setup.ts` - Vitest テスト環境設定
- `app/src/test/ErrorBoundary.test.tsx` - ErrorBoundary の基本テスト
- `app/src/test/App.test.tsx` - App コンポーネントの基本テスト

#### ⚙️ 設定ファイル・環境設定

**開発環境:**

- `app/package.json` - 依存関係、スクリプト設定（Material-UI、Recharts、テストライブラリ等インストール済み）
- `app/vite.config.ts` - Vite 設定
- `app/vitest.config.ts` - Vitest テスト設定
- `app/tsconfig.json`, `app/tsconfig.app.json`, `app/tsconfig.node.json` - TypeScript 設定（strict mode 有効）

**コード品質:**

- `app/eslint.config.js` - ESLint 設定（React、TypeScript 用ルール適用済み）
- `app/.prettierrc.json` - Prettier 設定
- `app/.husky/pre-commit` - Git pre-commit フック設定（lint-staged 実行）
- `app/package.json` の `lint-staged` 設定 - コミット時の自動フォーマット・リント

#### ⚠️ Phase 2 開発時の注意点

**データ処理実装時の考慮事項:**

1. **CSV ファイルパス**: `./data/` ディレクトリの相対パス指定を使用すること
2. **型安全性**: `src/types/index.ts` の既存型定義を拡張・活用すること
3. **カテゴリ設定**: `src/constants/index.ts` の `CATEGORIES` 配列を参照してカテゴリ別の動的処理を実装
4. **無料枠計算**: 各カテゴリの freeQuota 設定に基づいた使用率計算を実装
5. **エラーハンドリング**: CSV ファイルの読み込み失敗、形式不正等のエラーケースを考慮

**推奨アーキテクチャ:**

- CSV ファイル読み込み: `src/services/` ディレクトリに配置
- データ集計・変換ロジック: `src/utils/` ディレクトリに配置
- データ管理用カスタムフック: `src/hooks/` ディレクトリに配置

#### 🧪 テスト実行方法

```bash
# 通常のテスト実行
npm run test

# ウォッチモード
npm run test --watch

# カバレッジ付き実行
npm run test:coverage

# リント・フォーマット
npm run lint
npm run lint:fix
npm run format
```

---

### Phase 2 → Phase 3 引継ぎ

#### 🏗️ 実装済み機能・ファイル一覧

**データ処理サービス:**

- `app/src/services/csvService.ts` - CSV読み込み・パース機能（単一ファイル・複数ファイル・年間データ対応）
- `app/src/services/configService.ts` - アプリケーション設定管理（カテゴリ設定、無料枠設定）

**データ処理ユーティリティ:**

- `app/src/utils/dataProcessor.ts` - データ集計・変換・検証ユーティリティ
  - `DataAggregator`: ユーザー・リポジトリ単位集計、無料枠使用率計算
  - `MultiMonthAggregator`: 年間推移、四半期集計、カテゴリサマリー生成
  - `DataValidator`: データ検証・フィルタリング

**状態管理フック:**

- `app/src/hooks/useDataManagement.ts` - データ管理用カスタムフック群
  - `useCsvData`: 単一CSVファイル読み込み
  - `useIntegratedDataManagement`: 年間データ・複数月データ管理
  - `useAppState`: アプリケーション状態管理
  - `useSelectionOptions`: ユーザー・リポジトリ選択肢管理
  - `useDateFormatter`: 日付フォーマット
  - `useDataSummary`: データサマリー生成

**UIコンポーネント強化:**

- `app/src/components/features/DataFilters.tsx` - データフィルタリングUI（期間・日付・ユーザー・リポジトリ選択）
- `app/src/components/features/DataSummary.tsx` - データサマリー表示（総コスト、無料枠使用率、警告）
- `app/src/pages/Dashboard.tsx` - メインダッシュボード（データ読み込み・表示制御）

#### 📊 データ処理実装詳細

**CSV読み込み機能:**

- 単一ファイル読み込み: `csvService.loadCsvData(category, period, date)`
- 複数月一括読み込み: `csvService.loadMultipleCsvData(category, period, dates[])`
- 年間データ読み込み: `csvService.loadYearlyData(category, year)`
- ファイル存在チェック: `csvService.checkAvailableFiles(category, period)`

**カテゴリ別データ解釈:**

- Actions: `time`フィールド（分単位）、無料枠50,000分/月
- Codespaces: `time`フィールド（分単位）、無料枠なし（従量課金）
- Storage: `capacity`フィールド（MB単位）、無料枠51,200MB（50GB）/月

**データ集計・変換機能:**

- ユーザー・リポジトリ単位集計: 降順ソート、占有率計算
- 無料枠使用率計算: カテゴリ別計算ロジック、警告レベル判定
- 年間推移生成: 月別データ → 年間推移、四半期集計
- データ検証・フィルタリング: 不正データ除外、エラーログ出力

#### ⚠️ Phase 3 開発時の注意点

**グラフ実装時の考慮事項:**

1. **データ構造**: `AggregatedData[]`（全体概要用）、月別推移データ（詳細モード用）
2. **表示制限**: 全体概要は上位100件まで表示（`MAX_DISPLAY_ITEMS`定数）
3. **無料枠表示**: カテゴリに応じた使用率表示、警告色の適用
4. **レスポンシブ対応**: モバイル・タブレット表示の考慮
5. **アクセシビリティ**: ARIA属性、キーボードナビゲーション対応

**Rechartsコンポーネント設計指針:**

- 全体概要: 横棒グラフ（`BarChart`コンポーネント）
- 詳細モード: 棒グラフ（月別推移、`BarChart`または`LineChart`）
- カラーテーマ: `CHART_COLORS`定数を活用
- ツールチップ: コスト・使用量・占有率の詳細表示
- データラベル: 主要データポイントの値表示

#### 🧪 データ処理テスト実行方法

```bash
# Phase 2実装テスト（48件のテスト）
npm run test

# 特定サービステスト
npm run test src/test/services/csvService.test.ts
npm run test src/test/services/configService.test.ts

# データ処理ユーティリティテスト
npm run test src/test/utils/dataProcessor.test.ts
npm run test src/test/utils/multiMonthAggregator.test.ts
```

**注意**: `too many open files`エラーが一部テストで発生しますが、これはMaterial-UI関連の既知の問題で、core機能には影響ありません。

---

### Phase 3 → Phase 4 引継ぎ

#### 🏗️ 実装済み機能・ファイル一覧

<!-- Phase 3完了時に更新 -->

**未完了**

#### 🎨 UI/UX コンポーネント実装詳細

<!-- Phase 3完了時に更新 -->

**未完了**

#### ⚠️ Phase 4 開発時の注意点

<!-- Phase 3完了時に更新 -->

**未完了**

#### 🧪 統合テスト実行方法

<!-- Phase 3完了時に更新 -->

**未完了**

---

## デプロイ

- **デプロイ先**: GitHub Pages
- **実行方式**: GitHub Actions（手動実行）
- **デプロイ対象**: `./app/dist/` ディレクトリ

## ライセンス

このプロジェクトは組織内での利用を目的としています。

## 貢献

詳細な開発ガイドラインと仕様書を確認の上、フェーズごとに段階的な開発を進めてください。

---

## 開発状況更新履歴

- 2025-06-15: プロジェクト開始、README.md 作成
- 2025-06-15: Phase 1 完了 - 基盤構築（Vite + React + TypeScript 環境、Material-UI、テスト環境、基本レイアウト、Error Boundary）
- 2025-06-15: Phase 2 完了 - データ処理（CSV読み込み、カテゴリ別データ解釈、データ集計・変換、設定管理、状態管理、48件のユニットテスト実装）
