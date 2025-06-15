import { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { CategoryTabs } from '../components/features/CategoryTabs';
import { ViewModeTabs } from '../components/features/ViewModeTabs';
import { DataFilters } from '../components/features/DataFilters';
import { DataSummary } from '../components/features/DataSummary';
import {
  useAppState,
  useCsvData,
  useSelectionOptions,
  useDateFormatter,
} from '../hooks/useDataManagement';
import { DataAggregator } from '../utils/dataProcessor';
import { configService } from '../services/configService';

function Dashboard() {
  const {
    category,
    viewMode,
    period,
    displayUnit,
    selectedDate,
    selectedUser,
    selectedRepository,
    setCategory,
    setViewMode,
    setPeriod,
    setDisplayUnit,
    setSelectedDate,
    setSelectedUser,
    setSelectedRepository,
  } = useAppState();

  const { data, loading, error, loadData, clearData } = useCsvData();
  const { users, repositories } = useSelectionOptions(data);
  const { formatDateForFile } = useDateFormatter();

  // カテゴリまたは期間、日付が変更された時にデータを再読み込み
  useEffect(() => {
    if (selectedDate) {
      const dateString = formatDateForFile(selectedDate, period);
      if (dateString) {
        loadData(category, period, dateString);
      }
    } else {
      clearData();
    }
  }, [category, period, selectedDate, loadData, clearData, formatDateForFile]);

  // カテゴリ設定を取得
  const categoryConfig = configService.getCategoryConfig(category);

  // データを集計（表示モードに応じて）
  const aggregatedData =
    data.length > 0 ? DataAggregator.aggregateByUnit(data, displayUnit) : [];
  const totalCost = DataAggregator.calculateTotalCost(data);
  const freeQuotaUsage = categoryConfig
    ? DataAggregator.calculateFreeQuotaUsage(data, categoryConfig)
    : null;

  // 詳細モード用のフィルタリングされたデータ
  const filteredData = (() => {
    if (viewMode === 'user-detail' && selectedUser) {
      return DataAggregator.filterByName(data, selectedUser, 'user');
    } else if (viewMode === 'repository-detail' && selectedRepository) {
      return DataAggregator.filterByName(
        data,
        selectedRepository,
        'repository'
      );
    }
    return data;
  })();

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        課金データ可視化ダッシュボード
      </Typography>

      <CategoryTabs
        selectedCategory={category}
        onCategoryChange={setCategory}
      />

      <ViewModeTabs selectedMode={viewMode} onModeChange={setViewMode} />

      <Stack spacing={3}>
        <DataFilters
          viewMode={viewMode}
          period={period}
          displayUnit={displayUnit}
          selectedDate={selectedDate}
          selectedUser={selectedUser}
          selectedRepository={selectedRepository}
          users={users}
          repositories={repositories}
          onPeriodChange={setPeriod}
          onDisplayUnitChange={setDisplayUnit}
          onDateChange={setSelectedDate}
          onUserChange={setSelectedUser}
          onRepositoryChange={setSelectedRepository}
        />

        {error && <Alert severity="error">{error}</Alert>}

        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              データを読み込み中...
            </Typography>
          </Box>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            <DataSummary
              totalCost={totalCost}
              dataCount={data.length}
              freeQuotaUsage={freeQuotaUsage}
              categoryConfig={categoryConfig}
            />

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {viewMode === 'overview' && '全体概要'}
                  {viewMode === 'user-detail' && 'ユーザー詳細'}
                  {viewMode === 'repository-detail' && 'リポジトリ詳細'}
                </Typography>

                {viewMode === 'overview' && (
                  <Typography color="text.secondary">
                    {displayUnit === 'user' ? 'ユーザー' : 'リポジトリ'}
                    単位の集計データ: {aggregatedData.length}件
                    <br />
                    上位の課金データが表示されます。
                  </Typography>
                )}

                {viewMode === 'user-detail' && selectedUser && (
                  <Typography color="text.secondary">
                    ユーザー「{selectedUser}」の詳細データ:{' '}
                    {filteredData.length}件
                  </Typography>
                )}

                {viewMode === 'repository-detail' && selectedRepository && (
                  <Typography color="text.secondary">
                    リポジトリ「{selectedRepository}」の詳細データ:{' '}
                    {filteredData.length}件
                  </Typography>
                )}

                {/* Phase 3でグラフコンポーネントを実装予定 */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Phase 3でRechartsを使用したグラフ表示機能を実装予定です。
                </Typography>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && !error && data.length === 0 && selectedDate && (
          <Alert severity="info">
            指定された条件のデータが見つかりませんでした。
            日付やカテゴリを変更してお試しください。
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

export { Dashboard };
