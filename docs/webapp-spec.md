# GitHub Organization 課金可視化 Web アプリ 要件定義・仕様書

## 1. プロジェクト概要

### 1.1 目的

GitHub Organization 配下の GitHub Actions、Codespaces、Storage の課金額を可視化し、コスト管理を効率化する。

### 1.2 対象ユーザー

- Organization 管理者
- プロジェクトマネージャー
- 開発チームリーダー

## 2. 技術スタック

### 2.1 主要技術

| 項目             | 技術        |
| ---------------- | ----------- |
| ビルドツール     | Vite        |
| フレームワーク   | React       |
| UI ライブラリ    | Material-UI |
| グラフライブラリ | Recharts    |
| 言語             | TypeScript  |

### 2.2 開発ツール・品質管理

| 項目                   | 技術・設定                                               |
| ---------------------- | -------------------------------------------------------- |
| コードフォーマット     | Prettier                                                 |
| コード静的解析         | ESLint                                                   |
| 型安全性               | TypeScript strict mode                                   |
| テストフレームワーク   | Vitest, React Testing Library                            |
| コミット時品質チェック | pre-commit hooks (lint-staged + husky)                   |
| パフォーマンス指標     | Core Web Vitals（LCP < 2.5s, FID < 100ms, CLS < 0.1）    |
| アクセシビリティ       | ARIA 属性、セマンティック HTML、キーボードナビゲーション |

### 2.3 開発方針

- TypeScript strict mode による型安全性の確保
- 関数コンポーネントと React Hooks の使用
- Material-UI による統一されたデザインシステム
- パフォーマンス最適化（Core Web Vitals 達成）
- アクセシビリティ対応（ARIA 属性、キーボードナビゲーション）
- 詳細なコーディング規約は `.github/instructions/app-code.instructions.md` を参照

### 2.4 ディレクトリ構造

#### プロジェクト全体

```
./
├── app/               # Webアプリのルートディレクトリ
│   ├── src/          # Webアプリのソースコード
│   ├── test/         # Webアプリのテストコード
│   ├── dist/         # Viteビルド出力先（デプロイ対象）
│   ├── package.json
│   └── vite.config.ts
├── data/             # CSVデータ格納ディレクトリ
├── docs/             # 仕様書・ドキュメント
├── .github/
│   └── workflows/    # GitHub Actions設定
└── README.md
```

#### アプリケーション内部構造

```
app/src/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 基本的なUIコンポーネント
│   └── features/       # 機能固有のコンポーネント
├── hooks/              # カスタムフック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── constants/          # 定数定義
├── services/           # API・外部サービス連携
└── pages/              # ページコンポーネント
```

## 3. 機能要件

### 3.1 データソース

#### 3.1.1 データ格納場所

- パス: `./data/` (index.html と同階層)
- ディレクトリ構造:
  - `./data/weekly/` - 週単位のデータが配置
  - `./data/monthly/` - 月単位のデータが配置
  - `./data/quarterly/` - 四半期単位のデータが配置
- ファイル命名規則: `YYYYMMDD-{category}.csv`
  - category: `actions`, `codespaces`, `storage`

#### 3.1.2 CSV データ形式

**共通フィールド**:

- `user_name`: GitHub ユーザー名
- `repository_name`: リポジトリ名
- `cost`: 料金（USD）

**カテゴリ別可変フィールド**:

##### GitHub Actions (`actions`)

```csv
user_name,repository_name,time,cost
john_doe,my-repo,120,5.50
jane_smith,web-app,80,3.20
```

- `time`: 実行時間（分単位）

##### Codespaces (`codespaces`)

```csv
user_name,repository_name,time,cost
john_doe,my-repo,180,12.40
jane_smith,web-app,240,16.80
```

- `time`: 使用時間（分単位）

##### Storage (`storage`)

```csv
user_name,repository_name,capacity,cost
john_doe,my-repo,2048,1.20
jane_smith,web-app,1024,0.60
```

