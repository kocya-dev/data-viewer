import type { CategoryConfig } from '../types';

export const CATEGORIES: CategoryConfig[] = [
  {
    name: 'actions',
    label: 'GitHub Actions',
    fieldName: 'time',
    unit: '分',
    freeQuota: {
      category: 'actions',
      limit: 50000,
      unit: '分',
      fieldName: 'time',
    },
  },
  {
    name: 'codespaces',
    label: 'Codespaces',
    fieldName: 'time',
    unit: '分',
  },
  {
    name: 'storage',
    label: 'Storage',
    fieldName: 'capacity',
    unit: 'MB',
    freeQuota: {
      category: 'storage',
      limit: 51200, // 50GB = 51,200MB
      unit: 'MB',
      fieldName: 'capacity',
    },
  },
];

export const VIEW_MODES = [
  { value: 'overview', label: '全体概要' },
  { value: 'user-detail', label: 'ユーザー詳細' },
  { value: 'repository-detail', label: 'リポジトリ詳細' },
] as const;

export const PERIODS = [{ value: 'monthly', label: '月単位' }] as const;

export const DISPLAY_UNITS = [
  { value: 'user', label: 'ユーザー単位' },
  { value: 'repository', label: 'リポジトリ単位' },
] as const;

export const MAX_DISPLAY_ITEMS = 100;

export const CHART_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  warning: '#ed6c02',
  success: '#2e7d32',
  info: '#0288d1',
} as const;
