import { VoyagerMockData } from 'ts/voyager-mock-data';

export type UkgMockFields = Pick<
  Required<VoyagerMockData>,
  | 'ukgPtoPersonNumber'
  | 'ukgPtoStartDate'
  | 'ukgPtoEndDate'
  | 'ukgMyTimeSchedulePersonNumber'
  | 'ukgMyTimeScheduleStartDate'
  | 'ukgMyTimeScheduleEndDate'
  | 'ukgTeamTimePersonNumber'
  | 'ukgTeamTimeStartDate'
  | 'ukgTeamTimeEndDate'
  | 'ukgShiftswapPersonNumber'
  | 'ukgShiftswapStartDate'
  | 'ukgShiftswapEndDate'
  | 'ukgActionItemsPersonNumber'
>;

export const FIELD_META: { key: keyof UkgMockFields; label: string }[] = [
  { key: 'ukgPtoPersonNumber', label: 'DFD Tile PTO Person Number' },
  { key: 'ukgPtoStartDate', label: 'DFD Tile PTO Start Date' },
  { key: 'ukgPtoEndDate', label: 'DFD Tile PTO End Date' },
  { key: 'ukgMyTimeSchedulePersonNumber', label: 'DFD Tile MyTime/Schedule Person Number' },
  { key: 'ukgMyTimeScheduleStartDate', label: 'DFD Tile MyTime/Schedule Start Date' },
  { key: 'ukgMyTimeScheduleEndDate', label: 'DFD Tile MyTime/Schedule End Date' },
  { key: 'ukgTeamTimePersonNumber', label: 'DFD Tile Team Time Person Number' },
  { key: 'ukgTeamTimeStartDate', label: 'DFD Tile Team Time Start Date' },
  { key: 'ukgTeamTimeEndDate', label: 'DFD Tile Team Time End Date' },
  { key: 'ukgShiftswapPersonNumber', label: 'DFD Tile Shiftswap Person Number' },
  { key: 'ukgShiftswapStartDate', label: 'DFD Tile Shiftswap Start Date' },
  { key: 'ukgShiftswapEndDate', label: 'DFD Tile Shiftswap End Date' },
  { key: 'ukgActionItemsPersonNumber', label: 'DFD Tile Action Items Person Number' },
];

export const EMPTY_FIELDS: UkgMockFields = {
  ukgPtoPersonNumber: '',
  ukgPtoStartDate: '',
  ukgPtoEndDate: '',
  ukgMyTimeSchedulePersonNumber: '',
  ukgMyTimeScheduleStartDate: '',
  ukgMyTimeScheduleEndDate: '',
  ukgTeamTimePersonNumber: '',
  ukgTeamTimeStartDate: '',
  ukgTeamTimeEndDate: '',
  ukgShiftswapPersonNumber: '',
  ukgShiftswapStartDate: '',
  ukgShiftswapEndDate: '',
  ukgActionItemsPersonNumber: '',
};
