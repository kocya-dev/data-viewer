import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Autocomplete,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale/ja';
import type { ViewMode, Period, DisplayUnit } from '../../types';
import { PERIODS, DISPLAY_UNITS } from '../../constants';

interface DataFiltersProps {
  viewMode: ViewMode;
  period: Period;
  displayUnit: DisplayUnit;
  selectedDate: Date | null;
  selectedUser: string;
  selectedRepository: string;
  users: string[];
  repositories: string[];
  onPeriodChange: (period: Period) => void;
  onDisplayUnitChange: (unit: DisplayUnit) => void;
  onDateChange: (date: Date | null) => void;
  onUserChange: (user: string) => void;
  onRepositoryChange: (repository: string) => void;
}

export function DataFilters({
  viewMode,
  period,
  displayUnit,
  selectedDate,
  selectedUser,
  selectedRepository,
  users,
  repositories,
  onPeriodChange,
  onDisplayUnitChange,
  onDateChange,
  onUserChange,
  onRepositoryChange,
}: DataFiltersProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          フィルター設定
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          flexWrap="wrap"
        >
          {/* 日付選択 */}
          <Box sx={{ minWidth: 200 }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ja}
            >
              <DatePicker
                label={
                  period === 'weekly'
                    ? '週の開始日'
                    : period === 'monthly'
                      ? '月を選択'
                      : '四半期を選択'
                }
                value={selectedDate}
                onChange={onDateChange}
                views={
                  period === 'weekly'
                    ? ['year', 'month', 'day']
                    : ['year', 'month']
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* 期間選択（全体概要モードのみ） */}
          {viewMode === 'overview' && (
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>期間</InputLabel>
                <Select
                  value={period}
                  label="期間"
                  onChange={e => onPeriodChange(e.target.value as Period)}
                >
                  {PERIODS.map(periodOption => (
                    <MenuItem
                      key={periodOption.value}
                      value={periodOption.value}
                    >
                      {periodOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* 表示単位選択（全体概要モードのみ） */}
          {viewMode === 'overview' && (
            <Box sx={{ minWidth: 200 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>
                  表示単位
                </FormLabel>
                <RadioGroup
                  row
                  value={displayUnit}
                  onChange={e =>
                    onDisplayUnitChange(e.target.value as DisplayUnit)
                  }
                >
                  {DISPLAY_UNITS.map(unit => (
                    <FormControlLabel
                      key={unit.value}
                      value={unit.value}
                      control={<Radio size="small" />}
                      label={unit.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* ユーザー選択（ユーザー詳細モードのみ） */}
          {viewMode === 'user-detail' && (
            <Box sx={{ minWidth: 250 }}>
              <Autocomplete
                options={users}
                value={selectedUser || null}
                onChange={(_, newValue) => onUserChange(newValue || '')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="ユーザーを選択"
                    size="small"
                    fullWidth
                  />
                )}
                noOptionsText="ユーザーが見つかりません"
              />
            </Box>
          )}

          {/* リポジトリ選択（リポジトリ詳細モードのみ） */}
          {viewMode === 'repository-detail' && (
            <Box sx={{ minWidth: 250 }}>
              <Autocomplete
                options={repositories}
                value={selectedRepository || null}
                onChange={(_, newValue) => onRepositoryChange(newValue || '')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="リポジトリを選択"
                    size="small"
                    fullWidth
                  />
                )}
                noOptionsText="リポジトリが見つかりません"
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
