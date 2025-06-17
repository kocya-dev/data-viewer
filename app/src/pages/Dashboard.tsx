import { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Alert, Stack } from '@mui/material';
import { CategoryTabs } from '../components/features/CategoryTabs';
import { ViewModeTabs } from '../components/features/ViewModeTabs';
import { DataFilters } from '../components/features/DataFilters';
import { DataSummary } from '../components/features/DataSummary';
import { OverviewChart } from '../components/features/OverviewChart';
import { DetailChart } from '../components/features/DetailChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  useAppState,
  useCsvData,
  useIntegratedDataManagement,
  useSelectionOptions,
  useYearlySelectionOptions,
  useDateFormatter,
  useMonthlyTrendData,
} from '../hooks/useDataManagement';
import { DataAggregator } from '../utils/dataProcessor';
import { configService } from '../services/configService';

function Dashboard() {
  const {
    category,
    viewMode,
    displayUnit,
    selectedDate,
    selectedUser,
    selectedRepository,
    setCategory,
    setViewMode,
    setDisplayUnit,
    setSelectedDate,
    setSelectedUser,
    setSelectedRepository,
  } = useAppState();

  // 年間データ用の年選択状態
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // 単一日付データ用（全体概要モード）
  const { data, loading, error, loadData, clearData } = useCsvData();

  // 年間データ用（詳細モード）
  const { yearlyData, loading: yearlyLoading, error: yearlyError, loadYearlyData, clearData: clearYearlyData } = useIntegratedDataManagement();

  // 選択肢の管理（モードに応じて切り替え）
  const { users: overviewUsers, repositories: overviewRepositories } = useSelectionOptions(data);
  const { users: yearlyUsers, repositories: yearlyRepositories } = useYearlySelectionOptions(yearlyData);

  const users = viewMode === 'overview' ? overviewUsers : yearlyUsers;
  const repositories = viewMode === 'overview' ? overviewRepositories : yearlyRepositories;
  const { formatDateForFile } = useDateFormatter();

  // 月別推移データ
  const monthlyTrendData = useMonthlyTrendData(yearlyData, selectedUser, selectedRepository, viewMode, category);

  // 全体概要モード用のデータ読み込み
  useEffect(() => {
    if (viewMode === 'overview' && selectedDate) {
      const dateString = formatDateForFile(selectedDate);
      if (dateString) {
        loadData(category, dateString);
      }
    } else if (viewMode === 'overview') {
      clearData();
    }
  }, [viewMode, category, selectedDate, loadData, clearData, formatDateForFile]);

  // 詳細モード用の年間データ読み込み
  useEffect(() => {
    if (viewMode !== 'overview') {
      loadYearlyData(category, selectedYear);
    } else {
      clearYearlyData();
    }
  }, [viewMode, category, selectedYear, loadYearlyData, clearYearlyData]);

  // カテゴリ設定を取得
  const categoryConfig = useMemo(() => configService.getCategoryConfig(category), [category]);

  // 現在のローディング状態とエラー状態
  const currentLoading = viewMode === 'overview' ? loading : yearlyLoading;
  const currentError = viewMode === 'overview' ? error : yearlyError;

  // 全体概要モード用のデータ集計（使用量情報付き）- メモ化
  const aggregatedData = useMemo(() => {
    return viewMode === 'overview' && data.length > 0 && categoryConfig ? DataAggregator.aggregateByUnitWithUsage(data, displayUnit, categoryConfig) : [];
  }, [viewMode, data, displayUnit, categoryConfig]);

  // 全体概要モード用のサマリー - メモ化
  const totalCost = useMemo(() => {
    return viewMode === 'overview' ? DataAggregator.calculateTotalCost(data) : 0;
  }, [viewMode, data]);

  const freeQuotaUsage = useMemo(() => {
    return viewMode === 'overview' && categoryConfig ? DataAggregator.calculateFreeQuotaUsage(data, categoryConfig) : null;
  }, [viewMode, data, categoryConfig]);

  // 詳細モード用のデータ存在チェック
  const hasDetailData = viewMode !== 'overview' && yearlyData.size > 0;

  // 詳細モード用のタイトル生成
  const getDetailTitle = () => {
    if (viewMode === 'user-detail' && selectedUser) {
      return `ユーザー「${selectedUser}」の月別推移 (${selectedYear}年)`;
    } else if (viewMode === 'repository-detail' && selectedRepository) {
      return `リポジトリ「${selectedRepository}」の月別推移 (${selectedYear}年)`;
    }
    return '月別推移';
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        課金データ可視化ダッシュボード
      </Typography>

      <CategoryTabs selectedCategory={category} onCategoryChange={setCategory} />

      <ViewModeTabs selectedMode={viewMode} onModeChange={setViewMode} />

      <Stack spacing={3}>
        <DataFilters
          viewMode={viewMode}
          displayUnit={displayUnit}
          selectedDate={selectedDate}
          selectedUser={selectedUser}
          selectedRepository={selectedRepository}
          selectedYear={selectedYear}
          users={users}
          repositories={repositories}
          onDisplayUnitChange={setDisplayUnit}
          onDateChange={setSelectedDate}
          onYearChange={setSelectedYear}
          onUserChange={setSelectedUser}
          onRepositoryChange={setSelectedRepository}
        />

        {currentError && <Alert severity="error">{currentError}</Alert>}

        {currentLoading && <LoadingSpinner message="データを読み込み中..." />}

        {/* 全体概要モード */}
        {viewMode === 'overview' && !loading && !error && data.length > 0 && (
          <>
            <DataSummary totalCost={totalCost} dataCount={data.length} freeQuotaUsage={freeQuotaUsage} categoryConfig={categoryConfig} />

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  全体概要
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {displayUnit === 'user' ? 'ユーザー' : 'リポジトリ'}
                  単位の集計データ: {aggregatedData.length}件
                </Typography>

                <OverviewChart data={aggregatedData} displayUnit={displayUnit} category={categoryConfig?.label || category} />
              </CardContent>
            </Card>
          </>
        )}

        {/* 詳細モード */}
        {viewMode !== 'overview' && !yearlyLoading && !yearlyError && hasDetailData && (
          <Card>
            <CardContent>
              <DetailChart data={monthlyTrendData} title={getDetailTitle()} category={categoryConfig?.label || category} />
            </CardContent>
          </Card>
        )}

        {/* データなしの場合の表示 */}
        {!currentLoading && !currentError && (
          <>
            {viewMode === 'overview' && data.length === 0 && selectedDate && (
              <Alert severity="info">指定された条件のデータが見つかりませんでした。 日付やカテゴリを変更してお試しください。</Alert>
            )}

            {viewMode !== 'overview' && !hasDetailData && (
              <Alert severity="info">指定された年のデータが見つかりませんでした。 年やカテゴリを変更してお試しください。</Alert>
            )}

            {viewMode === 'user-detail' && hasDetailData && !selectedUser && <Alert severity="info">ユーザーを選択してください。</Alert>}

            {viewMode === 'repository-detail' && hasDetailData && !selectedRepository && <Alert severity="info">リポジトリを選択してください。</Alert>}
          </>
        )}
      </Stack>
    </Box>
  );
}

export { Dashboard };
