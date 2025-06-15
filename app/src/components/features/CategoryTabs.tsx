import { Box, Tab, Tabs, Paper } from '@mui/material';
import { CATEGORIES } from '../../constants';
import type { Category } from '../../types';

interface CategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

function CategoryTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: Category) => {
    onCategoryChange(newValue);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedCategory}
          onChange={handleChange}
          aria-label="カテゴリ選択タブ"
          variant="fullWidth"
        >
          {CATEGORIES.map(category => (
            <Tab
              key={category.name}
              label={category.label}
              value={category.name}
              aria-label={`${category.label}カテゴリを選択`}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  );
}

export { CategoryTabs };
