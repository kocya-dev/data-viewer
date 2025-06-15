---
applyTo: "app/test/**/*.test.tsx,app/test/**/*.test.ts"
---

# Vitest + React Testing Library テストガイドライン

## 1. テストフレームワーク設定

### 基本構成

- **テストランナー**: Vitest
- **UI テストライブラリ**: React Testing Library
- **アサーションライブラリ**: Vitest 標準（Jest 互換）
- **モック**: `vi.mock` を使用

### ファイル命名規則

- テストファイル: `*.test.tsx` または `*.test.ts`
- モックファイル: `__mocks__/*.ts`
- テストユーティリティ: `test/utils/*.ts`

## 2. テスト設計原則

### ユーザー中心のテスト

- 実装詳細ではなく、ユーザーの操作や見た目の振る舞いをテスト
- ユーザーがアプリケーションをどう使うかを基準にテストケースを設計
- DOM 構造やコンポーネントの内部状態に依存しない

### テスト対象

- **UI コンポーネント**: レンダリング、ユーザーインタラクション
- **カスタムフック**: 状態管理、副作用
- **ユーティリティ関数**: 入力/出力の検証
- **統合テスト**: 複数コンポーネントの連携

## 3. テスト構造

### describe / it ブロック

- `describe`: 機能やコンポーネント単位でグループ化
- `it`: 具体的な振る舞いを明確に記述
- ネストした `describe` で詳細な分類

```typescript
describe("UserProfile コンポーネント", () => {
  describe("正常なユーザーデータが渡された場合", () => {
    it("ユーザー名が表示される", () => {
      // テスト実装
    });

    it("メールアドレスが表示される", () => {
      // テスト実装
    });
  });

  describe("ユーザーデータが null の場合", () => {
    it("ローディング状態が表示される", () => {
      // テスト実装
    });
  });
});
```

## 4. React Testing Library の使用方法

### 基本的なクエリ

- `getByRole`: アクセシビリティロールでの要素取得（推奨）
- `getByLabelText`: ラベルテキストでの要素取得
- `getByText`: テキスト内容での要素取得
- `getByTestId`: data-testid 属性での要素取得（最後の手段）

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("検索ボタンをクリックすると検索が実行される", async () => {
  const user = userEvent.setup();
  const mockOnSearch = vi.fn();

  render(<SearchForm onSearch={mockOnSearch} />);

  const searchInput = screen.getByRole("textbox", { name: /検索/ });
  const searchButton = screen.getByRole("button", { name: /検索実行/ });

  await user.type(searchInput, "test query");
  await user.click(searchButton);

  expect(mockOnSearch).toHaveBeenCalledWith("test query");
});
```

### 非同期処理のテスト

- `waitFor`: 条件が満たされるまで待機
- `findBy*`: 要素が見つかるまで待機
- `act`: React の状態更新を明示的に待機

```typescript
test("データ読み込み後にリストが表示される", async () => {
  render(<UserList />);

  expect(screen.getByText("読み込み中...")).toBeInTheDocument();

  const userItems = await screen.findAllByRole("listitem");
  expect(userItems).toHaveLength(3);
});
```

## 5. モック戦略

### 外部モジュールのモック

```typescript
// CSVファイル読み込みのモック
vi.mock("../services/csvReader", () => ({
  readCsvFile: vi.fn(() => Promise.resolve([{ user_name: "test_user", cost: 10.5 }])),
}));

// Material-UI DatePicker のモック
vi.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: ({ onChange, value }: any) => (
    <input data-testid="date-picker" value={value?.format("YYYY-MM-DD") || ""} onChange={(e) => onChange?.(dayjs(e.target.value))} />
  ),
}));
```

### カスタムフックのモック

```typescript
vi.mock("../hooks/useUserData", () => ({
  useUserData: vi.fn(() => ({
    users: [{ id: "1", name: "Test User" }],
    loading: false,
    error: null,
  })),
}));
```

### コンテキストのモック

```typescript
const mockContextValue = {
  selectedCategory: "actions",
  setSelectedCategory: vi.fn(),
};

