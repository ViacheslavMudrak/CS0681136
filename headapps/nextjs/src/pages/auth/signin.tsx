import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn, getProviders } from 'next-auth/react';
import { useI18n } from 'next-localization';
import { useRouter } from 'next/router';
import { authOptions } from '../api/auth/[...nextauth]';
// import { Button } from '@mui/material';
// import { Google as GoogleIcon } from '@mui/icons-material';

// CSS module styles
import styles from './Signin.module.scss';
import { Box, TextField } from '@mui/material';

const SignInStatics = {
  signInLargeText1: 'Vocation.',
  signInLargeText2: 'Community.',
  signInLargeText3: 'Ministry.',
  signInHeader: 'Sign in to your workspace',
  signInDescription: 'Use your Ascension Google account to continue.',
  signInGoogleButtonText: 'Sign in with Google',
  signInMockUserHeader: 'Mock User Sign In',
  signInMockButtonText: 'Sign in as Mock User (Dev Only)',
};

const cx = classNames.bind(styles);

interface SignInPageProps {
  providers: Record<string, unknown> | null;
}

export default function SignIn({ providers }: SignInPageProps) {
  /**
   * Use client-side state to avoid hydration mismatch.
   * Check if mock provider exists in providers list instead of env vars.
   */
  const [isMockEnabled, setIsMockEnabled] = useState(false);
  const [mockEmail, setMockEmail] = useState('');
  const [mockGroupEmail, setMockGroupEmail] = useState('');
  const [mockCompanyCode, setMockCompanyCode] = useState('');
  const [mockBusinessUnit, setMockBusinessUnit] = useState('');

  const router = useRouter();
  const silentAttempted = useRef(false);

  /**
   * Validate callbackUrl is a safe, relative path within the app.
   * Rejects absolute URLs, protocol-relative URLs, and other off-site redirects.
   */
  const callbackUrl = (() => {
    const raw = (router.query.callbackUrl as string) || '/';
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) {
      return '/';
    }
    return raw;
  })();

  /**
   * Silent auth: if ?silent=true, attempt Google OAuth with prompt=none automatically.
   * If Google can't authenticate silently (no session, consent required), it redirects
   * back here with an error param — in that case we just show the normal sign-in page.
   *
   * Skip silent auth entirely if the user just explicitly logged out (justLoggedOut
   * sessionStorage flag) so they aren't auto-signed back in via the middleware
   * silent=true redirect. The flag is scoped to the tab and cleared on next manual
   * sign-in.
   */
  useEffect(() => {
    const isSilent = router.query.silent === 'true';
    const hasError = !!router.query.error;
    const justLoggedOut = sessionStorage.getItem('justLoggedOut') === '1';

    if (isSilent && !hasError && !silentAttempted.current && !justLoggedOut) {
      silentAttempted.current = true;
      signIn('google', { callbackUrl }, { prompt: 'none' });
    }
  }, [router.query.silent, router.query.error, callbackUrl]);

  useEffect(() => {
    // Check if 'mock' provider exists in the providers list
    const hasMockProvider = providers?.mock !== undefined;
    setIsMockEnabled(hasMockProvider);
  }, [providers]);

  const handleSignIn = (providerId?: string) => {
    if (providers && Object.keys(providers).length > 0) {
      const id = providerId || Object.keys(providers)[0]; // Use provided ID or first provider

      /** Manual sign-in clears the post-logout silent-SSO block. */
      sessionStorage.removeItem('justLoggedOut');

      /**
       * If we arrived here from an explicit logout (?reauth=true), force the
       * account chooser so the next user on a shared workstation cannot silently
       * re-authenticate as the previous user.
       *
       * The `error=Callback` recovery path (stale/missing refresh token) does
       * NOT force `prompt=consent` — Google Workspace marks this OAuth client as
       * a Trusted app, so Google honors that trust and silently re-issues tokens
       * (refresh token included, since `access_type=offline` is set on the
       * provider). Forcing consent here conflicted with the Workspace trust
       * setting and caused the consent screen to appear under corporate proxies.
       */
      const isReauth = router.query.reauth === 'true';

      const authParams: Record<string, string> = isReauth ? { prompt: 'select_account' } : {};

      signIn(id, { callbackUrl }, authParams);
    }
  };

  const handleMockSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sessionStorage.removeItem('justLoggedOut');
    /**
     * If email is empty, signIn will use the fallback from authorize function.
     * For CredentialsProvider, credentials are passed directly in the options object.
     * NextAuth will automatically redirect to callbackUrl after successful sign-in.
     */
    const emailValue = mockEmail.trim();
    const groupEmailValue = mockGroupEmail.trim();
    const companyCodeValue = mockCompanyCode.trim();
    const businessUnitValue = mockBusinessUnit.trim();

    signIn('mock', {
      callbackUrl,
      ...(emailValue && { email: emailValue }), // Only include email if provided (empty triggers fallback)
      ...(groupEmailValue && { groupEmail: groupEmailValue }), // Only include groupEmail if provided
      ...(companyCodeValue && { companyCode: companyCodeValue }), // Only include companyCode if provided
      ...(businessUnitValue && { businessUnit: businessUnitValue }), // Only include businessUnit if provided
    });
  };

  const { t } = useI18n();
  const signInLargeText1 = t('SignInLargeText1') || SignInStatics.signInLargeText1;
  const signInLargeText2 = t('SignInLargeText1') || SignInStatics.signInLargeText2;
  const signInLargeText3 = t('SignInLargeText1') || SignInStatics.signInLargeText3;
  const signInHeader = t('SignInLargeText1') || SignInStatics.signInHeader;
  const signInDescription = t('SignInLargeText1') || SignInStatics.signInDescription;
  const signInGoogleButtonText = t('SignInLargeText1') || SignInStatics.signInGoogleButtonText;
  const signInMockUserHeader = t('SignInLargeText1') || SignInStatics.signInMockUserHeader;
  const signInMockButtonText = t('SignInLargeText1') || SignInStatics.signInMockButtonText;

  return (
    <div className={cx('asc-signin', 'flex')}>
      <div className={cx('asc-signin__left-column', 'md:flex-[0_0_50%] justify-end items-center')}>
        <div className={cx('asc-signin__left-column-content', 'flex flex-col')}>
          <span>{signInLargeText1}</span>
          <span>{signInLargeText2}</span>
          <span>{signInLargeText3}</span>
        </div>
        <div className={cx('asc-signin__left-column-image')}></div>
      </div>
      <div
        className={cx(
          'asc-signin__right-column',
          'flex md:flex-[0_0_50%] justify-start items-center'
        )}
      >
        <div
          className={cx(
            'asc-signin__right-column-content',
            'flex justify-between md:justify-center flex-col gap-6'
          )}
        >
          <div className={cx('asc-signin__right-column-text', 'flex flex-col gap-6')}>
            <img src="/assets/OurAscensionLogo.svg" alt="Our Ascension" />
            <h2>{signInHeader}</h2>
            <p>{signInDescription}</p>
          </div>
          <button
            className={cx('asc-signin__google-signin-btn')}
            onClick={() => handleSignIn('google')}
          >
            <img src="/assets/GoogleIconColor.svg" alt="Our Ascension" />
            <span>{signInGoogleButtonText}</span>
          </button>

          {isMockEnabled && (
            <>
              <h3 className={cx('asc-signin__mock-header')}>{signInMockUserHeader}</h3>
              <Box
                component="form"
                onSubmit={handleMockSignIn}
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <TextField
                  type="email"
                  label="Email (optional)"
                  placeholder="mock.user@example.com"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Leave empty to use default mock user email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderColor: 'warning.main',
                    },
                  }}
                />

                <TextField
                  type="email"
                  label="Group email (optional)"
                  placeholder="atexec@ascension.org (optional)"
                  value={mockGroupEmail}
                  onChange={(e) => setMockGroupEmail(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Leave empty to use default mock group email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderColor: 'warning.main',
                    },
                  }}
                />

                <TextField
                  type="text"
                  label="Company code (optional)"
                  placeholder="AscTech (optional)"
                  value={mockCompanyCode}
                  onChange={(e) => setMockCompanyCode(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Leave empty to use default mock company code"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderColor: 'warning.main',
                    },
                  }}
                />

                <TextField
                  type="text"
                  label="Business unit (optional)"
                  placeholder="66008 (optional)"
                  value={mockBusinessUnit}
                  onChange={(e) => setMockBusinessUnit(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Leave empty to use default mock business unit"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderColor: 'warning.main',
                    },
                  }}
                />
                <div>
                  <button
                    type="submit"
                    className={cx('asc-signin__mock-btn', 'asc-btn asc-btn--primary')}
                  >
                    {signInMockButtonText}
                  </button>
                </div>
              </Box>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  /**
   * When `error=Callback` is in the query string, the user has a session but
   * needs to re-consent (e.g. expired token with no refresh token, or Google
   * flagged interaction_required). Do NOT redirect them home — they must reach
   * the UI so `handleSignIn` can trigger the consent retry flow.
   */
  const needsConsentRetry = context.query.error === 'Callback';

  if (session && !needsConsentRetry) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
};
