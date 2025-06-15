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

### Phase 1: 基盤構築 📋 未着手

- [ ] Vite + React + TypeScript 環境構築
- [ ] 開発ツール設定（ESLint、Prettier、pre-commit hooks）
- [ ] Material-UI セットアップ
- [ ] テスト環境構築（Vitest、React Testing Library）
- [ ] 基本レイアウト作成
- [ ] Error Boundary 実装

### Phase 2: データ処理 📋 未着手

- [ ] CSV 読み込み機能
- [ ] カテゴリ別データ解釈機能
- [ ] データ変換・集計処理
- [ ] 設定ファイル実装
- [ ] 状態管理実装

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
# Phase 1完了後に更新予定
cd app
npm install
npm run dev
```

### テスト実行

```bash
# Phase 1完了後に更新予定
cd app
npm run test
```

### ビルド

```bash
# Phase 1完了後に更新予定
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

<!-- Phase 1完了時に更新 -->

**未完了**

#### ⚙️ 設定ファイル・環境設定

<!-- Phase 1完了時に更新 -->

**未完了**

#### ⚠️ Phase 2 開発時の注意点

<!-- Phase 1完了時に更新 -->

**未完了**

#### 🧪 テスト実行方法

<!-- Phase 1完了時に更新 -->

**未完了**

---

### Phase 2 → Phase 3 引継ぎ

#### 🏗️ 実装済み機能・ファイル一覧

<!-- Phase 2完了時に更新 -->

**未完了**

#### 📊 データ処理実装詳細

<!-- Phase 2完了時に更新 -->

**未完了**

#### ⚠️ Phase 3 開発時の注意点

<!-- Phase 2完了時に更新 -->

**未完了**

#### 🧪 データ処理テスト実行方法

<!-- Phase 2完了時に更新 -->

**未完了**

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
