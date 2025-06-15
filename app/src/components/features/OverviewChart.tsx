import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { CHART_COLORS } from '../../constants';
import type { AggregatedData } from '../../types';

interface OverviewChartProps {
  data: AggregatedData[];
  displayUnit: 'user' | 'repository';
  category?: string; // カテゴリ情報を追加
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  displayUnit: 'user' | 'repository';
  category?: string; // カテゴリ情報を追加
}

function CustomTooltip({ active, payload, label, displayUnit, category }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as AggregatedData;
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
          boxShadow: 2,
          minWidth: 200,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {displayUnit === 'user' ? 'ユーザー' : 'リポジトリ'}: {label}
        </Typography>
        <Typography variant="body2" color="primary" gutterBottom>
          コスト: ${data.cost.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          占有率: {data.percentage.toFixed(1)}%
        </Typography>
        {data.usage !== undefined && data.usageUnit && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            使用量: {data.usage.toLocaleString()}
            {data.usageUnit}
          </Typography>
        )}
        {data.usage !== undefined && data.usageUnit && (
          <Typography variant="caption" color="info.main" gutterBottom sx={{ fontStyle: 'italic' }}>
            コスト算出: {data.usage.toLocaleString()}
            {data.usageUnit} → ${data.cost.toFixed(2)}
          </Typography>
        )}
        {data.freeQuotaUsage !== undefined && (
          <Typography variant="body2" color={data.freeQuotaUsage > 90 ? 'warning.main' : 'info.main'} gutterBottom>
            無料枠使用率: {data.freeQuotaUsage.toFixed(1)}%
          </Typography>
        )}
        {category && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            カテゴリ: {category}
          </Typography>
        )}
      </Box>
    );
  }
  return null;
}

function OverviewChart({ data, displayUnit, category }: OverviewChartProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="body2" color="text.secondary">
          表示するデータがありません
        </Typography>
      </Box>
    );
  }

  const chartHeight = Math.max(400, data.length * 25 + 100);
  const yAxisWidth = 150; // 固定幅に変更
  const fontSize = '12px'; // 固定サイズに変更
  const labelFontSize = '11px'; // 固定サイズに変更

  return (
    <Box
      sx={{ width: '100%', height: chartHeight }}
      role="img"
      aria-label={`${displayUnit === 'user' ? 'ユーザー' : 'リポジトリ'}別のコスト分析グラフ。${data.length}件のデータを表示しています。`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis type="number" tickFormatter={value => `$${value.toFixed(0)}`} style={{ fontSize }} />
          <YAxis type="category" dataKey="name" width={yAxisWidth} style={{ fontSize }} interval={0} />
          <Tooltip content={<CustomTooltip displayUnit={displayUnit} category={category} />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="cost"
            fill={CHART_COLORS.primary}
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              formatter: (value: number, entry: AggregatedData) => `$${value.toFixed(2)} ${entry ? `(${entry.percentage.toFixed(1)}%)` : ''}`,
              style: {
                fontSize: labelFontSize,
                fill: theme.palette.text.secondary,
              },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export { OverviewChart };
