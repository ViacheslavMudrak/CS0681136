import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { replaceHostnameToken } from 'lib/ukg/ukgHelper';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import { Box, Typography, CircularProgress, Tooltip } from '@mui/material';

import { DfdTileMyTimeProps, MyTimeData, UkgMyTimeApiResponse } from './DfdTileMyTime.types';

const DfdTileMyTime = ({ fields }: DfdTileMyTimeProps): React.ReactElement => {
  const datasource = fields?.data?.datasource;

  const { data: session, status } = useSession();

  const [myTimeData, setMyTimeData] = useState<MyTimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchMyTimeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let employeeNumber = session?.employeeNumber || null;
        if (session?.voyagerMockJson?.enableMocking === 'true') {
          employeeNumber =
            session?.voyagerMockJson?.ukgMyTimeSchedulePersonNumber || employeeNumber;
        }

        if (!employeeNumber) {
          setError('No UKG employee number found in session');
          return;
        }

        const response = await fetch('/api/ukg/my-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeNumbers: [employeeNumber],
            symbolicPeriodQualifier: 'Previous_Payperiod',
            paycodes: ['Regular', 'Overtime', 'Diffierential', 'Premiums', 'Time-Offs'],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch My Time data');
        }

        const result = (await response.json()) as UkgMyTimeApiResponse;
        const { spanEndDate, metrics } = result;

        let hoursSubmitted = '0';

        const employeeData = metrics?.find((m) => m.employeeId?.qualifier === employeeNumber);

        if (employeeData?.actualTotals?.length) {
          const totalHours = employeeData.actualTotals.reduce(
            (sum, total) => sum + (total.hoursAmount ?? 0),
            0
          );
          hoursSubmitted = totalHours.toString();
        }

        let timecardDue = 'N/A';
        if (spanEndDate) {
          const date = new Date(spanEndDate);
          timecardDue = `${date.getMonth() + 1}/${date.getDate()}`;
        }

        setMyTimeData({ hoursSubmitted, timecarddDue: timecardDue });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTimeData();
  }, [
    status,
    session?.employeeNumber,
    session?.employeeNumbers,
    session?.voyagerMockJson?.ukgMyTimeSchedulePersonNumber,
    session?.voyagerMockJson?.enableMocking,
  ]);

  const tileTitle = datasource?.tileTitle?.jsonValue?.value;
  const tileLabel = datasource?.tileLabel?.jsonValue?.value;
  const tileSubLabel = datasource?.tileSubLabel?.jsonValue?.value;
  const informationalText = datasource?.informationalText?.jsonValue?.value;

  const defaultPath = '/wfd/ess/myschedule';
  const rawHref = datasource?.tileDeeplink?.jsonValue?.value?.href;

  const deeplinkUrl = rawHref
    ? replaceHostnameToken(`https://{hostname}${extractPath(rawHref)}`)
    : replaceHostnameToken(`https://{hostname}${defaultPath}`);

  const iconItem = datasource?.tileIcon?.jsonValue;

  return (
    <Box
      component="a"
      href={deeplinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'block',
        backgroundColor: '#fff',
        borderRadius: 2,
        padding: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        minHeight: 200,
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        {iconItem ? <MaterialIcon iconItem={iconItem} /> : <MaterialIcon name="Timer" />}
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {tileTitle}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <>
          <Typography color="error" sx={{ fontSize: '0.875rem', mb: 1 }}>
            Unable to load data
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {error}
          </Typography>
        </>
      ) : myTimeData ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                {tileLabel}
              </Typography>

              {informationalText && informationalText.trim() !== '' && (
                <Tooltip title={informationalText} arrow placement="top" enterDelay={200}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <MaterialIcon name="Info" />
                  </span>
                </Tooltip>
              )}
            </Box>

            <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
              {myTimeData?.hoursSubmitted}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {tileSubLabel} {myTimeData.timecarddDue}
            </Typography>
          </Box>
        </>
      ) : (
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          No data available
        </Typography>
      )}
    </Box>
  );
};

export default DfdTileMyTime;

function extractPath(href: string): string {
  try {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      const url = new URL(href);
      return url.pathname + url.search + url.hash;
    }
    if (href.startsWith('/')) return href;
    return `/${href}`;
  } catch {
    return href.startsWith('/') ? href : `/${href}`;
  }
}
