import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// テスト用のコンポーネント
function TestComponent() {
  return <div>正常なコンポーネント</div>;
}

describe('ErrorBoundary', () => {
  it('正常なコンポーネントがレンダリングされる', () => {
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
  });
});
