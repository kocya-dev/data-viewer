import { describe, it, expect } from 'vitest';
import { DataAggregator, DataValidator } from '../../../src/utils/dataProcessor';
import type { UserData, DisplayUnit } from '../../../src/types';
import { CATEGORIES } from '../../../src/constants';

describe('DataAggregator', () => {
  const sampleData: UserData[] = [
    { user_name: 'john_doe', repository_name: 'repo1', time: 10, cost: 5.0 },
    { user_name: 'jane_smith', repository_name: 'repo2', time: 20, cost: 8.0 },
    { user_name: 'john_doe', repository_name: 'repo2', time: 15, cost: 3.0 },
    {
      user_name: 'jane_smith',
      repository_name: 'repo1',
      capacity: 100,
      cost: 2.0,
    },
  ];

  describe('aggregateByUnit', () => {
    it('should aggregate data by user correctly', () => {
      const result = DataAggregator.aggregateByUnit(sampleData, 'user');

      expect(result).toHaveLength(2);

      // 降順でソートされているかチェック
      expect(result[0].name).toBe('jane_smith');
      expect(result[0].cost).toBe(10.0);
      expect(result[0].percentage).toBeCloseTo(55.56, 2);

      expect(result[1].name).toBe('john_doe');
      expect(result[1].cost).toBe(8.0);
      expect(result[1].percentage).toBeCloseTo(44.44, 2);
    });

    it('should aggregate data by repository correctly', () => {
      const result = DataAggregator.aggregateByUnit(sampleData, 'repository');

      expect(result).toHaveLength(2);

      expect(result[0].name).toBe('repo2');
      expect(result[0].cost).toBe(11.0);

      expect(result[1].name).toBe('repo1');
      expect(result[1].cost).toBe(7.0);
    });

    it('should handle empty data', () => {
      const result = DataAggregator.aggregateByUnit([], 'user');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByName', () => {
    it('should filter by user name correctly', () => {
      const result = DataAggregator.filterByName(sampleData, 'john_doe', 'user');

      expect(result).toHaveLength(2);
      expect(result.every(item => item.user_name === 'john_doe')).toBe(true);
    });

    it('should filter by repository name correctly', () => {
      const result = DataAggregator.filterByName(sampleData, 'repo1', 'repository');

      expect(result).toHaveLength(2);
      expect(result.every(item => item.repository_name === 'repo1')).toBe(true);
    });
  });

  describe('extractUniqueUsers', () => {
    it('should extract unique users and sort them', () => {
      const result = DataAggregator.extractUniqueUsers(sampleData);

      expect(result).toEqual(['jane_smith', 'john_doe']);
    });
  });

  describe('extractUniqueRepositories', () => {
    it('should extract unique repositories and sort them', () => {
      const result = DataAggregator.extractUniqueRepositories(sampleData);

      expect(result).toEqual(['repo1', 'repo2']);
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate total cost correctly', () => {
      const result = DataAggregator.calculateTotalCost(sampleData);
      expect(result).toBe(18.0);
    });

    it('should return 0 for empty data', () => {
      const result = DataAggregator.calculateTotalCost([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateFreeQuotaUsage', () => {
    it('should calculate free quota usage for actions', () => {
      const actionsConfig = CATEGORIES.find(c => c.name === 'actions')!;
      const actionsData: UserData[] = [
        { user_name: 'user1', repository_name: 'repo1', time: 1000, cost: 10 },
        { user_name: 'user2', repository_name: 'repo2', time: 2000, cost: 20 },
      ];

      const result = DataAggregator.calculateFreeQuotaUsage(actionsData, actionsConfig);

      // 3000分 / 50000分 = 6%
      expect(result).toBeCloseTo(6.0, 1);
    });

    it('should return null for category without free quota', () => {
      const codespacesConfig = CATEGORIES.find(c => c.name === 'codespaces')!;
      const result = DataAggregator.calculateFreeQuotaUsage(sampleData, codespacesConfig);

      expect(result).toBeNull();
    });
  });

  describe('limitDisplayItems', () => {
    const manyItems = Array.from({ length: 150 }, (_, i) => ({
      name: `item${i}`,
      cost: i,
      percentage: (i / 150) * 100,
    }));

    it('should limit items to specified count', () => {
      const result = DataAggregator.limitDisplayItems(manyItems, 100);
      expect(result).toHaveLength(100);
    });

    it('should return all items if count is less than limit', () => {
      const result = DataAggregator.limitDisplayItems(manyItems.slice(0, 50), 100);
      expect(result).toHaveLength(50);
    });
  });
});

describe('DataValidator', () => {
  describe('validateUserData', () => {
    it('should validate correct data', () => {
      const validData: UserData = {
        user_name: 'john_doe',
        repository_name: 'my-repo',
        time: 10,
        cost: 5.0,
      };

      const result = DataValidator.validateUserData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect empty user name', () => {
      const invalidData: UserData = {
        user_name: '',
        repository_name: 'my-repo',
        cost: 5.0,
      };

      const result = DataValidator.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ユーザー名が空です');
    });

    it('should detect invalid cost', () => {
      const invalidData: UserData = {
        user_name: 'john_doe',
        repository_name: 'my-repo',
        cost: -1,
      };

      const result = DataValidator.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コストが無効です');
    });

    it('should detect invalid time', () => {
      const invalidData: UserData = {
        user_name: 'john_doe',
        repository_name: 'my-repo',
        time: -5,
        cost: 5.0,
      };

      const result = DataValidator.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('時間が無効です');
    });
  });

  describe('filterValidData', () => {
    it('should filter out invalid data', () => {
      const mixedData: UserData[] = [
        { user_name: 'john_doe', repository_name: 'repo1', cost: 5.0 },
        { user_name: '', repository_name: 'repo2', cost: 3.0 }, // 無効
        { user_name: 'jane_smith', repository_name: 'repo3', cost: -1 }, // 無効
        { user_name: 'mike_wilson', repository_name: 'repo4', cost: 2.0 },
      ];

      const result = DataValidator.filterValidData(mixedData);

      expect(result).toHaveLength(2);
      expect(result.map(d => d.user_name)).toEqual(['john_doe', 'mike_wilson']);
    });
  });
});