const renderWithContext = (component: React.ReactElement) => {
  return render(<CategoryContext.Provider value={mockContextValue}>{component}</CategoryContext.Provider>);
};
```

## 6. テストデータ管理

### テストファクトリー

```typescript
// test/factories/userFactory.ts
export const createUser = (overrides: Partial<User> = {}): User => ({
  id: "1",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

export const createUsers = (count: number): User[] => Array.from({ length: count }, (_, i) => createUser({ id: String(i + 1) }));
```

### フィクスチャデータ

```typescript
// test/fixtures/csvData.ts
export const mockActionsData = [
  { user_name: "john_doe", repository_name: "repo1", time: 120, cost: 5.5 },
  { user_name: "jane_smith", repository_name: "repo2", time: 80, cost: 3.2 },
];
```

## 7. コンポーネントテストパターン

### プレゼンテーショナルコンポーネント

```typescript
describe("UserCard コンポーネント", () => {
  const defaultProps = {
    user: createUser(),
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ユーザー名が表示される", () => {
    render(<UserCard {...defaultProps} />);

    expect(screen.getByText(defaultProps.user.name)).toBeInTheDocument();
  });

  it("クリック時に onClick が呼び出される", async () => {
    const user = userEvent.setup();
    render(<UserCard {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(defaultProps.onClick).toHaveBeenCalledWith(defaultProps.user);
  });
});
```

### コンテナコンポーネント

```typescript
describe("UserList コンテナ", () => {
  it("ユーザーデータを読み込んで表示する", async () => {
    const mockUsers = createUsers(3);
    vi.mocked(useUserData).mockReturnValue({
      users: mockUsers,
      loading: false,
      error: null,
    });

    render(<UserListContainer />);

    expect(screen.getByText("ユーザー一覧")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("ローディング中にスピナーが表示される", () => {
    vi.mocked(useUserData).mockReturnValue({
      users: [],
      loading: true,
      error: null,
    });

    render(<UserListContainer />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
```

## 8. カスタムフックテスト

### フック単体テスト

```typescript
import { renderHook, act } from "@testing-library/react";

describe("useUserData フック", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態でローディング状態になる", () => {
    const { result } = renderHook(() => useUserData("user1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("データ取得成功時にユーザーデータが設定される", async () => {
    const mockUser = createUser();
    vi.mocked(fetchUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUserData("user1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });
  });
});
```

## 9. エラーハンドリングテスト

### Error Boundary のテスト

```typescript
describe("ErrorBoundary", () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error("Test error");
    }
    return <div>正常なコンポーネント</div>;
  };

  it("エラーが発生した場合にフォールバック UI を表示する", () => {
    // コンソールエラーを抑制
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.queryByText("正常なコンポーネント")).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
```

## 10. パフォーマンステスト

### レンダリング回数のテスト

```typescript
describe("UserList パフォーマンス", () => {
  it("同じプロパティでは再レンダリングされない", () => {
    const renderSpy = vi.fn();
    const TestComponent = React.memo(() => {
      renderSpy();
      return <div>Test</div>;
    });

    const { rerender } = render(<TestComponent />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    rerender(<TestComponent />);
    expect(renderSpy).toHaveBeenCalledTimes(1); // 再レンダリングされない
  });
});
```

## 11. アクセシビリティテスト

### アクセシビリティ属性のテスト

```typescript
describe("SearchForm アクセシビリティ", () => {
  it("適切な ARIA 属性が設定されている", () => {
    render(<SearchForm />);

    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toHaveAttribute("aria-label", "ユーザー検索");

    const submitButton = screen.getByRole("button");
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("キーボードナビゲーションが機能する", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);

    const searchInput = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button");

    await user.tab();
    expect(searchInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });
});
```

## 12. 統合テスト

### 複数コンポーネントの連携テスト

```typescript
describe("Dashboard 統合テスト", () => {
  it("カテゴリ変更時にデータが更新される", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    // 初期状態でActions タブが選択されている
    expect(screen.getByText("GitHub Actions データ")).toBeInTheDocument();

    // Codespaces タブをクリック
    await user.click(screen.getByRole("tab", { name: /codespaces/i }));

    // Codespaces データが表示される
    expect(screen.getByText("Codespaces データ")).toBeInTheDocument();
  });
});
```

## 13. テスト設定とユーティリティ

### セットアップファイル

```typescript
// test/setup.ts
import { beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

beforeEach(() => {
  // 各テスト前のセットアップ
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### カスタムレンダー

```typescript
// test/utils/render.tsx
export const renderWithProviders = (ui: React.ReactElement, options: RenderOptions = {}) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>
      <CategoryProvider>{children}</CategoryProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
};
```

## 14. テスト実行とカバレッジ

### 実行コマンド

```bash
# 全テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ付き実行
npm run test:coverage
```

### カバレッジ目標

- **行カバレッジ**: 80% 以上
- **分岐カバレッジ**: 75% 以上
- **関数カバレッジ**: 85% 以上
- **重要な機能**: 90% 以上

## 15. ベストプラクティス

### テスト作成時の注意点

- 一つのテストで一つの観点のみをテスト
- テストの独立性を保つ（他のテストに依存しない）
- 意味のあるテスト名を付ける
- フラップするテストを作らない
- 外部依存を適切にモック化する

### デバッグ支援

- `screen.debug()` で DOM 構造を確認
- `console.log()` でテスト中の値を確認
- VS Code のデバッガーを活用

### パフォーマンス考慮

- 重いモックは適切に管理
- 不要なレンダリングを避ける
- テスト実行時間を定期的に確認
