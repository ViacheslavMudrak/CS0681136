import { JSX, useState, useEffect, useCallback } from 'react';
import { useI18n } from 'next-localization';
import {
  ComponentRendering,
  GetComponentServerProps,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import classNames from 'classnames/bind';

import Avatar from '@mui/material/Avatar';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import type { GoogleProfileData } from 'ts/google';
import { KeyPeopleComponentProps, KeyPeopleComponentVariant } from './KeyPeopleComponent.types';

import styles from './KeyPeopleComponent.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

const KeyPeopleComponent = (
  props: KeyPeopleComponentProps & { variant?: KeyPeopleComponentVariant }
): JSX.Element | null => {
  const { t } = useI18n();
  const { page } = useSitecore();
  const { fields, rendering, variant = 'LightTheme' } = props;
  const datasource = fields;
  const leaders = datasource.peopleSelection;
  const googleProfiles = props.googleProfiles ?? {};

  const showAll = rendering.params?.showAll === '1';
  const showDescription = rendering.params?.showDescription === '1';
  const showLocation = rendering.params?.showLocation === '1';
  const showPhoneNumber = rendering.params?.showPhoneNumber === '1';

  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    !showAll || isMobile
      ? {
          align: 'start',
          loop: false,
          slidesToScroll: 1,
          dragFree: false,
          containScroll: 'trimSnaps',
        }
      : { active: false } // Disable embla for showAll on desktop
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      if (!api) return;

      const selectedIndex = api.selectedScrollSnap();
      const totalSlides = api.slideNodes().length;
      setCurrentSlide(selectedIndex);
      setItemsCount(totalSlides);

      const lastSnapIndex = api.scrollSnapList().length - 1;
      setAtStart(selectedIndex === 0);
      setAtEnd(selectedIndex >= lastSnapIndex);

      const slidesPerPage = isMobile ? 1 : 4;
      const totalPages = Math.ceil(totalSlides / slidesPerPage);
      const newActivePage = Math.round(selectedIndex / slidesPerPage);
      setActivePage(newActivePage);
      setPageCount(totalPages);
    },
    [isMobile]
  );

  useEffect(() => {
    if (!emblaApi || (showAll && !isMobile)) return;

    emblaApi.reInit({
      align: 'start',
      loop: false,
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    });
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect, isMobile, showAll]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const scrollTo = (index: number) => {
    if (!emblaApi) return;
    const targetIndex = isMobile ? index : index * 4;
    const maxIndex = emblaApi.scrollSnapList().length - 1;
    emblaApi.scrollTo(Math.min(targetIndex, maxIndex));
    setActivePage(index);
  };

  if (!page.mode.isEditing && (!leaders || leaders.length === 0)) {
    return null;
  }

  return (
    <div
      className={cx(
        'key-people',
        'component',
        variant === 'DarkTheme' && 'key-people--dark-theme',
        props.stylesSXA
      )}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('key-people__container', 'container')}>
        <div className={cx('key-people__grid', '')}>
          <div className={cx('key-people__header', 'flex flex-col md:flex-col md:justify-between')}>
            <Text field={datasource.headlineText} tag="h2" />
          </div>
          <div className={cx('key-people__controls', 'flex items-center md:justify-center gap-6')}>
            {((!showAll && !isMobile && leaders.length > 4) || isMobile) && (
              <div className="flex w-full justify-between md:justify-end gap-4 items-center">
                <span className={cx('key-people__slide-text', 'text-sm flex md:hidden p-3')}>
                  {currentSlide + 1} {t('KeyPeopleOfLabel') || 'of'} {itemsCount}
                </span>
                <div className="flex justify-end gap-4">
                  <button onClick={scrollPrev} disabled={atStart}>
                    <MaterialIcon name="ChevronLeft" className={cx(atStart)} />
                  </button>
                  <button onClick={scrollNext} disabled={atEnd}>
                    <MaterialIcon name="ChevronRight" className={cx(atEnd)} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className={cx('key-people__wrapper', {
              'embla__viewport overflow-hidden': !showAll || isMobile,
              'flex flex-wrap': showAll && !isMobile,
            })}
            ref={!showAll || isMobile ? emblaRef : undefined}
          >
            <div
              className={cx('key-people__leader-container', 'flex gap-4 pb-6', {
                embla__container: !showAll || isMobile,
                'flex-wrap justify-start': showAll && !isMobile,
              })}
            >
              {leaders
                .filter((leader) => !!leader.fields?.emailAccount)
                .map((leader, index) => {
                  const email = leader.fields.emailAccount.value?.trim().toLowerCase() ?? '';
                  const googleProfile = googleProfiles[email] ?? null;

                  const resolvedName =
                    leader.fields.overrideName.value ||
                    googleProfile?.name?.displayName ||
                    leader.displayName;
                  const resolvedJobTitle =
                    leader.fields.overrideJobTitle.value ||
                    googleProfile?.organizations?.[0]?.title ||
                    '';
                  const resolvedEmail =
                    leader.fields.overrideEmail.value ||
                    googleProfile?.emailAddresses?.[0]?.value ||
                    email;
                  const resolvedPhone =
                    leader.fields.overridePhoneNumber.value ||
                    googleProfile?.phoneNumbers?.[0]?.value ||
                    '';
                  const orgLocation = googleProfile?.organizations?.[0]?.location;
                  const addressRegion = googleProfile?.addresses?.[0]?.region;
                  const resolvedLocation =
                    leader.fields.overrideLocation.value ||
                    [orgLocation, addressRegion].filter(Boolean).join(', ');
                  const resolvedImageUrl =
                    leader.fields.overrideProfileImage.value?.src ||
                    googleProfile?.photos?.[0]?.url ||
                    '';

                  return (
                    <div
                      key={leader.id ?? index}
                      className={cx('key-people__leader', 'flex flex-col bg-white gap-2', {
                        'flex-[0_0_85%]': isMobile,
                        'flex-[0_0_calc(25%-0.75rem)]': !isMobile && !showAll,
                        'all-show flex-[0_1_24%]': !isMobile && showAll,
                      })}
                    >
                      <div className={cx('key-people__image', '')}>
                        {resolvedImageUrl ? (
                          <img
                            src={resolvedImageUrl}
                            alt={resolvedName}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Avatar
                            className={cx('key-people__avatar')}
                            alt={resolvedName}
                            sx={{ width: 154, height: 154 }}
                          >
                            {googleProfile?.name?.givenName?.[0] || ''}
                            {googleProfile?.name?.familyName?.[0] || ''}
                          </Avatar>
                        )}
                      </div>
                      <h3>{resolvedName}</h3>
                      <h4>{resolvedJobTitle}</h4>
                      {showDescription && leader.fields.description.value && (
                        <p>{leader.fields.description.value}</p>
                      )}
                      <div
                        className={cx('key-people__contact-info', 'mt-auto flex flex-col gap-2')}
                      >
                        <div
                          className={cx(
                            'key-people__email',
                            'flex justify-center items-center gap-2'
                          )}
                        >
                          <MaterialIcon name="Email" />
                          <a
                            className={cx('key-people__email-url')}
                            href={`mailto:${resolvedEmail}`}
                          >
                            {resolvedEmail}
                          </a>
                        </div>
                        {showPhoneNumber && resolvedPhone && (
                          <div className={cx('key-people__phone', 'flex justify-center gap-2')}>
                            <MaterialIcon name="Call" />
                            <a href={`tel:${resolvedPhone}`}>{resolvedPhone}</a>
                          </div>
                        )}
                        {showLocation && resolvedLocation && (
                          <div className={cx('key-people__location', 'flex justify-center gap-2')}>
                            <MaterialIcon name="FmdGood" />
                            <span>{resolvedLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        {!showAll && !isMobile && pageCount > 1 && (
          <div className={cx('key-people__dots', 'flex justify-center gap-2 mt-6')}>
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cx(
                  'key-people__dot',
                  'w-3 h-3 rounded-full transition-all duration-200 cursor-pointer',
                  index === activePage ? 'key-people__dot--active' : 'key-people__dot--inactive'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const LightTheme = compose<KeyPeopleComponentProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(KeyPeopleComponent);

export const DarkTheme = compose<KeyPeopleComponentProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <KeyPeopleComponent {...props} variant="DarkTheme" />);

type RawKeyPerson = {
  fields?: {
    emailAccount?: { value?: string };
  };
};

export const getComponentServerProps: GetComponentServerProps = async (
  rendering: ComponentRendering
) => {
  const { googleProfileService } = await import('lib/google/services/google-profile-service');

  const peopleSelection = (rendering.fields?.peopleSelection as RawKeyPerson[]) ?? [];

  const emails = peopleSelection
    .map((person) => person.fields?.emailAccount?.value?.trim().toLowerCase())
    .filter((email): email is string => !!email);

  const profileEntries = await Promise.all(
    emails.map(async (email): Promise<[string, GoogleProfileData | null]> => {
      const profile = await googleProfileService.fetchExtendedProfile(email);
      return [email, profile];
    })
  );

  return JSON.parse(JSON.stringify({ googleProfiles: Object.fromEntries(profileEntries) }));
};

export default LightTheme;
