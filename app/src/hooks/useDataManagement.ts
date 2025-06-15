import { useState, useEffect, useCallback } from 'react';
import type {
  UserData,
  Category,
  Period,
  ViewMode,
  DisplayUnit,
} from '../types';
import { csvService } from '../services/csvService';
import { DataValidator, DataAggregator } from '../utils/dataProcessor';

/**
 * CSVデータ読み込み用カスタムフック
 * 指定されたカテゴリ・期間・日付のCSVデータを読み込み、状態管理する
 */
export const useCsvData = () => {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (category: Category, period: Period, date: string) => {
      setLoading(true);
      setError(null);

      try {
        const rawData = await csvService.loadCsvData(category, period, date);
        const validData = DataValidator.filterValidData(rawData);

        setData(validData);

        if (validData.length !== rawData.length) {
          console.warn(
            `${rawData.length - validData.length} 件の無効なデータが除外されました`
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'データの読み込みに失敗しました';
        setError(errorMessage);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearData = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    loadData,
    clearData,
  };
};

/**
 * アプリケーション全体の状態管理用カスタムフック
 * カテゴリ、表示モード、フィルタ条件などの状態を管理
 */
export const useAppState = () => {
  const [category, setCategory] = useState<Category>('actions');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [period, setPeriod] = useState<Period>('monthly');
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('user');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRepository, setSelectedRepository] = useState<string>('');

  // 表示モードが変更された時に関連する状態をリセット
  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode);

    // 詳細モードから全体概要に戻った時は選択をクリア
    if (newViewMode === 'overview') {
      setSelectedUser('');
      setSelectedRepository('');
    }
  }, []);

  // カテゴリが変更された時に関連する状態をリセット
  const handleCategoryChange = useCallback((newCategory: Category) => {
    setCategory(newCategory);
    // カテゴリが変更されたら選択をクリア
    setSelectedUser('');
    setSelectedRepository('');
  }, []);

  return {
    // 状態
    category,
    viewMode,
    period,
    displayUnit,
    selectedDate,
    selectedUser,
    selectedRepository,

    // 状態更新関数
    setCategory: handleCategoryChange,
    setViewMode: handleViewModeChange,
    setPeriod,
    setDisplayUnit,
    setSelectedDate,
    setSelectedUser,
    setSelectedRepository,
  };
};

/**
 * ユーザー・リポジトリ選択肢管理用カスタムフック
 * データから動的に選択肢を生成・管理
 */
export const useSelectionOptions = (data: UserData[]) => {
  const [users, setUsers] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);

  useEffect(() => {
    if (data.length === 0) {
      setUsers([]);
      setRepositories([]);
      return;
    }

    // 一意のユーザー・リポジトリ名を抽出
    const uniqueUsers = Array.from(
      new Set(data.map(item => item.user_name))
    ).sort();
    const uniqueRepositories = Array.from(
      new Set(data.map(item => item.repository_name))
    ).sort();

    setUsers(uniqueUsers);
    setRepositories(uniqueRepositories);
  }, [data]);

  return {
    users,
    repositories,
  };
};

/**
 * 日付フォーマット用ユーティリティフック
 * 期間に応じて適切な日付文字列を生成
 */
export const useDateFormatter = () => {
  const formatDateForFile = useCallback(
    (date: Date | null, period: Period): string => {
      if (!date) {
        return '';
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      switch (period) {
        case 'weekly':
          // 週単位の場合は指定日付をそのまま使用（YYYYMMDD形式）
          return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

        case 'monthly':
        case 'quarterly':
          // 月単位・四半期単位の場合は月初日を使用（YYYYMM01形式）
          return `${year}${month.toString().padStart(2, '0')}01`;

        default:
          return '';
      }
    },
    []
  );

  const formatDateForDisplay = useCallback(
    (date: Date | null, period: Period): string => {
      if (!date) {
        return '';
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      switch (period) {
        case 'weekly':
          return date.toLocaleDateString('ja-JP');

        case 'monthly':
          return `${year}年${month}月`;

        case 'quarterly':
          const quarter = Math.ceil(month / 3);
          return `${year}年Q${quarter}`;

        default:
          return '';
      }
    },
    []
  );

  return {
    formatDateForFile,
    formatDateForDisplay,
  };
};

/**
 * 統合データ管理用カスタムフック
 * 年間データの読み込み、月別推移、全体サマリーなどを管理
 */
export const useIntegratedDataManagement = () => {
  const [yearlyData, setYearlyData] = useState<Map<string, UserData[]>>(
    new Map()
  );
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 指定年の年間データを読み込み
   */
  const loadYearlyData = useCallback(
    async (category: Category, year: number) => {
      setLoading(true);
      setError(null);

      try {
        const data = await csvService.loadYearlyData(category, year);
        setYearlyData(data);

        // 実際にデータが存在する月のリストを生成
        const months = Array.from(data.keys())
          .filter(month => data.get(month)!.length > 0)
          .sort();
        setAvailableMonths(months);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '年間データの読み込みに失敗しました';
        setError(errorMessage);
        setYearlyData(new Map());
        setAvailableMonths([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 利用可能なファイルをチェック
   */
  const checkAvailableFiles = useCallback(
    async (category: Category, period: Period) => {
      try {
        const files = await csvService.checkAvailableFiles(category, period);
        return files;
      } catch (err) {
        console.warn('ファイルチェックに失敗:', err);
        return [];
      }
    },
    []
  );

  /**
   * データをクリア
   */
  const clearData = useCallback(() => {
    setYearlyData(new Map());
    setAvailableMonths([]);
    setError(null);
  }, []);

  return {
    yearlyData,
    availableMonths,
    loading,
    error,
    loadYearlyData,
    checkAvailableFiles,
    clearData,
  };
};

/**
 * データサマリー生成用カスタムフック
 * 読み込まれたデータから表示用サマリーを生成
 */
export const useDataSummary = (data: UserData[], categoryConfig?: any) => {
  const [summary, setSummary] = useState({
    totalCost: 0,
    itemCount: 0,
    freeQuotaUsage: null as number | null,
  });

  useEffect(() => {
    if (data.length === 0) {
      setSummary({
        totalCost: 0,
        itemCount: 0,
        freeQuotaUsage: null,
      });
      return;
    }

    const totalCost = DataAggregator.calculateTotalCost(data);
    const freeQuotaUsage = categoryConfig
      ? DataAggregator.calculateFreeQuotaUsage(data, categoryConfig)
      : null;

    setSummary({
      totalCost,
      itemCount: data.length,
      freeQuotaUsage,
    });
  }, [data, categoryConfig]);

  return summary;
};
