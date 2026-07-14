import {
  CurrentEmployeeSection,
  MyTeamTimeSection,
  MyTimeSection,
  NextPtoSection,
  PtoRequestsSection,
  PtoSection,
  ScheduleSection,
  ShiftSwapActionItemsSection,
  ShiftSwapsSection,
} from './ApiFormReferenceComponents';
import classNames from 'classnames/bind';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

import { Box, Container } from '@mui/material';

import styles from './ApiTestingForm.module.scss';

const cx = classNames.bind(styles);

const ApiTestingForm = (): JSX.Element => {
  const { data: session } = useSession();

  console.log('UKG Person Number:', session?.employeeNumber);
  console.log('UKG Managed Persons:', session?.employeeNumbers);

  return (
    <>
      <div className={cx('api-testing-form')}>
        <h2 className={cx('api-testing-form__title')}>UKG API Demo</h2>
        <Container maxWidth="lg">
          <Box sx={{ py: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <CurrentEmployeeSection />
              <MyTimeSection />
              <ScheduleSection />
              <PtoSection />
              <NextPtoSection />
              <PtoRequestsSection />
              <ShiftSwapsSection />
              <MyTeamTimeSection />
              <ShiftSwapActionItemsSection />
            </Box>
          </Box>
        </Container>
      </div>
    </>
  );
};

export default ApiTestingForm;
