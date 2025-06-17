import type { UserData, AggregatedData, DisplayUnit, CategoryConfig } from '../types';

/**
 * データ集計ユーティリティ
 * UserDataの配列を様々な方法で集計・加工する機能を提供
 *
 * 仕様変更 (2025-06-17): 四半期集計機能を削除、月単位処理のみに簡素化
 * - MultiMonthAggregator.aggregateToQuarterly メソッド削除済み
 * - 月次データのみを対象とした集計処理に変更
 */
export class DataAggregator {
  /**
   * ユーザー単位またはリポジトリ単位でデータを集計（使用量・無料枠含む）
   * @param data UserDataの配列
   * @param unit 集計単位（user または repository）
   * @param categoryConfig カテゴリ設定
   * @returns 集計されたデータの配列（降順ソート済み、使用量・無料枠情報含む）
   */
  static aggregateByUnitWithUsage(data: UserData[], unit: DisplayUnit, categoryConfig: CategoryConfig): AggregatedData[] {
    const groupKey = unit === 'user' ? 'user_name' : 'repository_name';
    const aggregationMap = new Map<string, { cost: number; usage: number }>();

    // データを集計
    for (const item of data) {
      const key = item[groupKey];
      const current = aggregationMap.get(key) || { cost: 0, usage: 0 };

      // 使用量を集計（カテゴリに応じて）
      let itemUsage = 0;
      if (categoryConfig.fieldName === 'time' && item.time !== undefined) {
        itemUsage = item.time;
      } else if (categoryConfig.fieldName === 'capacity' && item.capacity !== undefined) {
        itemUsage = item.capacity;
      }

      aggregationMap.set(key, {
        cost: current.cost + item.cost,
        usage: current.usage + itemUsage,
      });
    }

    // 全体のコスト計算
    const totalCost = Array.from(aggregationMap.values()).reduce((sum, entry) => sum + entry.cost, 0);

    // AggregatedDataの配列に変換し、降順ソート
    const result: AggregatedData[] = Array.from(aggregationMap.entries())
      .map(([name, entry]) => {
        // 無料枠使用率を計算（個別の使用量に対して）
        let freeQuotaUsage: number | undefined;
        if (categoryConfig.freeQuota && categoryConfig.freeQuota.limit > 0) {
          freeQuotaUsage = (entry.usage / categoryConfig.freeQuota.limit) * 100;
        }

        return {
          name,
          cost: entry.cost,
          percentage: totalCost > 0 ? (entry.cost / totalCost) * 100 : 0,
          usage: entry.usage,
          usageUnit: categoryConfig.unit,
          freeQuotaUsage,
        };
      })
      .sort((a, b) => b.cost - a.cost);

    return result;
  }

