import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { useUserExpenses } from 'lib/oracle/hooks/use-user-expenses';
import { useI18n } from 'next-localization';
import { JSX, useMemo, useState } from 'react';
import type { DfdTileStatus } from 'ts/dfd-tile-status';

import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';

import styles from './DfdTileExpenses.module.scss';
import { ExpenseItem, DfdTileExpensesStatics, DfdTileExpensesProps } from './DfdTileExpenses.types';

const cx = classNames.bind(styles);

/**
 * Build a lookup map from tileStatus items keyed by apiKey (lowercased).
 * Returns `{ title, iconName, cssModifier }` for each status.
 */
const buildStatusMap = (
  tileStatus?: DfdTileStatus[]
): Record<string, { title: string; iconName: string; cssModifier: string }> => {
  const map: Record<string, { title: string; iconName: string; cssModifier: string }> = {};
  if (!tileStatus) return map;

  for (const item of tileStatus) {
    const apiKey = item.fields?.apiKey?.value?.toLowerCase();
    if (!apiKey) continue;

    const title = item.fields?.title?.value || apiKey;
    const iconName = item.fields?.iconName?.value || '';
    // CSS modifier derives from the title (e.g. "Approved" → "dfd-expenses__card-status--approved")
    const cssModifier = `dfd-expenses__card-status--${title.toLowerCase()}`;

    map[apiKey] = { title, iconName, cssModifier };
  }

  return map;
};

/** Resolve an Oracle API status string against the tileStatus lookup map. */
const resolveStatus = (
  rawStatus: string,
  statusMap: Record<string, { title: string; iconName: string; cssModifier: string }>
) => {
  const key = rawStatus.toLowerCase();
  return statusMap[key] ?? { title: rawStatus, iconName: '', cssModifier: '' };
};

