---
applyTo: "app/src/**/*.tsx,app/src/**/*.ts"
---

# React + TypeScript 開発ガイドライン

## 1. プロジェクト構造とファイル命名

### ディレクトリ構造

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

### ファイル命名規則

- コンポーネント: PascalCase (`UserProfile.tsx`)
- フック: camelCase + "use"プレフィックス (`useUserData.ts`)
- ユーティリティ: camelCase (`formatCurrency.ts`)
- 型定義: PascalCase + "Type"サフィックス (`UserType.ts`)
- 定数: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## 2. TypeScript 規則

### 型定義

- `interface`を優先的に使用（拡張性のため）
- `type`は Union 型や Computed 型で使用
- すべての props、state、関数の引数・戻り値に型を明示
- `any`の使用を避け、`unknown`や具体的な型を使用

```typescript
// Good
interface UserProps {
  id: string;
  name: string;
  email?: string;
}

// Bad
const user: any = getUserData();
```

### 型ガード

- 型安全性を保つため、適切な型ガードを実装

```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "id" in obj;
}
```

## 3. React コンポーネント設計

### 関数コンポーネント

- 関数コンポーネントを使用（React 16.8 以降）
- アロー関数よりも function 宣言を優先

```typescript
// Good
function UserProfile({ user }: UserProfileProps) {
  return <div>{user.name}</div>;
}

// 名前付きエクスポートを使用
export { UserProfile };
```

### Props 設計

- デフォルト値は関数の引数で設定
- Optional props には`?`を使用
- Children を受け取る場合は`React.PropsWithChildren`を使用

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick: () => void;
}

function Button({ variant = "primary", disabled = false, onClick }: ButtonProps) {
  // 実装
}
```

### State 管理

- ローカル state: `useState`
- 複雑な state: `useReducer`
- グローバル state: Context API または外部ライブラリ
- 副作用: `useEffect`の適切な依存配列設定

```typescript
// State更新は不変性を保つ
const [items, setItems] = useState<Item[]>([]);

const addItem = (newItem: Item) => {
  setItems((prev) => [...prev, newItem]);
};
```

## 4. カスタムフック

### 命名と設計

- "use"プレフィックスを使用
- 単一責任の原則に従う
- 戻り値は配列またはオブジェクトで構造化

```typescript
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 実装...

  return { user, loading, error, refetch };
}
```

## 5. イベントハンドリング

### イベント型定義

- 適切なイベント型を使用
- インライン関数は避け、メモ化を検討

```typescript
const handleSubmit = useCallback(
  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 処理
  },
  [dependencies]
);
```

## 6. パフォーマンス最適化

### メモ化

- `React.memo`でコンポーネントをメモ化
- `useMemo`で重い計算をメモ化
- `useCallback`でイベントハンドラーをメモ化

```typescript
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  return <div>{processedData}</div>;
});
```

### レンダリング最適化

- 条件付きレンダリングは早期リターンを使用
- リストのレンダリングには適切な`key`を設定

```typescript
function UserList({ users }: UserListProps) {
  if (!users.length) {
    return <div>ユーザーが見つかりません</div>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <UserItem user={user} />
        </li>
      ))}
    </ul>
  );
}
```

## 7. エラーハンドリング

### エラー境界

- Error Boundary コンポーネントを実装
- 適切なフォールバック UI を提供

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>エラーが発生しました</div>;
    }

    return this.props.children;
  }
}
```

## 8. スタイリング

### CSS-in-JS / CSS Modules

- Material-UI の styled-components または sx プロパティを使用
- スタイルは論理的にグループ化
- レスポンシブデザインを考慮

```typescript
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
  },
}));
```

## 9. アクセシビリティ

### 基本要件

- 適切な ARIA 属性を設定
- キーボードナビゲーションをサポート
- セマンティック HTML を使用

```typescript
function SearchInput({ onSearch }: SearchInputProps) {
  return <TextField label="検索" placeholder="ユーザー名を入力" aria-label="ユーザー検索" onChange={(e) => onSearch(e.target.value)} />;
}
```

## 10. コードの品質

### ESLint / Prettier

- ESLint ルールに従う
- Prettier で自動フォーマット
- commit 前に自動チェック

### コメント

- 複雑なロジックには説明コメントを追加
- TODO/FIXME コメントは期限を明記
- JSDoc で public API を文書化

```typescript
/**
 * ユーザーデータを取得し、キャッシュします
 * @param userId - 取得するユーザーのID
 * @returns ユーザーデータとロード状態
 */
function useUserData(userId: string) {
  // 実装...
}
```

## 11. テスタビリティ

### テスト用属性

- `data-testid`属性を適切に設定
- ユーザーの操作をシミュレートしやすい構造

```typescript
function LoginForm() {
  return (
    <form data-testid="login-form">
      <TextField data-testid="email-input" label="メールアドレス" />
      <Button data-testid="submit-button" type="submit">
        ログイン
      </Button>
    </form>
  );
}
```

## 12. パフォーマンス指標

### Core Web Vitals

- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

### バンドルサイズ

- 動的インポートでコード分割
- Tree Shaking を活用
- 不要な依存関係を削除
