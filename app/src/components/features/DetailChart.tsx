import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { CHART_COLORS } from '../../constants';

interface MonthlyData {
  month: string;
  cost: number;
  dataCount: number;
  usage?: number; // 使用量（時間・容量）
  usageUnit?: string; // 使用量単位
  freeQuotaUsage?: number; // 無料枠使用率（%）
}

interface DetailChartProps {
  data: MonthlyData[];
  title: string;
  category?: string; // カテゴリ情報を追加
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  category?: string; // カテゴリ情報を追加
}

function CustomTooltip({ active, payload, label, category }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MonthlyData;
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
          {label}
        </Typography>
        <Typography variant="body2" color="primary" gutterBottom>
          コスト: ${data.cost.toFixed(2)}
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
        <Typography variant="body2" color="text.secondary">
          データ件数: {data.dataCount}件
        </Typography>
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

function DetailChart({ data, title, category }: DetailChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="body2" color="text.secondary">
          表示するデータがありません
        </Typography>
      </Box>
    );
  }

  const fontSize = isSmall ? '10px' : isMobile ? '11px' : '12px';
  const labelFontSize = isSmall ? '9px' : isMobile ? '10px' : '11px';
  const xAxisHeight = isSmall ? 100 : isMobile ? 90 : 80;
  const chartMargin = {
    top: 20,
    right: isSmall ? 10 : isMobile ? 20 : 30,
    left: isSmall ? 10 : 20,
    bottom: 20,
  };

  return (
    <Box sx={{ width: '100%', height: 400 }} role="img" aria-labelledby="chart-title" aria-describedby="chart-description">
      <Typography id="chart-title" variant="h6" gutterBottom role="heading" aria-level={3}>
        {title}
      </Typography>
      <Typography id="chart-description" variant="body2" color="text.secondary" sx={{ mb: 2, sr: { position: 'absolute', left: '-10000px' } }}>
        月別コスト推移を表示する棒グラフ。{data.length}
        ヶ月分のデータが含まれています。
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="month" style={{ fontSize }} angle={isSmall ? -60 : -45} textAnchor="end" height={xAxisHeight} />
          <YAxis tickFormatter={value => `$${value.toFixed(0)}`} style={{ fontSize }} />
          <Tooltip content={<CustomTooltip category={category} />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="cost"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
            label={{
              position: 'top',
              formatter: (value: number) => `$${value.toFixed(2)}`,
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

export { DetailChart };
export type { MonthlyData };
