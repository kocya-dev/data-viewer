import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { CHART_COLORS } from '../../constants';
import type { AggregatedData } from '../../types';

interface OverviewChartProps {
  data: AggregatedData[];
  displayUnit: 'user' | 'repository';
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  displayUnit: 'user' | 'repository';
}

function CustomTooltip({ active, payload, label, displayUnit }: CustomTooltipProps) {
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
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {displayUnit === 'user' ? 'ユーザー' : 'リポジトリ'}: {label}
        </Typography>
        <Typography variant="body2" color="primary">
          コスト: ${data.cost.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          占有率: {data.percentage.toFixed(1)}%
        </Typography>
      </Box>
    );
  }
  return null;
}

function OverviewChart({ data, displayUnit }: OverviewChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  if (data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
        bgcolor="grey.50"
        borderRadius={1}
      >
        <Typography variant="body2" color="text.secondary">
          表示するデータがありません
        </Typography>
      </Box>
    );
  }

  const chartHeight = Math.max(400, data.length * (isMobile ? 30 : 25) + 100);
  const yAxisWidth = isSmall ? 120 : isMobile ? 130 : 150;
  const fontSize = isSmall ? '10px' : isMobile ? '11px' : '12px';
  const labelFontSize = isSmall ? '9px' : isMobile ? '10px' : '11px';

  return (
    <Box 
      sx={{ width: '100%', height: chartHeight }}
      role="img"
      aria-label={`${displayUnit === 'user' ? 'ユーザー' : 'リポジトリ'}別のコスト分析グラフ。${data.length}件のデータを表示しています。`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="horizontal"
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            type="number"
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            style={{ fontSize }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={yAxisWidth}
            style={{ fontSize }}
            interval={0}
          />
          <Tooltip
            content={<CustomTooltip displayUnit={displayUnit} />}
            cursor={{ fill: theme.palette.action.hover }}
          />
          <Bar
            dataKey="cost"
            fill={CHART_COLORS.primary}
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              formatter: (value: number, entry: AggregatedData) =>
                `$${value.toFixed(2)} (${entry.percentage.toFixed(1)}%)`,
              style: { fontSize: labelFontSize, fill: theme.palette.text.secondary },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export { OverviewChart };
