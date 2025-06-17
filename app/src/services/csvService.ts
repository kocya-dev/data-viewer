import type { UserData, Category } from '../types';

/**
 * CSV読み込みサービス
 * ブラウザ環境でCSVファイルを読み込み、パースする機能を提供
 */
export class CsvService {
  private baseUrl: string;

  constructor(baseUrl = '/data') {
    this.baseUrl = baseUrl;
  }

  /**
   * CSVファイルを読み込み、パースしてUserDataの配列を返す
   * @param category カテゴリ（actions, codespaces, storage）
   * @param date 日付（YYYYMMDD形式）
   * @returns UserDataの配列
   */
  async loadCsvData(category: Category, date: string): Promise<UserData[]> {
    const fileName = `${date}-${category}.csv`;
    const filePath = `${this.baseUrl}/monthly/${fileName}`;

    try {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to load CSV file: ${filePath} (${response.status})`);
      }

      const csvText = await response.text();
      return this.parseCsv(csvText, category);
    } catch (error) {
      console.error(`Error loading CSV data from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * CSV文字列をパースしてUserDataの配列に変換
   * @param csvText CSV文字列
   * @param category カテゴリ
   * @returns UserDataの配列
   */
  private parseCsv(csvText: string, category: Category): UserData[] {
    const lines = csvText.trim().split('\n');

    if (lines.length === 0) {
      return [];
    }

    // ヘッダー行を除去
    const dataLines = lines.slice(1);
    const results: UserData[] = [];

    for (const line of dataLines) {
      if (line.trim() === '') continue;

      const columns = line.split(',').map(col => col.trim());

      if (columns.length !== 4) {
        console.warn(`Invalid CSV line format: ${line}`);
        continue;
      }

      const [user_name, repository_name, thirdField, costStr] = columns;
      const cost = parseFloat(costStr);

      if (isNaN(cost)) {
        console.warn(`Invalid cost value: ${costStr} in line: ${line}`);
        continue;
      }

      const userData: UserData = {
        user_name,
        repository_name,
        cost,
      };

      // カテゴリに応じて第3フィールドを適切な属性に設定
      if (category === 'actions' || category === 'codespaces') {
        const time = parseFloat(thirdField);
        if (!isNaN(time)) {
          userData.time = time;
        }
      } else if (category === 'storage') {
        const capacity = parseFloat(thirdField);
        if (!isNaN(capacity)) {
          userData.capacity = capacity;
        }
      }

      results.push(userData);
    }

    return results;
  }

  /**
   * 複数月のCSVファイルを一括読み込み
   * @param category カテゴリ
   * @param dates 日付の配列（YYYYMMDD形式）
   * @returns 日付をキーとしたUserDataマップ
   */
  async loadMultipleCsvData(category: Category, dates: string[]): Promise<Map<string, UserData[]>> {
    const result = new Map<string, UserData[]>();
    const loadPromises = dates.map(async date => {
      try {
        const data = await this.loadCsvData(category, date);
        return { date, data };
      } catch (error) {
        console.warn(`Failed to load data for ${date}:`, error);
        return { date, data: [] };
      }
    });

    const results = await Promise.all(loadPromises);

    for (const { date, data } of results) {
      result.set(date, data);
    }

    return result;
  }

  /**
   * 年間データを月単位で読み込み
   * @param category カテゴリ
   * @param year 年（YYYY形式）
   * @returns 月をキーとしたUserDataマップ（キー形式：YYYY-MM）
   */
  async loadYearlyData(category: Category, year: number): Promise<Map<string, UserData[]>> {
    const dates: string[] = [];

    // 1月から12月のデータファイル名を生成
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      dates.push(`${year}${monthStr}01`);
    }

    const rawData = await this.loadMultipleCsvData(category, dates);
    const result = new Map<string, UserData[]>();

    // 日付キー（YYYYMMDD）を月キー（YYYY-MM）に変換
    for (const [dateKey, data] of rawData) {
      const year = dateKey.substring(0, 4);
      const month = dateKey.substring(4, 6);
      const monthKey = `${year}-${month}`;
      result.set(monthKey, data);
    }

    return result;
  }

  /**
   * 利用可能なデータファイルを実際にチェック
   * @param category カテゴリ
   * @returns 存在するファイルの日付配列
   */
  async checkAvailableFiles(category: Category): Promise<string[]> {
    const possibleFiles = this.generateAvailableFiles();
    const availableFiles: string[] = [];

    for (const fileName of possibleFiles) {
      if (fileName.endsWith(`-${category}.csv`)) {
        const filePath = `${this.baseUrl}/monthly/${fileName}`;
        try {
          const response = await fetch(filePath, { method: 'HEAD' });
          if (response.ok) {
            // ファイル名から日付部分を抽出
            const dateMatch = fileName.match(/^(\d{8})-/);
            if (dateMatch) {
              availableFiles.push(dateMatch[1]);
            }
          }
        } catch {
          // ファイルが存在しない場合はスキップ
        }
      }
    }

    return availableFiles.sort();
  }

  /**
   * 利用可能なCSVファイルのリストを取得
   * 実際のファイルシステムをチェックする代わりに、
   * 期待されるファイル名のパターンをベースに生成
   */
  generateAvailableFiles(): string[] {
    const categories: Category[] = ['actions', 'codespaces', 'storage'];

    // 2024年1月から2025年6月までの月次データファイル名を生成
    const files: string[] = [];

    for (let year = 2024; year <= 2025; year++) {
      const endMonth = year === 2025 ? 6 : 12;
      for (let month = 1; month <= endMonth; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const datePrefix = `${year}${monthStr}01`;

        for (const category of categories) {
          files.push(`${datePrefix}-${category}.csv`);
        }
      }
    }

    return files;
  }
}

// シングルトンインスタンス
export const csvService = new CsvService();
