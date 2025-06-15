import type { CategoryConfig, Category } from '../types';
import { CATEGORIES } from '../constants';

/**
 * アプリケーション設定管理サービス
 * カテゴリ設定、無料枠設定などを動的に管理する
 */
export class ConfigService {
  private static instance: ConfigService;
  private categoryConfigs: Map<string, CategoryConfig>;

  private constructor() {
    this.categoryConfigs = new Map();
    this.initializeCategories();
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * 初期カテゴリ設定を読み込み
   */
  private initializeCategories(): void {
    for (const category of CATEGORIES) {
      this.categoryConfigs.set(category.name, category);
    }
  }

  /**
   * 指定されたカテゴリの設定を取得
   * @param categoryName カテゴリ名
   * @returns カテゴリ設定、存在しない場合はundefined
   */
  getCategoryConfig(categoryName: string): CategoryConfig | undefined {
    return this.categoryConfigs.get(categoryName);
  }

  /**
   * 全てのカテゴリ設定を取得
   * @returns カテゴリ設定の配列
   */
  getAllCategoryConfigs(): CategoryConfig[] {
    return Array.from(this.categoryConfigs.values());
  }

  /**
   * カテゴリ設定を更新または追加
   * @param config 新しいカテゴリ設定
   */
  updateCategoryConfig(config: CategoryConfig): void {
    this.categoryConfigs.set(config.name, config);
  }

  /**
   * カテゴリが無料枠を持つかどうかを判定
   * @param categoryName カテゴリ名
   * @returns 無料枠を持つ場合はtrue
   */
  hasFreeQuota(categoryName: string): boolean {
    const config = this.getCategoryConfig(categoryName);
    return config?.freeQuota !== undefined;
  }

  /**
   * 有効なカテゴリ名のリストを取得
   * @returns カテゴリ名の配列
   */
  getValidCategories(): Category[] {
    return Array.from(this.categoryConfigs.keys()) as Category[];
  }

  /**
   * カテゴリ設定の妥当性をチェック
   * @param config 検証対象の設定
   * @returns 検証結果
   */
  validateCategoryConfig(config: CategoryConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.name || config.name.trim() === '') {
      errors.push('カテゴリ名が空です');
    }

    if (!config.label || config.label.trim() === '') {
      errors.push('カテゴリラベルが空です');
    }

    if (!config.fieldName || config.fieldName.trim() === '') {
      errors.push('フィールド名が空です');
    }

    if (!config.unit || config.unit.trim() === '') {
      errors.push('単位が空です');
    }

    // 無料枠設定の検証
    if (config.freeQuota) {
      if (config.freeQuota.limit < 0) {
        errors.push('無料枠の上限は0以上である必要があります');
      }

      if (config.freeQuota.category !== config.name) {
        errors.push('無料枠のカテゴリ名が一致しません');
      }

      if (config.freeQuota.fieldName !== config.fieldName) {
        errors.push('無料枠のフィールド名が一致しません');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * カテゴリ設定管理用のユーティリティ関数
 */
export const categoryUtils = {
  /**
   * カテゴリ名からラベルを取得
   * @param categoryName カテゴリ名
   * @returns カテゴリラベル
   */
  getCategoryLabel: (categoryName: string): string => {
    const config = ConfigService.getInstance().getCategoryConfig(categoryName);
    return config?.label || categoryName;
  },

  /**
   * カテゴリ名から単位を取得
   * @param categoryName カテゴリ名
   * @returns 単位文字列
   */
  getCategoryUnit: (categoryName: string): string => {
    const config = ConfigService.getInstance().getCategoryConfig(categoryName);
    return config?.unit || '';
  },

  /**
   * カテゴリ名からフィールド名を取得
   * @param categoryName カテゴリ名
   * @returns フィールド名
   */
  getCategoryFieldName: (categoryName: string): string => {
    const config = ConfigService.getInstance().getCategoryConfig(categoryName);
    return config?.fieldName || '';
  },

  /**
   * カテゴリの無料枠情報を取得
   * @param categoryName カテゴリ名
   * @returns 無料枠情報、存在しない場合はnull
   */
  getFreeQuotaInfo: (categoryName: string) => {
    const config = ConfigService.getInstance().getCategoryConfig(categoryName);
    return config?.freeQuota || null;
  },
};

// シングルトンインスタンスのエクスポート
export const configService = ConfigService.getInstance();
