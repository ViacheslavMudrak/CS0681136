import { JSX, useMemo } from 'react';
import { ProfileTabStatics } from './ProfileTab.types';
import classNames from 'classnames/bind';
import { useSession } from 'next-auth/react';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import type { ProfileTabProps } from './ProfileTab.types';

// CSS module styles
import styles from './ProfileTab.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

const ProfileTab = (props: ProfileTabProps): JSX.Element => {
  const { rendering, fields } = props;

  const { data: session } = useSession();
  const profile = session?.googleProfile ?? null;

  const profileContentTitle =
    fields?.profileContentTitle?.jsonValue?.value || ProfileTabStatics.profileContentTitle;
  const profileTitle = fields?.profileTitle?.jsonValue?.value || ProfileTabStatics.profileTitle;
  const profileDepartment =
    fields?.profileDepartment?.jsonValue?.value || ProfileTabStatics.profileDepartment;
  const profileAssociateId =
    fields?.profileAssociateId?.jsonValue?.value || ProfileTabStatics.profileAssociateId;
  const profileBusinessUnit =
    fields?.profileBusinessUnit?.jsonValue?.value || ProfileTabStatics.profileBusinessUnit;
  const profileCompanyCode =
    fields?.profileCompanyCode?.jsonValue?.value || ProfileTabStatics.profileCompanyCode;
  const profileManager =
    fields?.profileManager?.jsonValue?.value || ProfileTabStatics.profileManager;
  const profileEmail = fields?.profileEmail?.jsonValue?.value || ProfileTabStatics.profileEmail;
  const profileLocationTitle =
    fields?.profileLocationTitle?.jsonValue?.value || ProfileTabStatics.profileLocationTitle;
  const profileWorkplace =
    fields?.profileWorkplace?.jsonValue?.value || ProfileTabStatics.profileWorkplace;
  const profileCity = fields?.profileCity?.jsonValue?.value || ProfileTabStatics.profileCity;
  const profileState = fields?.profileState?.jsonValue?.value || ProfileTabStatics.profileState;

  const data = useMemo(() => {
    const organization = profile?.organizations?.[0];
    const managerRelation = profile?.relations?.find((relation) => relation.type === 'manager');
    return {
      title: organization?.title || '-',
      department: organization?.department || '-',
      associateId: profile?.userInfo?.employeeNumber || '-',
      homeOrganization: organization?.name || '-',
      companyCode: profile?.userInfo?.companyCode || '-',
      businessUnit: profile?.userInfo?.businessUnitDescription || '-',
      manager: managerRelation?.value || '-',
      email: profile?.primaryEmail || '-',
      workplace: organization?.location || '-',
      city: profile?.userInfo?.city || '-',
      state: profile?.userInfo?.state || '-',
    };
  }, [profile]);

  return (
    <div
      className={cx('profile-tab', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className="flex flex-col gap-8">
        <div className={cx('profile-tab__content-container', 'flex flex-col')}>
          <h3>{profileContentTitle}</h3>
          <div className={cx('profile-tab__content', 'grid gap-4')}>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="WorkOutlineOutlined" />
                <h4>{profileTitle}</h4>
              </div>
              <span>{data.title}</span>
            </div>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="BusinessOutlined" />
                <h4>{profileDepartment}</h4>
              </div>
              <span>{data.department}</span>
            </div>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="BadgeOutlined" />
                <h4>{profileAssociateId}</h4>
              </div>
              <span>{data.associateId}</span>
            </div>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="BadgeOutlined" />
                <h4>{profileCompanyCode}</h4>
              </div>
              <span>{data.companyCode}</span>
            </div>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="LanOutlined" />
                <h4>{profileBusinessUnit}</h4>
              </div>
              <span>{data.businessUnit}</span>
            </div>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="PeopleOutlineOutlined" />
                <h4>{profileManager}</h4>
              </div>
              {data.manager && data.manager.includes('@') ? (
                <a href={`mailto:${data.manager}`}>{data.manager}</a>
              ) : (
                <span>{data.manager}</span>
              )}
            </div>
            <div className={cx('profile-tab__contact-role', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="EmailOutlined" />
                <h4>{profileEmail}</h4>
              </div>
              {data.email && data.email.includes('@') ? (
                <a href={`mailto:${data.email}`}>{data.email}</a>
              ) : (
                <span>{data.email}</span>
              )}
            </div>
          </div>
        </div>
        <div className={cx('profile-tab__content-container', 'flex flex-col')}>
          <h3>{profileLocationTitle}</h3>
          <div className={cx('profile-tab__content', 'grid gap-4')}>
            <div className={cx('profile-tab__location-info', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <h4>{profileWorkplace}</h4>
              </div>
              <span>{data.workplace}</span>
            </div>
            <div className={cx('profile-tab__location-info', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <h4>{profileCity}</h4>
              </div>
              <span>{data.city}</span>
            </div>
            <div className={cx('profile-tab__location-info', 'flex flex-col')}>
              <div className="flex gap-2 items-center">
                <h4>{profileState}</h4>
              </div>
              <span>{data.state}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default compose<ProfileTabProps>(withStyles())(ProfileTab);
