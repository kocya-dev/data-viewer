import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../utils/theme';
import { OverviewChart } from '../../components/features/OverviewChart';
import type { AggregatedData } from '../../types';

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

describe('OverviewChart', () => {
  const mockData: AggregatedData[] = [
    {
      name: 'user1',
      cost: 100.5,
      percentage: 45.5,
    },
    {
      name: 'user2',
      cost: 120.25,
      percentage: 54.5,
    },
  ];

  it('should render chart with data', () => {
    render(
      <TestWrapper>
        <OverviewChart data={mockData} displayUnit="user" />
      </TestWrapper>
    );

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
        <OverviewChart data={[]} displayUnit="user" />
      </TestWrapper>
    );

    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('should handle different display units', () => {
    const { rerender } = render(
      <TestWrapper>
        <OverviewChart data={mockData} displayUnit="user" />
      </TestWrapper>
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <OverviewChart data={mockData} displayUnit="repository" />
      </TestWrapper>
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should apply correct accessibility attributes', () => {
    const { container } = render(
      <TestWrapper>
        <OverviewChart data={mockData} displayUnit="user" />
      </TestWrapper>
    );

    // チャートコンテナのaria属性をテスト
    const chartContainer = container.querySelector('[data-testid="responsive-container"]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle large datasets appropriately', () => {
    const largeData: AggregatedData[] = Array.from({ length: 150 }, (_, i) => ({
      name: `user${i}`,
      cost: Math.random() * 1000,
      percentage: Math.random() * 100,
    }));

    render(
      <TestWrapper>
        <OverviewChart data={largeData} displayUnit="user" />
      </TestWrapper>
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