  /**
   * ユーザー単位またはリポジトリ単位でデータを集計
   * @param data UserDataの配列
   * @param unit 集計単位（user または repository）
   * @returns 集計されたデータの配列（降順ソート済み）
   */
  static aggregateByUnit(data: UserData[], unit: DisplayUnit): AggregatedData[] {
    const groupKey = unit === 'user' ? 'user_name' : 'repository_name';
    const aggregationMap = new Map<string, number>();

    // データを集計
    for (const item of data) {
      const key = item[groupKey];
      const currentCost = aggregationMap.get(key) || 0;
      aggregationMap.set(key, currentCost + item.cost);
    }

    // 全体のコスト計算
    const totalCost = Array.from(aggregationMap.values()).reduce((sum, cost) => sum + cost, 0);

    // AggregatedDataの配列に変換し、降順ソート
    const result: AggregatedData[] = Array.from(aggregationMap.entries())
      .map(([name, cost]) => ({
        name,
        cost,
        percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);

    return result;
  }

  /**
   * 指定したユーザーまたはリポジトリのデータのみを抽出
   * @param data UserDataの配列
   * @param targetName 対象のユーザー名またはリポジトリ名
   * @param unit フィルタリング単位（user または repository）
   * @returns フィルタリングされたデータの配列
   */
  static filterByName(data: UserData[], targetName: string, unit: DisplayUnit): UserData[] {
    const filterKey = unit === 'user' ? 'user_name' : 'repository_name';
    return data.filter(item => item[filterKey] === targetName);
  }

  /**
   * データから一意のユーザー名リストを抽出
   * @param data UserDataの配列
   * @returns 重複を除いたユーザー名の配列（ソート済み）
   */
  static extractUniqueUsers(data: UserData[]): string[] {
    const userSet = new Set(data.map(item => item.user_name));
    return Array.from(userSet).sort();
  }

  /**
   * データから一意のリポジトリ名リストを抽出
   * @param data UserDataの配列
   * @returns 重複を除いたリポジトリ名の配列（ソート済み）
   */
  static extractUniqueRepositories(data: UserData[]): string[] {
    const repoSet = new Set(data.map(item => item.repository_name));
    return Array.from(repoSet).sort();
  }

  /**
   * 全体のコスト合計を計算
   * @param data UserDataの配列
   * @returns コストの合計値
   */
  static calculateTotalCost(data: UserData[]): number {
    return data.reduce((sum, item) => sum + item.cost, 0);
  }

  /**
   * 無料枠使用率を計算
   * @param data UserDataの配列
   * @param categoryConfig カテゴリ設定
   * @returns 使用率（パーセンテージ）、無料枠がない場合はnull
   */
  static calculateFreeQuotaUsage(data: UserData[], categoryConfig: CategoryConfig): number | null {
    if (!categoryConfig.freeQuota) {
      return null;
    }

    const freeQuota = categoryConfig.freeQuota;
    let totalUsage = 0;

    // フィールド名に基づいて使用量を集計
    for (const item of data) {
      if (freeQuota.fieldName === 'time' && item.time !== undefined) {
        totalUsage += item.time;
      } else if (freeQuota.fieldName === 'capacity' && item.capacity !== undefined) {
        totalUsage += item.capacity;
      }
    }

    if (freeQuota.limit === 0) {
      return 0;
    }

    return (totalUsage / freeQuota.limit) * 100;
  }

  /**
   * 表示用にデータを上位N件に制限
   * @param data AggregatedDataの配列
   * @param maxItems 最大表示件数
   * @returns 制限されたデータの配列
   */
  static limitDisplayItems(data: AggregatedData[], maxItems: number): AggregatedData[] {
    return data.slice(0, maxItems);
  }

  /**
   * 月別データを年間表示用に変換
   * @param monthlyData 月ごとのデータマップ（キー：YYYY-MM、値：UserData[]）
   * @param targetName 対象のユーザー名またはリポジトリ名
   * @param unit フィルタリング単位
   * @returns 月別コストデータの配列
   */
  static convertToMonthlyTrend(monthlyData: Map<string, UserData[]>, targetName: string, unit: DisplayUnit): Array<{ month: string; cost: number }> {
    const result: Array<{ month: string; cost: number }> = [];

    for (const [monthKey, data] of monthlyData) {
      const filteredData = this.filterByName(data, targetName, unit);
      const totalCost = this.calculateTotalCost(filteredData);

      result.push({
        month: monthKey,
        cost: totalCost,
      });
    }

    // 月順でソート
    return result.sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 月別データを年間表示用に変換（使用量情報付き）
   * @param monthlyData 月ごとのデータマップ（キー：YYYY-MM、値：UserData[]）
   * @param targetName 対象のユーザー名またはリポジトリ名
   * @param unit フィルタリング単位
   * @param categoryConfig カテゴリ設定
   * @returns 月別データの配列（使用量・無料枠情報含む）
   */
  static convertToMonthlyTrendWithUsage(
    monthlyData: Map<string, UserData[]>,
    targetName: string,
    unit: DisplayUnit,
    categoryConfig: CategoryConfig
  ): Array<{
    month: string;
    cost: number;
    dataCount: number;
    usage?: number;
    usageUnit?: string;
    freeQuotaUsage?: number;
  }> {
    const result: Array<{
      month: string;
      cost: number;
      dataCount: number;
      usage?: number;
      usageUnit?: string;
      freeQuotaUsage?: number;
    }> = [];

    for (const [monthKey, data] of monthlyData) {
      const filteredData = this.filterByName(data, targetName, unit);
      const totalCost = this.calculateTotalCost(filteredData);

      // 使用量を集計
      let totalUsage = 0;
      for (const item of filteredData) {
        if (categoryConfig.fieldName === 'time' && item.time !== undefined) {
          totalUsage += item.time;
        } else if (categoryConfig.fieldName === 'capacity' && item.capacity !== undefined) {
          totalUsage += item.capacity;
        }
      }

      // 無料枠使用率を計算
      let freeQuotaUsage: number | undefined;
      if (categoryConfig.freeQuota && categoryConfig.freeQuota.limit > 0) {
        freeQuotaUsage = (totalUsage / categoryConfig.freeQuota.limit) * 100;
      }

      result.push({
        month: monthKey,
        cost: totalCost,
        dataCount: filteredData.length,
        usage: totalUsage,
        usageUnit: categoryConfig.unit,
        freeQuotaUsage,
      });
    }

    // 月順でソート
    return result.sort((a, b) => a.month.localeCompare(b.month));
  }
}

/**
 * データ検証ユーティリティ
 */
export class DataValidator {
  /**
   * UserDataの妥当性をチェック
   * @param data 検証対象のデータ
   * @returns 検証結果とエラーメッセージ
   */
  static validateUserData(data: UserData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.user_name || data.user_name.trim() === '') {
      errors.push('ユーザー名が空です');
    }

    if (!data.repository_name || data.repository_name.trim() === '') {
      errors.push('リポジトリ名が空です');
    }

    if (typeof data.cost !== 'number' || isNaN(data.cost) || data.cost < 0) {
      errors.push('コストが無効です');
    }

    if (data.time !== undefined && (typeof data.time !== 'number' || isNaN(data.time) || data.time < 0)) {
      errors.push('時間が無効です');
    }

    if (data.capacity !== undefined && (typeof data.capacity !== 'number' || isNaN(data.capacity) || data.capacity < 0)) {
      errors.push('容量が無効です');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * UserDataの配列を検証し、無効なデータを除外
   * @param dataArray 検証対象のデータ配列
   * @returns 有効なデータのみの配列
   */
  static filterValidData(dataArray: UserData[]): UserData[] {
    return dataArray.filter(data => {
      const validation = this.validateUserData(data);
      if (!validation.isValid) {
        console.warn('Invalid data found:', data, 'Errors:', validation.errors);
      }
      return validation.isValid;
    });
  }
}

/**
 * 複数月データ集計ユーティリティ
 * 年間データの処理や月別推移の生成機能を提供
 */
export class MultiMonthAggregator {
  /**
   * 複数月のデータを読み込んで年間推移を生成
   * @param dataByMonth 月別データマップ
   * @param targetName 対象のユーザー名またはリポジトリ名
   * @param unit フィルタリング単位
   * @returns 月別推移データ
   */
  static generateYearlyTrend(
    dataByMonth: Map<string, UserData[]>,
    targetName: string,
    unit: DisplayUnit
  ): Array<{ month: string; cost: number; usage?: number }> {
    const result: Array<{ month: string; cost: number; usage?: number }> = [];

    for (const [monthKey, data] of dataByMonth) {
      const filteredData = DataAggregator.filterByName(data, targetName, unit);
      const totalCost = DataAggregator.calculateTotalCost(filteredData);

      // 使用量も計算（time または capacity）
      let totalUsage: number | undefined;
      if (filteredData.length > 0) {
        const firstItem = filteredData[0];
        if (firstItem.time !== undefined) {
          totalUsage = filteredData.reduce((sum, item) => sum + (item.time || 0), 0);
        } else if (firstItem.capacity !== undefined) {
          totalUsage = filteredData.reduce((sum, item) => sum + (item.capacity || 0), 0);
        }
      }

      result.push({
        month: monthKey,
        cost: totalCost,
        usage: totalUsage,
      });
    }

    // 月順でソート
    return result.sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 複数のカテゴリのデータを統合
   * @param categoriesData カテゴリ別データマップ
   * @returns 統合されたサマリーデータ
   */
  static generateCategorySummary(categoriesData: Map<string, UserData[]>): Array<{ category: string; totalCost: number; itemCount: number }> {
    const result: Array<{
      category: string;
      totalCost: number;
      itemCount: number;
    }> = [];

    for (const [category, data] of categoriesData) {
      const totalCost = DataAggregator.calculateTotalCost(data);
      result.push({
        category,
        totalCost,
        itemCount: data.length,
      });
    }

    return result.sort((a, b) => b.totalCost - a.totalCost);
  }
}