- `capacity`: ストレージ使用量（MB 単位）

**データ形式仕様**:

- 基本構造: `user_name,repository_name,{category_specific_field},cost`
- 第 3 フィールドはカテゴリによって名称・単位が変動
- 新規カテゴリ追加時も同様の 4 フィールド構造を維持

**カテゴリ別フィールド定義**:

- Actions: `time` (分単位) - 実行時間
- Codespaces: `time` (分単位) - 使用時間
- Storage: `capacity` (MB 単位) - ストレージ使用量

**柔軟性対応**:

- 新規カテゴリ追加時は第 3 フィールドの名称・単位を設定ファイルで定義
- アプリケーションは第 3 フィールドを動的に解釈する機能を持つ

### 3.2 表示機能

#### 3.2.1 カテゴリ切り替え

- GitHub Actions
- Codespaces
- Storage
- **UI**: タブで切り替え（各タブ内にモード選択とフィルター設定が配置される）

#### 3.2.2 表示モード

##### モード 1: 全体概要（ユーザー単位・リポジトリ単位）

**UI 仕様**:

**入力コントロール**:

- **日付指定**:
  - 期間=月、四半期の場合: YYYY-MM 形式の DatePicker で月指定
  - 期間=週の場合: YYYY-MM-DD 形式の DatePicker で日指定
- **表示形式指定**: ユーザー単位 / リポジトリ単位 をラジオボタンで切り替え
- **期間指定**: 週単位（月曜日開始）/ 月単位 / 四半期単位 をセレクトボックスで選択

**表示内容**:

- **メイングラフ**: 横棒グラフ
  - 料金の多いデータを上から順に表示（上位 100 位まで）
  - 各バーには料金の値を文字で併記
  - X 軸: 料金（USD）、Y 軸: ユーザー名/リポジトリ名
- **サマリー**: 全体料金、無料枠使用率

##### モード 2: 指定ユーザー詳細

**UI 仕様**:

**入力コントロール**:

- **日付指定**: YYYY 形式の DatePicker で年指定
  - 指定なしの場合は直近 1 年（12 ヶ月）のデータを表示
- **ユーザー選択**:
  - ドロップダウンリスト
  - テキスト入力による絞り込み機能付き（入力文字に合致する候補のみ表示）

**表示内容**:

- **表示期間**: 年間（月単位）
- **グラフ**: 月別料金推移（棒グラフ）
  - X 軸: 月、Y 軸: 料金（USD）

##### モード 3: 指定リポジトリ詳細

**UI 仕様**:

**入力コントロール**:

- **日付指定**: YYYY 形式の DatePicker で年指定
  - 指定なしの場合は直近 1 年（12 ヶ月）のデータを表示
- **リポジトリ選択**:
  - ドロップダウンリスト
  - テキスト入力による絞り込み機能付き（入力文字に合致する候補のみ表示）

**表示内容**:

- **表示期間**: 年間（月単位）
- **グラフ**: 月別料金推移（棒グラフ）
  - X 軸: 月、Y 軸: 料金（USD）

## 4. 非機能要件

### 4.1 パフォーマンス

- 初期表示: 3 秒以内
- 画面切り替え: 1 秒以内

### 4.2 ユーザビリティ

- レスポンシブデザイン対応
- 直感的な UI/UX

### 4.3 互換性

- モダンブラウザ対応（Chrome, Firefox, Safari, Edge）

### 4.4 拡張性

- **カテゴリ追加対応**: 新規課金カテゴリの追加に柔軟に対応
  - CSV データ形式の第 3 フィールドの動的解釈
  - UI 要素（タブ、フィルター）の動的生成
  - 無料枠設定の外部設定化
- **データスキーマ変更**: カテゴリごとの異なるデータ構造に対応
- **設定ファイル**: カテゴリ定義・無料枠設定の外部設定化

### 4.5 コード品質・開発プロセス

