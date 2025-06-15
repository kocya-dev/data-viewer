import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../utils/theme';
import { DetailChart } from '../../components/features/DetailChart';
import type { MonthlyData } from '../../components/features/DetailChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('DetailChart', () => {
  const mockData: MonthlyData[] = [
    {
      month: '2024年1月',
      cost: 150.75,
      dataCount: 25,
    },
    {
      month: '2024年2月',
      cost: 200.50,
      dataCount: 32,
    },
    {
      month: '2024年3月',
      cost: 89.25,
      dataCount: 18,
    },
  ];

  const testTitle = 'ユーザー「john_doe」の月別推移 (2024年)';

  it('should render chart with data and title', () => {
    render(
      <TestWrapper>
        <DetailChart data={mockData} title={testTitle} />
      </TestWrapper>
    );

    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(
      <TestWrapper>
        <DetailChart data={[]} title={testTitle} />
      </TestWrapper>
    );

    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
    expect(screen.queryByText(testTitle)).not.toBeInTheDocument();
  });

  it('should handle different titles', () => {
    const repoTitle = 'リポジトリ「my-repo」の月別推移 (2024年)';
    
    const { rerender } = render(
      <TestWrapper>
        <DetailChart data={mockData} title={testTitle} />
      </TestWrapper>
    );

    expect(screen.getByText(testTitle)).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <DetailChart data={mockData} title={repoTitle} />
      </TestWrapper>
    );

    expect(screen.getByText(repoTitle)).toBeInTheDocument();
    expect(screen.queryByText(testTitle)).not.toBeInTheDocument();
  });

  it('should render with single data point', () => {
    const singleData: MonthlyData[] = [
      {
        month: '2024年12月',
        cost: 99.99,
        dataCount: 5,
      },
    ];

    render(
      <TestWrapper>
        <DetailChart data={singleData} title={testTitle} />
      </TestWrapper>
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('should handle data with zero costs', () => {
    const zeroData: MonthlyData[] = [
      {
        month: '2024年1月',
        cost: 0,
        dataCount: 0,
      },
      {
        month: '2024年2月',
        cost: 50.25,
        dataCount: 10,
      },
    ];

    render(
      <TestWrapper>
        <DetailChart data={zeroData} title={testTitle} />
      </TestWrapper>
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should apply proper accessibility structure', () => {
    const { container } = render(
      <TestWrapper>
        <DetailChart data={mockData} title={testTitle} />
      </TestWrapper>
    );

    // タイトルがh6として適切にレンダリングされているかテスト
    const titleElement = screen.getByRole('heading');
    expect(titleElement).toHaveTextContent(testTitle);

    // チャートコンテナが存在することをテスト
    const chartContainer = container.querySelector('[data-testid="responsive-container"]');
    expect(chartContainer).toBeInTheDocument();

    // ARIA属性のテスト
    const chartBox = container.querySelector('[role="img"]');
    expect(chartBox).not.toBeNull();
    expect(chartBox?.getAttribute('aria-labelledby')).toBe('chart-title');
    expect(chartBox?.getAttribute('aria-describedby')).toBe('chart-description');
  });
});
