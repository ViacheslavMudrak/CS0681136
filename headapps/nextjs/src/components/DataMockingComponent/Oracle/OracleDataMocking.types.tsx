import { VoyagerMockData } from 'ts/voyager-mock-data';

export type OracleMockFields = Pick<
  Required<VoyagerMockData>,
  'oracleEmployeeId' | 'oraclePersonNumber'
>;

export const FIELD_META: { key: keyof OracleMockFields; label: string; type: string }[] = [
  { key: 'oracleEmployeeId', label: 'Employee ID', type: 'text' },
  { key: 'oraclePersonNumber', label: 'Person Number', type: 'text' },
];

export const EMPTY_FIELDS: OracleMockFields = {
  oracleEmployeeId: '',
  oraclePersonNumber: '',
};