- TypeScript strict mode による厳格な型チェック
- Prettier による自動フォーマット、ESLint による静的解析
- Vitest による単体テスト、React Testing Library による UI テスト
- pre-commit hooks による品質管理
- Error Boundary によるエラーハンドリング
- アクセシビリティ対応
- 詳細なコーディング規約は `.github/instructions/app-code.instructions.md` を参照

### 4.6 デプロイメント

- **デプロイ方式**: GitHub Actions を使用した自動デプロイ
- **実行タイミング**: 手動でワークフローを実行した時
- **デプロイ先**: GitHub Pages
- **デプロイ対象**: Vite でビルドした出力先ディレクトリ（`./app/dist/`）
- **ワークフロー**:
  - Vite ビルドの実行
  - 生成された静的ファイルを GitHub Pages にデプロイ
  - CSV データファイルも含めて配信

## 5. 画面設計

### 5.1 画面構成

```
Header
├── アプリタイトル
└── カテゴリ選択タブ（Actions/Codespaces/Storage）

Main Content (各タブ内)
├── 表示モード選択（タブ）
│   ├── 全体概要
│   ├── ユーザー詳細
│   └── リポジトリ詳細
├── フィルター・設定エリア
│   ├── 日付指定（DatePicker）
│   ├── 期間選択（週/月/四半期）※全体概要のみ
│   ├── 表示単位（ユーザー/リポジトリ）※全体概要のみ
│   └── 対象選択（ユーザー名/リポジトリ名）※詳細モードのみ
└── グラフ・データ表示エリア
    ├── メイングラフ（横棒/棒グラフ）
    ├── サマリー情報
    └── データテーブル（オプション）
```

### 5.2 画面遷移

- SPA（Single Page Application）
- 状態管理による画面切り替え

### 5.3 UI 仕様詳細

- **カテゴリ切り替え**: タブ形式
- **モード切り替え**: タブ内でさらにタブ形式
- **日付入力**: Material-UI DatePicker 使用
- **ユーザー/リポジトリ選択**: フィルタリング可能ドロップダウン
- **グラフ種類**:
  - 全体概要: 横棒グラフ（上位 100 位まで表示）
  - 詳細モード: 棒グラフ（月別推移）
- **ツールチップ仕様**:
  - 統一デザイン: Material-UI Box + Typography
  - 全体概要モード表示項目:
    - ユーザー名/リポジトリ名
    - コスト（USD、小数点第 2 位まで）
    - 占有率（%、小数点第 1 位まで）
    - **使用量（時間・容量）**: カテゴリ別詳細
      - Actions/Codespaces: 実行時間（分単位）
      - Storage: 使用容量（MB 単位）
    - **コスト算出根拠**: 使用量からコスト計算の明確化
  - 詳細モード表示項目:
    - 対象月
    - 月別コスト（USD、小数点第 2 位まで）
    - データ件数
    - **月別使用量**: カテゴリ別集計値
      - Actions/Codespaces: 月間総実行時間（分）
      - Storage: 月間総使用容量（MB）

## 6. データ処理仕様

### 6.1 データ読み込み

- CSV ファイルの静的読み込み（デプロイ時にバンドル）
- **更新頻度**: 週次（1 週間ごと）にデータ更新
- **デプロイ方式**: 静的データとして集計済み CSV を配信
- **リアルタイム更新**: 不要
- **カテゴリ別データ解釈**: 第 3 フィールドの動的解釈機能
- エラーハンドリング（ファイル未存在、形式不正）

### 6.2 データ集計

- 期間別集計（日次 → 週次/月次/四半期）
  - 週次: 月曜日開始の 7 日間
  - 四半期: 4-6 月、7-9 月、10-12 月、1-3 月
- ユーザー別・リポジトリ別集計
- 占有率計算
- 無料枠使用率計算
- **使用量データ集計**:
  - カテゴリ別使用量の合計値計算（time/capacity）
  - ツールチップ表示用のデータ構造拡張
  - 集計単位別使用量データ（ユーザー単位・リポジトリ単位）
  - 月別使用量推移データ（詳細モード用）

