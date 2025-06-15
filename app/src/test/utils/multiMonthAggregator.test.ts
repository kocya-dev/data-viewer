import { describe, it, expect, beforeEach } from 'vitest';
import { MultiMonthAggregator } from '../../../src/utils/dataProcessor';
import type { UserData, DisplayUnit } from '../../../src/types';

describe('MultiMonthAggregator', () => {
  let sampleData: Map<string, UserData[]>;

  beforeEach(() => {
    sampleData = new Map([
      [
        '2024-01',
        [
          { user_name: 'john', repository_name: 'repo1', time: 100, cost: 5.0 },
          {
            user_name: 'jane',
            repository_name: 'repo2',
            time: 200,
            cost: 10.0,
          },
        ],
      ],
      [
        '2024-02',
        [
          { user_name: 'john', repository_name: 'repo1', time: 150, cost: 7.5 },
          { user_name: 'jane', repository_name: 'repo2', time: 100, cost: 5.0 },
        ],
      ],
    ]);
  });

  describe('generateYearlyTrend', () => {
    it('should generate yearly trend for a specific user', () => {
      const trend = MultiMonthAggregator.generateYearlyTrend(sampleData, 'john', 'user');

      expect(trend).toHaveLength(2);
      expect(trend[0]).toEqual({
        month: '2024-01',
        cost: 5.0,
        usage: 100,
      });
      expect(trend[1]).toEqual({
        month: '2024-02',
        cost: 7.5,
        usage: 150,
      });
    });

    it('should generate yearly trend for a specific repository', () => {
      const trend = MultiMonthAggregator.generateYearlyTrend(sampleData, 'repo1', 'repository');

      expect(trend).toHaveLength(2);
      expect(trend[0]).toEqual({
        month: '2024-01',
        cost: 5.0,
        usage: 100,
      });
      expect(trend[1]).toEqual({
        month: '2024-02',
        cost: 7.5,
        usage: 150,
      });
    });

    it('should return zero cost for non-existent target', () => {
      const trend = MultiMonthAggregator.generateYearlyTrend(sampleData, 'nonexistent', 'user');

      expect(trend).toHaveLength(2);
      expect(trend[0].cost).toBe(0);
      expect(trend[1].cost).toBe(0);
    });
  });

  describe('aggregateToQuarterly', () => {
    it('should aggregate monthly data to quarterly', () => {
      const yearlyData = [
        { month: '2024-01', cost: 10.0, usage: 100 },
        { month: '2024-02', cost: 15.0, usage: 150 },
        { month: '2024-03', cost: 20.0, usage: 200 },
        { month: '2024-04', cost: 25.0, usage: 250 },
      ];

      const quarterly = MultiMonthAggregator.aggregateToQuarterly(yearlyData);

      expect(quarterly).toHaveLength(2);
      expect(quarterly[0]).toEqual({
        quarter: '2024-Q1',
        cost: 45.0,
        usage: 450,
      });
      expect(quarterly[1]).toEqual({
        quarter: '2024-Q2',
        cost: 25.0,
        usage: 250,
      });
    });
  });

  describe('generateCategorySummary', () => {
    it('should generate summary for multiple categories', () => {
      const categoriesData = new Map([
        [
          'actions',
          [
            {
              user_name: 'john',
              repository_name: 'repo1',
              time: 100,
              cost: 5.0,
            },
            {
              user_name: 'jane',
              repository_name: 'repo2',
              time: 200,
              cost: 10.0,
            },
          ],
        ],
        [
          'storage',
          [
            {
              user_name: 'john',
              repository_name: 'repo1',
              capacity: 1024,
              cost: 2.0,
            },
          ],
        ],
      ]);

      const summary = MultiMonthAggregator.generateCategorySummary(categoriesData);

      expect(summary).toHaveLength(2);
      expect(summary[0]).toEqual({
        category: 'actions',
        totalCost: 15.0,
        itemCount: 2,
      });
      expect(summary[1]).toEqual({
        category: 'storage',
        totalCost: 2.0,
        itemCount: 1,
      });
    });
  });
});
