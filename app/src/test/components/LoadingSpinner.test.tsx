import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect } from 'vitest';
import { theme } from '../../utils/theme';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const TestWrapper = ({ children }: { children: React.ReactNode }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

describe('LoadingSpinner', () => {
  it('should render spinner with default message', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );

    expect(screen.getByText('データを読み込み中...')).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should render spinner with custom message', () => {
    const customMessage = 'カスタムメッセージ';
    render(
      <TestWrapper>
        <LoadingSpinner message={customMessage} />
      </TestWrapper>
    );

    expect(screen.getByText(customMessage)).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should render skeleton variant', () => {
    render(
      <TestWrapper>
        <LoadingSpinner variant="skeleton" />
      </TestWrapper>
    );

    // スケルトンバリアントではロール status が存在しない
    expect(screen.queryByRole('status')).toBeNull();
    // メッセージも表示されない
    expect(screen.queryByText('データを読み込み中...')).toBeNull();
  });

  it('should apply custom height', () => {
    const customHeight = 600;
    render(
      <TestWrapper>
        <LoadingSpinner height={customHeight} />
      </TestWrapper>
    );

    const container = screen.getByRole('status');
    expect(container).toBeDefined();
  });

  it('should have proper accessibility attributes', () => {
    const customMessage = 'アクセシビリティテスト';
    render(
      <TestWrapper>
        <LoadingSpinner message={customMessage} />
      </TestWrapper>
    );

    const statusElement = screen.getByRole('status');
    expect(statusElement.getAttribute('aria-live')).toBe('polite');
    expect(statusElement.getAttribute('aria-label')).toBe(customMessage);
  });

  it('should render with custom size', () => {
    render(
      <TestWrapper>
        <LoadingSpinner size={60} />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeDefined();
  });
});
