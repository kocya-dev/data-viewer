import { describe, it, expect } from 'vitest';
import {
  ConfigService,
  categoryUtils,
} from '../../../src/services/configService';
import type { CategoryConfig } from '../../../src/types';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    // 各テストで新しいインスタンスを作成（シングルトンをリセット）
    // @ts-ignore - accessing private constructor for testing
    configService = new ConfigService();
  });

  describe('getCategoryConfig', () => {
    it('should return correct config for actions', () => {
      const config = configService.getCategoryConfig('actions');

      expect(config).toBeDefined();
      expect(config?.name).toBe('actions');
      expect(config?.label).toBe('GitHub Actions');
      expect(config?.fieldName).toBe('time');
      expect(config?.freeQuota).toBeDefined();
    });

    it('should return undefined for non-existent category', () => {
      const config = configService.getCategoryConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('getAllCategoryConfigs', () => {
    it('should return all configured categories', () => {
      const configs = configService.getAllCategoryConfigs();

      expect(configs).toHaveLength(3);
      expect(configs.map(c => c.name)).toContain('actions');
      expect(configs.map(c => c.name)).toContain('codespaces');
      expect(configs.map(c => c.name)).toContain('storage');
    });
  });

  describe('hasFreeQuota', () => {
    it('should return true for categories with free quota', () => {
      expect(configService.hasFreeQuota('actions')).toBe(true);
      expect(configService.hasFreeQuota('storage')).toBe(true);
    });

    it('should return false for categories without free quota', () => {
      expect(configService.hasFreeQuota('codespaces')).toBe(false);
    });

    it('should return false for non-existent categories', () => {
      expect(configService.hasFreeQuota('non-existent')).toBe(false);
    });
  });

  describe('updateCategoryConfig', () => {
    it('should add new category config', () => {
      const newConfig: CategoryConfig = {
        name: 'new-category',
        label: 'New Category',
        fieldName: 'usage',
        unit: 'hours',
      };

      configService.updateCategoryConfig(newConfig);

      const retrieved = configService.getCategoryConfig('new-category');
      expect(retrieved).toEqual(newConfig);
    });

    it('should update existing category config', () => {
      const updatedConfig: CategoryConfig = {
        name: 'actions',
        label: 'Updated GitHub Actions',
        fieldName: 'time',
        unit: 'minutes',
        freeQuota: {
          category: 'actions',
          limit: 60000,
          unit: 'minutes',
          fieldName: 'time',
        },
      };

      configService.updateCategoryConfig(updatedConfig);

      const retrieved = configService.getCategoryConfig('actions');
      expect(retrieved?.label).toBe('Updated GitHub Actions');
      expect(retrieved?.freeQuota?.limit).toBe(60000);
    });
  });

  describe('validateCategoryConfig', () => {
    it('should validate correct config', () => {
      const validConfig: CategoryConfig = {
        name: 'test-category',
        label: 'Test Category',
        fieldName: 'usage',
        unit: 'hours',
      };

      const result = configService.validateCategoryConfig(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidConfig: CategoryConfig = {
        name: '',
        label: '',
        fieldName: '',
        unit: '',
      };

      const result = configService.validateCategoryConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('カテゴリ名が空です');
      expect(result.errors).toContain('カテゴリラベルが空です');
      expect(result.errors).toContain('フィールド名が空です');
      expect(result.errors).toContain('単位が空です');
    });

    it('should validate free quota settings', () => {
      const invalidConfig: CategoryConfig = {
        name: 'test',
        label: 'Test',
        fieldName: 'usage',
        unit: 'hours',
        freeQuota: {
          category: 'different', // 不一致
          limit: -100, // 負の値
          unit: 'hours',
          fieldName: 'different_field', // 不一致
        },
      };

      const result = configService.validateCategoryConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '無料枠の上限は0以上である必要があります'
      );
      expect(result.errors).toContain('無料枠のカテゴリ名が一致しません');
      expect(result.errors).toContain('無料枠のフィールド名が一致しません');
    });
  });
});

describe('categoryUtils', () => {
  describe('getCategoryLabel', () => {
    it('should return correct label for known categories', () => {
      expect(categoryUtils.getCategoryLabel('actions')).toBe('GitHub Actions');
      expect(categoryUtils.getCategoryLabel('storage')).toBe('Storage');
    });

    it('should return category name for unknown categories', () => {
      expect(categoryUtils.getCategoryLabel('unknown')).toBe('unknown');
    });
  });

  describe('getCategoryUnit', () => {
    it('should return correct unit for known categories', () => {
      expect(categoryUtils.getCategoryUnit('actions')).toBe('分');
      expect(categoryUtils.getCategoryUnit('storage')).toBe('MB');
    });

    it('should return empty string for unknown categories', () => {
      expect(categoryUtils.getCategoryUnit('unknown')).toBe('');
    });
  });

  describe('getFreeQuotaInfo', () => {
    it('should return free quota info for categories that have it', () => {
      const actionsQuota = categoryUtils.getFreeQuotaInfo('actions');

      expect(actionsQuota).toBeDefined();
      expect(actionsQuota?.limit).toBe(50000);
      expect(actionsQuota?.unit).toBe('分');
    });

    it('should return null for categories without free quota', () => {
      const codespacesQuota = categoryUtils.getFreeQuotaInfo('codespaces');
      expect(codespacesQuota).toBeNull();
    });
  });
});
