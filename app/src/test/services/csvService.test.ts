import { describe, it, expect } from 'vitest';
import { CsvService } from '../../../src/services/csvService';

describe('CsvService', () => {
  describe('parseCsv', () => {
    const csvService = new CsvService();

    it('should parse actions CSV data correctly', () => {
      const csvText = `user_name,repository_name,time,cost
john_doe,my-repo,8,0.75
jane_smith,web-app,5,0.30`;

      // @ts-expect-error - accessing private method for testing
      const result = csvService.parseCsv(csvText, 'actions');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        user_name: 'john_doe',
        repository_name: 'my-repo',
        time: 8,
        cost: 0.75,
      });
      expect(result[1]).toEqual({
        user_name: 'jane_smith',
        repository_name: 'web-app',
        time: 5,
        cost: 0.3,
      });
    });

    it('should parse storage CSV data correctly', () => {
      const csvText = `user_name,repository_name,capacity,cost
john_doe,my-repo,10,3.00
jane_smith,web-app,4,1.20`;

      // @ts-expect-error - accessing private method for testing
      const result = csvService.parseCsv(csvText, 'storage');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        user_name: 'john_doe',
        repository_name: 'my-repo',
        capacity: 10,
        cost: 3.0,
      });
    });

    it('should handle empty CSV gracefully', () => {
      const csvText = '';

      // @ts-expect-error - accessing private method for testing
      const result = csvService.parseCsv(csvText, 'actions');

      expect(result).toHaveLength(0);
    });

    it('should skip invalid lines and log warnings', () => {
      const csvText = `user_name,repository_name,time,cost
john_doe,my-repo,8,0.75
invalid,line
jane_smith,web-app,5,0.30`;

      // @ts-expect-error - accessing private method for testing
      const result = csvService.parseCsv(csvText, 'actions');

      expect(result).toHaveLength(2);
      expect(result[0].user_name).toBe('john_doe');
      expect(result[1].user_name).toBe('jane_smith');
    });

    it('should handle invalid cost values', () => {
      const csvText = `user_name,repository_name,time,cost
john_doe,my-repo,8,invalid_cost
jane_smith,web-app,5,0.30`;

      // @ts-expect-error - accessing private method for testing
      const result = csvService.parseCsv(csvText, 'actions');

      expect(result).toHaveLength(1);
      expect(result[0].user_name).toBe('jane_smith');
    });
  });

  describe('generateAvailableFiles', () => {
    it('should generate expected file list', () => {
      const csvService = new CsvService();
      const files = csvService.generateAvailableFiles();

      expect(files).toContain('20240101-actions.csv');
      expect(files).toContain('20240101-codespaces.csv');
      expect(files).toContain('20240101-storage.csv');
      expect(files).toContain('20250601-actions.csv');

      // 2025年7月以降は含まれない
      expect(files).not.toContain('20250701-actions.csv');
    });
  });

  describe('loadMultipleCsvData', () => {
    it('should handle multiple dates gracefully', async () => {
      const csvService = new CsvService('/test-data');
      const dates = ['20240101', '20240201'];

      // Mock fetch to avoid actual HTTP requests in tests
      const originalFetch = global.fetch;
      global.fetch = async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.includes('20240101-actions.csv')) {
          return {
            ok: true,
            text: async () => 'user_name,repository_name,time,cost\njohn,repo1,100,5.00',
          } as Response;
        } else if (url.includes('20240201-actions.csv')) {
          return {
            ok: false,
            status: 404,
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      };

      try {
        const result = await csvService.loadMultipleCsvData('actions', 'monthly', dates);

        expect(result.size).toBe(2);
        expect(result.get('20240101')).toHaveLength(1);
        expect(result.get('20240201')).toHaveLength(0); // Failed to load
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('loadYearlyData', () => {
    it('should generate correct month keys', async () => {
      const csvService = new CsvService('/test-data');

      // Mock fetch
      const originalFetch = global.fetch;
      global.fetch = async () => {
        return {
          ok: true,
          text: async () => 'user_name,repository_name,time,cost\njohn,repo1,100,5.00',
        } as Response;
      };

      try {
        const result = await csvService.loadYearlyData('actions', 2024);

        expect(result.size).toBe(12);
        expect(result.has('2024-01')).toBe(true);
        expect(result.has('2024-12')).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
