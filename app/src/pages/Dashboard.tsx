import { useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { CategoryTabs } from '../components/features/CategoryTabs';
import { ViewModeTabs } from '../components/features/ViewModeTabs';
import type { Category, ViewMode } from '../types';

function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('actions');
  const [selectedMode, setSelectedMode] = useState<ViewMode>('overview');

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        課金データ可視化ダッシュボード
      </Typography>

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <ViewModeTabs
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
      />

      {/* プレースホルダーコンテンツ */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {selectedCategory} - {selectedMode}
          </Typography>
          <Typography color="text.secondary">
            Phase 2でデータ処理機能を実装予定です。
            <br />
            現在は基本レイアウトとナビゲーション機能が動作しています。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export { Dashboard };
