import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { usePayDate } from 'lib/oracle/hooks/use-pay-date';
import { usePayInformation } from 'lib/oracle/hooks/use-pay-information';
import { JSX, useState } from 'react';

import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';

import styles from './DfdTilePayInformation.module.scss';
import { DfdTilePayInformationProps } from './DfdTilePayInformation.types';

const cx = classNames.bind(styles);

const DfdTilePayInformation = (props: DfdTilePayInformationProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isContentOpen, setIsContentOpen] = useState(true);
  const deeplinks = [
    fields?.paystubsDeeplink,
    fields?.payrollCalendarDeeplink,
    fields?.manageDirectDepositDeeplink,
    fields?.w2FormsDeeplink,
    fields?.payIncreasesDeeplink,
  ];
  const hasRequiredFields = fields.tileName?.value && fields.tileLabel?.value;

  const { payInformation, isLoading: isPayInfoLoading } = usePayInformation();
  const validPayroll = payInformation?.items?.[0]?.payrollAssignments?.filter(
    (p) => p.assignedPayrolls && p.assignedPayrolls.length > 0
  );
  let payrollId = '';
  let paydate = '';
  if (validPayroll && validPayroll.length > 0) {
    payrollId = validPayroll[0].assignedPayrolls?.[0]?.PayrollId;
  }
  const { defaultPaydate, isLoading: isPayDateLoading } = usePayDate({ payrollId });
  if (!isPayInfoLoading && defaultPaydate && defaultPaydate !== '') {
    paydate = new Date(defaultPaydate + 'T00:00:00').toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
  }

  const isLoading = isPayInfoLoading || isPayDateLoading;

  if (!hasRequiredFields && !isPageEditing) {
    return <></>;
  }

  return (
    <div
      className={cx('dfd-pay-information', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('dfd-pay-information__header', 'flex justify-between items-center')}>
        <div className="flex items-center gap-2">
          <MaterialIcon name={fields.tileIcon?.fields?.value?.value} />
          <Text tag="span" field={fields.tileName} className={cx('dfd-pay-information__title')} />
        </div>
        <button
          className={cx('dfd-pay-information__expand')}
          type="button"
          onClick={() => setIsContentOpen((prev) => !prev)}
        >
          <MaterialIcon name={isContentOpen ? 'ExpandLessOutlined' : 'ExpandMoreOutlined'} />
        </button>
      </div>
      <div
        className={cx(
          'dfd-pay-information__content-container',
          !isContentOpen && 'dfd-pay-information__content-container--collapsed'
        )}
      >
        <div className={cx('dfd-pay-information__content', 'flex flex-col gap-4')}>
          {isLoading ? (
            <div className={cx('flex flex-col gap-4')}>
              <div className={cx('flex flex-col gap-2')}>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={80} height={24} />
              </div>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="text" width={180} height={20} />
              ))}
            </div>
          ) : (
            <>
              {paydate && (
                <div className={cx('dfd-pay-information__content-header', 'flex flex-col gap-2')}>
                  <Text
                    className={cx('dfd-pay-information__subtitle')}
                    tag="span"
                    field={fields?.tileLabel}
                  />
                  <span className={cx('dfd-pay-information__date')}>{paydate}</span>
                </div>
              )}

              <ul className={cx('dfd-pay-information__link-list', 'flex flex-col gap-4')}>
                {deeplinks &&
                  deeplinks?.length > 0 &&
                  deeplinks?.map((deeplink, index) => {
                    if (!deeplink?.value) return null;
                    return (
                      <li key={index}>
                        <a
                          href={deeplink?.value?.href}
                          target={deeplink?.value?.target}
                          className="flex items-center gap-2"
                        >
                          {deeplink?.value?.text}
                          <MaterialIcon name="LaunchOutlined" />
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default compose<DfdTilePayInformationProps>(
  withDatasourceCheck(),
  withStyles()
)(DfdTilePayInformation);