const DfdTileExpenses = (props: DfdTileExpensesProps): JSX.Element => {
  const { fields, rendering } = props;
  const { t } = useI18n();
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const maxItems = fields?.maxItemCount?.value ?? 3;
  const expenseDeepLink = fields?.expenseDeepLink?.value;
  const tileStatus = fields?.tileStatus;
  const statusMap = useMemo(() => buildStatusMap(tileStatus), [tileStatus]);
  const { expenses, isLoading } = useUserExpenses();
  const showAmountLabel = t('ShowAmountLabel') || DfdTileExpensesStatics.showAmountLabel;
  const pageCountLabel = t('PageCountLabel') || DfdTileExpensesStatics.pageCountLabel;

  const hasRequiredFields =
    fields?.tileTitle?.value &&
    fields?.tileLabel1?.value &&
    fields?.tileLabel2?.value &&
    fields?.maxItemCount?.value !== undefined &&
    fields?.expenseDeepLink?.value &&
    fields?.tileStatus &&
    fields?.tileStatus?.length > 0;

  const { approvedExpenses, otherExpenses } = useMemo(() => {
    const approvedList: ExpenseItem[] = [];
    const otherList: ExpenseItem[] = [];

    for (const report of expenses) {
      const resolved = resolveStatus(report.ExpenseStatusCode, statusMap);
      const expense: ExpenseItem = {
        id: report?.ExpenseReportId,
        title: report.Purpose || `Report #${report.ExpenseReportId}`,
        amount: `$${report.ExpenseReportTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: resolved.title,
        statusIconName: resolved.iconName,
        statusCssModifier: resolved.cssModifier,
        deepLink: expenseDeepLink?.replace('${expenseid}', report?.ExpenseReportId),
      };

      if (expense?.status?.toLowerCase() === 'approved') {
        approvedList.push(expense);
      } else {
        otherList.push(expense);
      }
    }

    return { approvedExpenses: approvedList, otherExpenses: otherList };
  }, [expenseDeepLink, expenses, statusMap]);

  const [showAmountById, setShowAmountById] = useState<Record<string, boolean>>({});
  const [isContentOpen, setIsContentOpen] = useState(true);
  const hasMoreThanThreeOtherCards = otherExpenses?.length > maxItems;

  const toggleAmount = (id?: string) => {
    if (!id) return;
    setShowAmountById((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  if (!hasRequiredFields && !isPageEditing) {
    return <></>;
  }

  return (
    <div
      className={cx('dfd-expenses', 'component flex flex-col', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('dfd-expenses__header', 'flex justify-between items-center')}>
        <div className="flex items-center">
          <MaterialIcon name="AttachMoneyOutlined" />
          <Text tag="span" field={fields.tileTitle} className={cx('dfd-expenses__title')} />
        </div>
        <button
          className={cx('dfd-expenses__expand')}
          type="button"
          onClick={() => setIsContentOpen((prev) => !prev)}
        >
          <MaterialIcon name={isContentOpen ? 'ExpandLessOutlined' : 'ExpandMoreOutlined'} />
        </button>
      </div>
      {isLoading && (
        <div className={cx('dfd-expenses__content', 'flex flex-col')}>
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1, mt: 2, mx: 2 }} />
          <div
            className={cx('dfd-expenses__card-container', 'flex flex-col gap-2')}
            style={{ padding: '0 16px' }}
          >
            {Array.from({ length: maxItems }).map((_, i) => (
              <div key={i} className={cx('dfd-expenses__card', 'flex flex-col gap-2')}>
                <div className="flex justify-between gap-4">
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="circular" width={20} height={20} />
                </div>
                <div className="flex justify-between gap-4">
                  <Skeleton variant="text" width="30%" height={18} />
                  <Skeleton variant="text" width="25%" height={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && expenses?.length > 0 && (
        <div
          className={cx(
            'dfd-expenses__content-container',
            !isContentOpen && 'dfd-expenses__content-container--collapsed'
          )}
        >
          {/* Approved Expenses */}
          {approvedExpenses && approvedExpenses?.length > 0 && (
            <div className={cx('dfd-expenses__content', 'flex flex-col')}>
              <Text className={cx('dfd-expenses__subtitle')} tag="span" field={fields.tileLabel1} />
              <div className={cx('dfd-expenses__card-container', 'flex flex-col gap-2')}>
                {approvedExpenses.slice(0, maxItems).map((item) => {
                  const isAmountVisible = showAmountById[item?.id || ''] ?? false;
                  return (
                    <div key={item.id} className={cx('dfd-expenses__card', 'flex flex-col gap-2')}>
                      <a
                        href={item.deepLink}
                        className={cx(
                          'dfd-expenses__card-description',
                          'flex justify-between gap-4'
                        )}
                      >
                        <span>{item.title}</span>
                        <MaterialIcon name="ChevronRightOutlined" />
                      </a>
                      <div
                        className={cx('dfd-expenses__card-detail', 'flex justify-between gap-4')}
                      >
                        <div className={cx('dfd-expenses__card-amount', 'flex items-center gap-2')}>
                          {isAmountVisible && (
                            <span className={cx('dfd-expenses__amount')}>{item.amount}</span>
                          )}
                          {!isAmountVisible && (
                            <span className={cx('dfd-expenses__amount-text')}>
                              {showAmountLabel}
                            </span>
                          )}
                          <button
                            onClick={() => toggleAmount(item?.id)}
                            aria-label={isAmountVisible ? 'Hide amount' : 'Show amount'}
                            className={cx('dfd-expenses__amount-toggle')}
                          >
                            <MaterialIcon
                              name={
                                isAmountVisible ? 'VisibilityOffOutlined' : 'VisibilityOnOutlined'
                              }
                            />
                          </button>
                        </div>
                        <div
                          className={cx(
                            'dfd-expenses__card-status',
                            item.statusCssModifier,
                            'flex items-center gap-2'
                          )}
                        >
                          {item.statusIconName && <MaterialIcon name={item.statusIconName} />}
                          <span>{item?.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {approvedExpenses?.length > maxItems && (
                <span className={cx('dfd-expenses__showing')}>
                  {pageCountLabel
                    .replace('{current}', maxItems.toString())
                    .replace('{total}', approvedExpenses.length.toString())}
                </span>
              )}
            </div>
          )}

          {/* Other Expenses */}
          {otherExpenses && otherExpenses?.length > 0 && (
            <div className={cx('dfd-expenses__content', 'flex flex-col')}>
              <Text className={cx('dfd-expenses__subtitle')} tag="span" field={fields.tileLabel2} />
              <div className={cx('dfd-expenses__card-container', 'flex flex-col gap-2')}>
                {otherExpenses.slice(0, maxItems).map((item) => {
                  const isAmountVisible = showAmountById[item?.id || ''] ?? false;
                  return (
                    <div key={item.id} className={cx('dfd-expenses__card', 'flex flex-col gap-2')}>
                      <a
                        href={item?.deepLink}
                        className={cx(
                          'dfd-expenses__card-description',
                          'flex justify-between gap-4'
                        )}
                      >
                        <span>{item?.title}</span>
                        <MaterialIcon name="ChevronRightOutlined" />
                      </a>
                      <div
                        className={cx('dfd-expenses__card-detail', 'flex justify-between gap-4')}
                      >
                        <div className={cx('dfd-expenses__card-amount', 'flex items-center gap-2')}>
                          {isAmountVisible && (
                            <span className={cx('dfd-expenses__amount')}>{item?.amount}</span>
                          )}
                          {!isAmountVisible && (
                            <span className={cx('dfd-expenses__amount-text')}>
                              {showAmountLabel}
                            </span>
                          )}
                          <button
                            onClick={() => toggleAmount(item?.id)}
                            aria-label={isAmountVisible ? 'Hide amount' : 'Show amount'}
                            className={cx('dfd-expenses__amount-toggle')}
                          >
                            <MaterialIcon
                              name={
                                isAmountVisible ? 'VisibilityOffOutlined' : 'VisibilityOnOutlined'
                              }
                            />
                          </button>
                        </div>
                        <div
                          className={cx(
                            'dfd-expenses__card-status',
                            item.statusCssModifier,
                            'flex items-center gap-2'
                          )}
                        >
                          {item.statusIconName && <MaterialIcon name={item.statusIconName} />}
                          <span>{item?.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {otherExpenses?.length > maxItems && (
                <span className={cx('dfd-expenses__showing')}>
                  {pageCountLabel
                    .replace('{current}', maxItems.toString())
                    .replace('{total}', otherExpenses.length.toString())}
                </span>
              )}
            </div>
          )}

          {hasMoreThanThreeOtherCards && fields?.viewAllDeeplink?.value && (
            <div className={cx('dfd-expenses__footer', 'flex justify-center')}>
              <a href={fields?.viewAllDeeplink?.value?.href}>
                <span>{fields?.viewAllDeeplink?.value?.text}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default compose<DfdTileExpensesProps>(withDatasourceCheck(), withStyles())(DfdTileExpenses);
