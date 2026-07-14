import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
} from '@mui/material';
import {
  ActualTotalsResponse,
  Json,
  JsonObject,
  MyTimeMetricItem,
  MyTimeResponse,
  PayCodeEdit,
  PtoAction,
  PtoBalanceItem,
  PtoData,
  PtoRemainingItem,
  ShiftSwapItem,
  TimeOffRequest,
  UkgExceptionCategory,
} from './ApiTestingForm.types';
// import client from 'lib/sitecore-client';
import { replaceHostnameToken } from 'lib/ukg/ukgHelper';
// import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { JSX, useState } from 'react';
import type { ScheduleResponse } from 'ts/ukg';

// import { extractPath } from '@sitecore-content-sdk/nextjs/utils';
// import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';

// import components from '.sitecore/component-map';

async function postFetcher<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || response.statusText);
  }
  return response.json();
}

function isMyTimeMetricArray(value: unknown): value is MyTimeMetricItem[] {
  return Array.isArray(value);
}

export function CurrentEmployeeSection() {
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<{
    id?: number;
    qualifier?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    contactInformation?: {
      email?: string;
      phone?: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const url = baseUrl
        ? `/api/ukg/current-user-info?baseUrl=${encodeURIComponent(baseUrl)}`
        : '/api/ukg/current-user-info';

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Current Employee Info
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder="https://ascension-uat.npr.mykronos.com"
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch Current User'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Error: {error}
          </Typography>
          <Typography variant="body2">
            This is expected if credentials don&apos;t have access to the current_user_info
            endpoint.
          </Typography>
        </Alert>
      )}

      {data && (
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Employee Information
          </Typography>
          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Employee Number (Qualifier):
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {data.qualifier || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                ID:
              </Typography>
              <Typography variant="body1">{data.id || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Name:
              </Typography>
              <Typography variant="body1">
                {data.firstName && data.lastName
                  ? `${data.firstName} ${data.lastName}`
                  : data.name || 'N/A'}
              </Typography>
            </Box>
            {data.contactInformation && (
              <>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body1">{data.contactInformation.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Phone:
                  </Typography>
                  <Typography variant="body1">{data.contactInformation.phone || 'N/A'}</Typography>
                </Box>
              </>
            )}
          </Stack>
        </Card>
      )}
    </Box>
  );
}

export function ScheduleSection() {
  const [employeeNumber, setEmployeeNumber] = useState('10000237');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-02');
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const deeplinkUrl = replaceHostnameToken('https://{hostname}/timekeeping#/timecard');

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await postFetcher<ScheduleResponse>('/api/ukg/schedule', {
        employeeNumbers: [employeeNumber],
        startDate,
        endDate,
        ...(baseUrl && { baseUrl }),
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Employee Schedule
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Employee Number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          size="small"
        />
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Environment Url (optional, set to UAT)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch Schedule'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {data.shiftCount} shift(s), {data.payCodeCount} pay code edit(s)
          </Typography>

          {data.shifts.length > 0 && (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Org Job</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.shifts.map((shift, i) => (
                    <TableRow key={i}>
                      <TableCell>{shift.startFormatted}</TableCell>
                      <TableCell>{shift.endFormatted}</TableCell>
                      <TableCell>{shift.positionQualifier}</TableCell>
                      <TableCell>{shift.orgJobQualifier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      <Box>
        <Typography variant="caption" sx={{ mr: 1 }}>
          Schedule Deeplink:
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={deeplinkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          My Timecard
        </Button>
      </Box>
    </Box>
  );
}

export function PtoSection() {
  const today = new Date().toISOString().split('T')[0];
  const [employeeNumber, setEmployeeNumber] = useState('10000263');
  const [date, setDate] = useState(today);
  const [action, setAction] = useState<PtoAction>('balance');
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<PtoData>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deeplinkUrl = replaceHostnameToken('https://{hostname}/wfd/ess/myschedule');

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/ukg/pto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          employeeNumbers: [employeeNumber],
          startDate: date,
          ...(baseUrl && { baseUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const isBalanceData = (d: unknown): d is PtoBalanceItem[] => {
    return Array.isArray(d) && d.length > 0 && 'ptoBalance' in d[0];
  };

  const isRemainingData = (d: unknown): d is PtoRemainingItem[] => {
    return Array.isArray(d) && d.length > 0 && 'ptoRemaining' in d[0];
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        PTO Balance
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Employee Number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={action}
            label="Action"
            onChange={(e) => setAction(e.target.value as PtoAction)}
          >
            <MenuItem value="balance">PTO Balance</MenuItem>
            <MenuItem value="remaining">PTO Remaining</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch PTO'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* PTO Balance Table */}
      {isBalanceData(data) && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            PTO Balance - Available current employee PTO to take as of today
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>PTO Balance (Hours)</TableCell>
                  <TableCell>Balance Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.employeeId}</TableCell>
                    <TableCell>{item.ptoBalance}</TableCell>
                    <TableCell>{item.balanceDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Box>
        <Typography variant="caption" sx={{ mr: 1 }}>
          PTO Deeplink:
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={deeplinkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          My Schedule
        </Button>
      </Box>

      {/* PTO Remaining Table */}
      {isRemainingData(data) && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            PTO Remaining - Available PTO to take minus the future requests
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Available (Hours)</TableCell>
                  <TableCell>Planned Taking (Hours)</TableCell>
                  <TableCell>Balance Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.employeeId}</TableCell>
                    <TableCell>{item.ptoRemaining}</TableCell>
                    <TableCell>{item.plannedTaking}</TableCell>
                    <TableCell>{item.balanceDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {data && !isBalanceData(data) && !isRemainingData(data) && (
        <Alert severity="info">No data available</Alert>
      )}
    </Box>
  );
}

export function NextPtoSection() {
  const [employeeNumber, setEmployeeNumber] = useState('10731696');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-07-01');
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<PayCodeEdit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/ukg/pto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'next-pto',
          employeeNumbers: [employeeNumber],
          startDate,
          endDate,
          ...(baseUrl && { baseUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Next PTO - Date of Next Approved PTO
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Employee Number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch Next PTO'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && data.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {data.length} PTO entry/entries found
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration (Hours)</TableCell>
                  <TableCell>Pay Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((edit, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{edit.id}</TableCell>
                    <TableCell>{edit.employee?.qualifier}</TableCell>
                    <TableCell>{edit.startDate}</TableCell>
                    <TableCell>{edit.endDate}</TableCell>
                    <TableCell>{edit.startTime}</TableCell>
                    <TableCell>{edit.endTime}</TableCell>
                    <TableCell>{edit.durationInMinutes}</TableCell>
                    <TableCell>{edit.payCodeRef?.qualifier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No PTO entries found for the selected date range.</Alert>
      )}
    </Box>
  );
}

export function PtoRequestsSection() {
  const [employeeNumber, setEmployeeNumber] = useState('10731696');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-07-01');
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<TimeOffRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/ukg/pto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'requests',
          employeeNumbers: [employeeNumber],
          startDate,
          endDate,
          ...(baseUrl && { baseUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        PTO Requests - List of Every Future PTO Request and Status
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Employee Number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch PTO Requests'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && data.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {data.length} PTO request(s) found
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration (Hours)</TableCell>
                  <TableCell>Pay Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((request, idx) => {
                  const period = request.periods?.[0];
                  return (
                    <TableRow key={idx}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.employee?.qualifier}</TableCell>
                      <TableCell>{request.currentStatus?.name}</TableCell>
                      <TableCell>{request.createDateTime}</TableCell>
                      <TableCell>{request.requestSubType?.name}</TableCell>
                      <TableCell>{period?.startDate}</TableCell>
                      <TableCell>{period?.endDate}</TableCell>
                      <TableCell>{period?.startTime}</TableCell>
                      <TableCell>{period?.duration}</TableCell>
                      <TableCell>{period?.payCode?.qualifier}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No PTO requests found for the selected date range.</Alert>
      )}
    </Box>
  );
}

export function MyTeamTimeSection(): JSX.Element {
  const { data: session } = useSession();
  const managedNumbers = session?.employeeNumbers;
  const defaultEmployeeNumbers = Array.isArray(managedNumbers)
    ? managedNumbers.join(',')
    : '10000263,10781571';

  const [employeeNumbers, setEmployeeNumbers] = useState<string>(defaultEmployeeNumbers);
  const [paycodes, setPaycodes] = useState<string>('Regular,Overtime');
  const [action, setAction] = useState<'exceptions' | 'scorecard'>('exceptions');
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<ActualTotalsResponse | UkgExceptionCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const payload: Record<string, unknown> = {
        action,
        ...(baseUrl && { baseUrl }),
      };

      if (action === 'scorecard') {
        const employees = employeeNumbers
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);

        const codes = paycodes
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);

        if (!employees.length) {
          throw new Error('Employee numbers are required for scorecard');
        }

        payload.employeeNumbers = employees;
        payload.paycodes = codes;
      }

      const response = await fetch('/api/ukg/team-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const isScorecardData = (d: unknown): d is ActualTotalsResponse => {
    return Array.isArray(d) && d.length > 0 && 'employeeId' in d[0];
  };

  const scorecardData = isScorecardData(data) ? data : null;
  const categoriesData =
    Array.isArray(data) && !scorecardData ? (data as UkgExceptionCategory[]) : null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        My Team Time (Manager Tile)
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Managed Employee Numbers (comma-separated)"
          value={employeeNumbers}
          onChange={(e) => setEmployeeNumbers(e.target.value)}
          size="small"
          sx={{ minWidth: 320 }}
          disabled={action === 'exceptions'}
        />
        <TextField
          label="Paycodes (comma-separated)"
          value={paycodes}
          onChange={(e) => setPaycodes(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          disabled={action === 'exceptions'}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={action}
            label="Action"
            onChange={(e) => setAction(e.target.value as 'exceptions' | 'scorecard')}
          >
            <MenuItem value="exceptions">Exception Categories</MenuItem>
            <MenuItem value="scorecard">Hours Scorecard</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            `Fetch ${action === 'exceptions' ? 'Categories' : 'Scorecard'}`
          )}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {scorecardData && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Hours Worked (Previous Pay Period)
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Pay Period</TableCell>
                  <TableCell>Week</TableCell>
                  <TableCell>Signed Off</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scorecardData.map((item, idx) => {
                  const empId = item.employeeId?.qualifier || 'Unknown';
                  const total = item.actualTotals?.[0];
                  return (
                    <TableRow key={idx}>
                      <TableCell>{empId}</TableCell>
                      <TableCell>{total?.hoursAmount ?? 'N/A'}</TableCell>
                      <TableCell>{total?.payPeriodNumber ?? 'N/A'}</TableCell>
                      <TableCell>{total?.payPeriodWeek ?? 'N/A'}</TableCell>
                      <TableCell>{total?.signedOff ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {categoriesData && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Exception Categories
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Exception Types</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoriesData.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.color && (
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: category.color,
                              borderRadius: '50%',
                            }}
                          />
                        )}
                        {category.name}
                      </Box>
                    </TableCell>
                    <TableCell>{category.description || 'N/A'}</TableCell>
                    <TableCell>
                      {category.exceptionTypes
                        .map((et: { qualifier: unknown }) => et.qualifier)
                        .join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function ShiftSwapsSection() {
  const [personNumbers, setPersonNumbers] = useState('10711954');
  const [startDate, setStartDate] = useState('2026-02-20');
  const [endDate, setEndDate] = useState('2026-04-20');
  const [action, setAction] = useState<'list' | 'approved' | 'denied'>('list');
  const [includeShiftDetails] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<ShiftSwapItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ukg/shiftswaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          personNumbers: personNumbers.split(',').map((n) => n.trim()),
          startDate,
          endDate,
          includeShiftDetails,
          ...(baseUrl && { baseUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Shift Swaps
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Person Numbers (comma-separated)"
          value={personNumbers}
          onChange={(e) => setPersonNumbers(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={action}
            label="Action"
            onChange={(e) => setAction(e.target.value as 'list' | 'approved' | 'denied')}
          >
            <MenuItem value="list">Offered</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="denied">Denied</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch Shift Swaps'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && data.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {data.length} shift swap(s) found
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Create DateTime</TableCell>
                  <TableCell>Start DateTime</TableCell>
                  <TableCell>End DateTime</TableCell>
                  <TableCell>Offered Employee</TableCell>
                  <TableCell>Requested Employee</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((swap, idx) => (
                  <TableRow key={swap.id || idx}>
                    <TableCell>{swap.id}</TableCell>
                    <TableCell>{swap.employee?.qualifier}</TableCell>
                    <TableCell>{swap.currentStatus?.name}</TableCell>
                    <TableCell>{swap.createDateTime}</TableCell>
                    <TableCell>{swap.startDateTime}</TableCell>
                    <TableCell>{swap.endDateTime}</TableCell>
                    <TableCell>{swap.swapShift?.offered?.employee?.qualifier}</TableCell>
                    <TableCell>{swap.swapShift?.requested?.[0]?.employee?.qualifier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No shift swaps found for the selected criteria.</Alert>
      )}
    </Box>
  );
}

export function ShiftSwapActionItemsSection() {
  const [employeeNumber, setEmployeeNumber] = useState('10711954');
  const [startDate, setStartDate] = useState('2026-02-20');
  const [endDate, setEndDate] = useState('2026-04-20');
  const [baseUrl, setBaseUrl] = useState('');
  const [data, setData] = useState<ShiftSwapItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deeplinkUrl = replaceHostnameToken('https://{hostname}/controlCenter');

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/ukg/action-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeNumber,
          startDate,
          endDate,
          ...(baseUrl && { baseUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || response.statusText);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Shift Swap Action Items
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Employee Number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Environment Url (optional)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />
        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch Action Items'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && data.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {data.length} action item(s) found
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Creator</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Start DateTime</TableCell>
                  <TableCell>End DateTime</TableCell>
                  <TableCell>Offered Employee</TableCell>
                  <TableCell>Requested Employee</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.employee?.qualifier}</TableCell>
                    <TableCell>{item.creator?.qualifier}</TableCell>
                    <TableCell>{item.currentStatus?.name}</TableCell>
                    <TableCell>{item.createDateTime}</TableCell>
                    <TableCell>{item.startDateTime}</TableCell>
                    <TableCell>{item.endDateTime}</TableCell>
                    <TableCell>{item.swapShift?.offered?.employee?.qualifier}</TableCell>
                    <TableCell>{item.swapShift?.requested?.[0]?.employee?.qualifier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {data && data.length === 0 && (
        <Alert severity="info">No action items found for the selected criteria.</Alert>
      )}
      <Box>
        <Typography variant="caption" sx={{ mr: 1 }}>
          Action Items Deeplink:
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={deeplinkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Control Center
        </Button>
      </Box>
    </Box>
  );
}

export function MyTimeSection() {
  const [employeeNumbers, setEmployeeNumbers] = useState('10000263');
  const [symbolicPeriod, setSymbolicPeriod] = useState<'Previous_Payperiod' | 'Current_Payperiod'>(
    'Previous_Payperiod'
  );
  const [paycodes] = useState('Regular,Overtime');
  const [includeShiftDetails] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');

  const [data, setData] = useState<MyTimeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ukg/my-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeNumbers: employeeNumbers
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean),
          symbolicPeriodQualifier: symbolicPeriod,
          paycodes: paycodes
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean),
          includeShiftDetails,
          ...(baseUrl && { baseUrl }),
        }),
      });

      if (!response.ok) {
        const errorData: unknown = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        const msg =
          isJsonObject(errorData) && typeof errorData.error === 'string'
            ? errorData.error
            : response.statusText;
        throw new Error(msg);
      }

      const result: unknown = await response.json();

      if (!isJsonObject(result)) throw new Error('Unexpected response shape from /api/ukg/my-time');

      const spanEndDate =
        typeof result.spanEndDate === 'string' || result.spanEndDate === null
          ? (result.spanEndDate as string | null)
          : null;

      const metrics = (result.metrics ?? null) as Json;

      setData({ spanEndDate, metrics });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        My Time
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Employee Numbers (comma-separated)"
          value={employeeNumbers}
          onChange={(e) => setEmployeeNumbers(e.target.value)}
          size="small"
          sx={{ minWidth: 320 }}
        />

        <TextField
          label="Symbolic Period"
          select
          SelectProps={{ native: true }}
          value={symbolicPeriod}
          onChange={(e) =>
            setSymbolicPeriod(e.target.value as 'Previous_Payperiod' | 'Current_Payperiod')
          }
          size="small"
          sx={{ minWidth: 200 }}
        >
          <option value="Previous_Payperiod">Previous_Payperiod</option>
          <option value="Current_Payperiod">Current_Payperiod</option>
        </TextField>

        <TextField
          label="Environment Url (optional, set to UAT)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          size="small"
          placeholder={replaceHostnameToken('https://{hostname}')}
          sx={{ minWidth: 320 }}
        />

        <Button variant="contained" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Fetch My Time'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Current Pay Period Ends: <b>{data.spanEndDate ?? 'N/A'}</b>
          </Typography>

          {isMyTimeMetricArray(data.metrics) && (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Hours (Actual Totals)</TableCell>
                    <TableCell>Pay Period</TableCell>
                    <TableCell>Week</TableCell>
                    <TableCell>Signed Off</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.metrics.map((m, idx) => {
                    const emp = m.employeeId?.qualifier ?? 'N/A';
                    const t = m.actualTotals?.[0];
                    return (
                      <TableRow key={idx}>
                        <TableCell>{emp}</TableCell>
                        <TableCell>{t?.hoursAmount ?? 'N/A'}</TableCell>
                        <TableCell>{t?.payPeriodNumber ?? 'N/A'}</TableCell>
                        <TableCell>{t?.payPeriodWeek ?? 'N/A'}</TableCell>
                        <TableCell>{t?.signedOff ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   let props = {};
//   const path = extractPath(context);

//   let page;

//   if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
//     page = await client.getDesignLibraryData(context.previewData);
//   } else {
//     page = context.preview
//       ? await client.getPreview(context.previewData)
//       : await client.getPage(path, { locale: context.locale });
//   }
//   if (page) {
//     props = {
//       page,
//       dictionary: await client.getDictionary({
//         site: page.siteName,
//         locale: page.locale,
//       }),
//       componentProps: await client.getComponentData(page.layout, context, components),
//     };
//   }
//   return {
//     props,
//     notFound: !page,
//   };
// };
