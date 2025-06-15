import { Box, Tab, Tabs, Paper } from '@mui/material';
import { VIEW_MODES } from '../../constants';
import type { ViewMode } from '../../types';

interface ViewModeTabsProps {
  selectedMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

function ViewModeTabs({ selectedMode, onModeChange }: ViewModeTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: ViewMode) => {
    onModeChange(newValue);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedMode}
          onChange={handleChange}
          aria-label="表示モード選択タブ"
          variant="fullWidth"
        >
          {VIEW_MODES.map(mode => (
            <Tab
              key={mode.value}
              label={mode.label}
              value={mode.value}
              aria-label={`${mode.label}モードを選択`}
            />
          ))}
        </Tabs>
      </Box>
    </Paper>
  );
}

export { ViewModeTabs };