### 6.3 無料枠管理

**カテゴリ別無料枠設定**:

- GitHub Actions: 50,000 分/月（time フィールド基準）
- Codespaces: 無料枠なし（従量課金のみ）
- Storage: 50GB/月（capacity フィールド基準、50GB = 51,200MB）

**処理仕様**:

- カテゴリごとの異なる計算基準に対応
- 使用率計算・表示
- 無料枠超過アラート表示
- **設定の外部化**: 新規カテゴリ追加時の無料枠設定を動的に管理

**表示仕様**:

- Actions: 使用時間/50,000 分の使用率を％表示
- Codespaces: 無料枠なしのため使用料金のみ表示
- Storage: 使用量（MB）/51,200MB の使用率を％表示
- **新規カテゴリ**: 設定ファイルに基づく動的表示

**アラート表示**:

- 無料枠 90%超過時: 黄色警告
- 無料枠 100%超過時: 赤色警告

## 7. 開発計画

### Phase 1: 基盤構築

- Vite + React + TypeScript 環境構築
- 開発ツール設定（ESLint、Prettier、pre-commit hooks）
- Material-UI セットアップ
- テスト環境構築（Vitest、React Testing Library）
- 基本レイアウト作成
- Error Boundary 実装

### Phase 2: データ処理

- CSV 読み込み機能
- カテゴリ別データ解釈機能
- データ変換・集計処理
- 設定ファイル実装
- 状態管理実装

### Phase 3: 可視化

- Recharts 実装
- 各表示モード実装
- UI/UX コンポーネント実装
- アクセシビリティ対応
- レスポンシブ対応
- **カスタムツールチップ強化**:
  - 使用量データ表示機能（時間・容量）
  - カテゴリ別表示切り替え
  - コスト算出根拠の明示
  - 無料枠との比較表示

### Phase 4: 最適化・テスト・品質管理

- パフォーマンス最適化
- エラーハンドリング強化
- テスト実装（カバレッジ 80%以上）
- コード品質チェック
- 最終検証（ブラウザ互換性、アクセシビリティ）

## 8. 開発・運用計画

本仕様書に基づいて、以下の開発計画で進行します。各章で定義された要件を満たすよう、段階的に実装を進めていきます。

## 9. データ型定義

### 9.1 基本データ型

**UserData インターフェース**:

```typescript
interface UserData {
  user_name: string;
  repository_name: string;
  time?: number; // Actions, Codespaces用（分単位）
  capacity?: number; // Storage用（MB単位）
  cost: number; // USD
}
```

**AggregatedData インターフェース（ツールチップ強化版）**:

```typescript
interface AggregatedData {
  name: string; // ユーザー名またはリポジトリ名
  cost: number; // 集計コスト（USD）
  percentage: number; // 占有率（%）
  totalUsage?: number; // 集計使用量（time/capacity）
  usageUnit?: string; // 使用量単位（"分" または "MB"）
}
```

**MonthlyData インターフェース（詳細モード用）**:

```typescript
interface MonthlyData {
  month: string; // フォーマット済み月名（例：2024年1月）
  cost: number; // 月別コスト（USD）
  dataCount: number; // データ件数
  totalUsage?: number; // 月別総使用量
  usageUnit?: string; // 使用量単位
}
```

### 9.2 ツールチップ表示データ

**OverviewTooltipData**:

- name: 名前（ユーザー/リポジトリ）
- cost: コスト（USD、小数点第 2 位まで）
- percentage: 占有率（%、小数点第 1 位まで）
- usage: 使用量（カテゴリ別）
- usageUnit: 使用量単位

**DetailTooltipData**:

- month: 対象月
- cost: 月別コスト（USD）
- dataCount: データ件数
- totalUsage: 月別総使用量
- usageUnit: 使用量単位
