export interface UserData {
  user_name: string;
  repository_name: string;
  time?: number; // Actions, Codespaces用
  capacity?: number; // Storage用
  cost: number;
}

export interface AggregatedData {
  name: string; // ユーザー名またはリポジトリ名
  cost: number;
  percentage: number;
}

export type Category = 'actions' | 'codespaces' | 'storage';

export type Period = 'weekly' | 'monthly' | 'quarterly';

export type ViewMode = 'overview' | 'user-detail' | 'repository-detail';

export type DisplayUnit = 'user' | 'repository';

export interface FreeQuota {
  category: Category;
  limit: number;
  unit: string;
  fieldName: string;
}

export interface CategoryConfig {
  name: string;
  label: string;
  fieldName: string;
  unit: string;
  freeQuota?: FreeQuota;
}
