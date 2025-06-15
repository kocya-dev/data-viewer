import { Card, CardContent, Typography, Box, Stack, Chip, LinearProgress, Alert } from '@mui/material';
import { AttachMoney, Warning, CheckCircle } from '@mui/icons-material';
import type { CategoryConfig } from '../../types';

interface DataSummaryProps {
  totalCost: number;
  dataCount: number;
  freeQuotaUsage: number | null;
  categoryConfig: CategoryConfig | undefined;
}

export function DataSummary({ totalCost, dataCount, freeQuotaUsage, categoryConfig }: DataSummaryProps) {
  // 無料枠使用率に基づく警告レベルの判定
  const getQuotaWarningLevel = (usage: number | null) => {
    if (usage === null) return null;
    if (usage >= 100) return 'error';
    if (usage >= 90) return 'warning';
    return 'success';
  };

  const warningLevel = getQuotaWarningLevel(freeQuotaUsage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatUsageValue = (config: CategoryConfig, usage: number) => {
    if (!config.freeQuota) return '';

    const totalUsage = (usage / 100) * config.freeQuota.limit;
    return `${totalUsage.toLocaleString()} ${config.freeQuota.unit}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney />
          サマリー情報
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} divider={<Box sx={{ borderLeft: 1, borderColor: 'divider', height: '100%' }} />}>
          {/* コスト情報 */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              総コスト
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {formatCurrency(totalCost)}
            </Typography>
            <Chip size="small" label={`${dataCount}件のデータ`} variant="outlined" />
          </Box>

          {/* 無料枠使用率 */}
          {freeQuotaUsage !== null && categoryConfig && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                無料枠使用率
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: warningLevel === 'error' ? 'error.main' : warningLevel === 'warning' ? 'warning.main' : 'success.main',
                  }}
                >
                  {freeQuotaUsage.toFixed(1)}%
                </Typography>
                {warningLevel === 'error' && <Warning color="error" />}
                {warningLevel === 'warning' && <Warning color="warning" />}
                {warningLevel === 'success' && <CheckCircle color="success" />}
              </Box>

              <LinearProgress
                variant="determinate"
                value={Math.min(freeQuotaUsage, 100)}
                color={warningLevel === 'error' ? 'error' : warningLevel === 'warning' ? 'warning' : 'success'}
                sx={{ mb: 1 }}
              />

              <Typography variant="body2" color="text.secondary">
                使用量: {formatUsageValue(categoryConfig, freeQuotaUsage)} / {categoryConfig.freeQuota?.limit.toLocaleString()} {categoryConfig.freeQuota?.unit}
              </Typography>

              {/* 無料枠超過の警告 */}
              {warningLevel === 'error' && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  無料枠を超過しています
                </Alert>
              )}
              {warningLevel === 'warning' && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  無料枠の90%に達しています
                </Alert>
              )}
            </Box>
          )}

          {/* 無料枠がないカテゴリの場合 */}
          {freeQuotaUsage === null && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                課金モード
              </Typography>
              <Typography variant="h6" color="info.main">
                従量課金
              </Typography>
              <Typography variant="body2" color="text.secondary">
                このカテゴリは無料枠がありません
              </Typography>
            </Box>
          )}
        </Stack>

        {/* カテゴリ情報 */}
        {categoryConfig && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              カテゴリ: {categoryConfig.label} ({categoryConfig.unit}単位)
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
