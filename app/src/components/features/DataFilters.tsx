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
import type { ViewMode, DisplayUnit } from '../../types';
import { DISPLAY_UNITS } from '../../constants';

interface DataFiltersProps {
  viewMode: ViewMode;
  displayUnit: DisplayUnit;
  selectedDate: Date | null;
  selectedYear?: number;
  selectedUser: string;
  selectedRepository: string;
  users: string[];
  repositories: string[];
  onDisplayUnitChange: (unit: DisplayUnit) => void;
  onDateChange: (date: Date | null) => void;
  onYearChange?: (year: number) => void;
  onUserChange: (user: string) => void;
  onRepositoryChange: (repository: string) => void;
}

export function DataFilters({
  viewMode,
  displayUnit,
  selectedDate,
  selectedYear,
  selectedUser,
  selectedRepository,
  users,
  repositories,
  onDisplayUnitChange,
  onDateChange,
  onYearChange,
  onUserChange,
  onRepositoryChange,
}: DataFiltersProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          フィルター設定
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexWrap="wrap">
          {/* 日付選択（全体概要モードのみ） */}
          {viewMode === 'overview' && (
            <Box sx={{ minWidth: 200 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                  label="月を選択"
                  value={selectedDate}
                  onChange={onDateChange}
                  views={['year', 'month']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          )}

          {/* 年選択（詳細モードのみ） */}
          {viewMode !== 'overview' && (
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>年</InputLabel>
                <Select value={selectedYear || new Date().getFullYear()} label="年" onChange={e => onYearChange && onYearChange(Number(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}年
                      </MenuItem>
                    );
                  })}
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
                <RadioGroup row value={displayUnit} onChange={e => onDisplayUnitChange(e.target.value as DisplayUnit)}>
                  {DISPLAY_UNITS.map(unit => (
                    <FormControlLabel key={unit.value} value={unit.value} control={<Radio size="small" />} label={unit.label} />
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
                renderInput={params => <TextField {...params} label="ユーザーを選択" size="small" fullWidth />}
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
                renderInput={params => <TextField {...params} label="リポジトリを選択" size="small" fullWidth />}
                noOptionsText="リポジトリが見つかりません"
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
