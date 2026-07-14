import {
  DFDTeamTileDictionary,
  DfdTileMyTeamTimeProps,
  TeamTimeData,
  UkgTeamTimeApiResponse,
} from './DfdTileMyTeamTime.types';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { replaceHostnameToken } from 'lib/ukg/ukgHelper';
import { useSession } from 'next-auth/react';
import { useI18n } from 'next-localization';
import React, { useEffect, useState } from 'react';

import { Box, Typography, CircularProgress } from '@mui/material';

const DfdTileMyTeamTime = ({ fields }: DfdTileMyTeamTimeProps): React.ReactElement => {
  const datasource = fields?.data?.datasource;
  const { data: session, status } = useSession();
  const { t } = useI18n();

  const [teamTimeData, setTeamTimeData] = useState<TeamTimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchTeamTimeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get managed employees from session first, fallback to env
        const managedEmployees = session?.employeeNumbers?.length
          ? session.employeeNumbers
          : (process.env.NEXT_PUBLIC_MOCK_MANAGED_EMPLOYEES?.split(',').map((e) => e.trim()) ?? []);

        if (!managedEmployees.length) {
          setError('No managed employees available');
          return;
        }

        // Fetch exception categories to build the mapping
        const categoriesResponse = await fetch('/api/ukg/team-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'exceptions' }),
        });

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch exception categories');
        }

        const categories = (await categoriesResponse.json()) as Array<{
          id: number;
          name: string;
          color?: string;
          exceptionTypes: Array<{ id?: number; qualifier: string }>;
        }>;

        const categoryMap = new Map<string, string>();
        categories.forEach((category) => {
          category.exceptionTypes.forEach((exceptionType) => {
            categoryMap.set(exceptionType.qualifier, category.name);
          });
        });

        const exceptionsResponse = await fetch('/api/ukg/team-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'team-exceptions',
            employeeNumbers: managedEmployees,
          }),
        });

        if (!exceptionsResponse.ok) {
          throw new Error('Failed to fetch team exceptions');
        }

        const employeeExceptions = (await exceptionsResponse.json()) as UkgTeamTimeApiResponse;

        let mustFixCount = 0;
        let needsReviewCount = 0;
        let miscellaneousCount = 0;

        if (Array.isArray(employeeExceptions)) {
          employeeExceptions.forEach((employeeData) => {
            if (!employeeData.exceptions) return;

            employeeData.exceptions.forEach((exception) => {
              if (exception.reviewed) return;

              const exceptionName = exception.exceptionType?.displayName;
              if (!exceptionName) return;

              const categoryName = categoryMap.get(exceptionName);

              if (categoryName === 'Must Fix') mustFixCount++;
              else if (categoryName === 'Need Review' || categoryName === 'Needs Review')
                needsReviewCount++;
              else if (categoryName === 'Miscellaneous') miscellaneousCount++;
            });
          });
        }

        setTeamTimeData({
          mustFix: mustFixCount,
          needsReview: needsReviewCount,
          miscellaneous: miscellaneousCount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamTimeData();
  }, [status, session?.employeeNumbers]);

  const tileTitle = datasource?.tileTitle?.jsonValue?.value;
  const tileLabel = datasource?.tileLabel?.jsonValue?.value;

  const defaultPath = '/timekeeping#/timecard';
  const rawHref = datasource?.otherDeepLink?.jsonValue?.value?.href;

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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        minHeight: 200,
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        {iconItem ? <MaterialIcon iconItem={iconItem} /> : <MaterialIcon name="AccessTime" />}
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
      ) : teamTimeData ? (
        <>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 2 }}>
            {tileLabel}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {t('MustFix') || DFDTeamTileDictionary.MustFix}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: teamTimeData.mustFix > 0 ? '#ec0c09' : 'text.primary',
                }}
              >
                {teamTimeData.mustFix}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {t('NeedsReview') || DFDTeamTileDictionary.NeedsReview}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: teamTimeData.needsReview > 0 ? '#ca4b07' : 'text.primary',
                }}
              >
                {teamTimeData.needsReview}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {t('Miscellaneous') || DFDTeamTileDictionary.Miscellaneous}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: teamTimeData.miscellaneous > 0 ? '#5273c7' : 'text.primary',
                }}
              >
                {teamTimeData.miscellaneous}
              </Typography>
            </Box>
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

export default DfdTileMyTeamTime;

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
