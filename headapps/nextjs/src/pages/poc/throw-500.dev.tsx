import type { GetServerSideProps, NextPage } from 'next';
import type { JSX } from 'react';
import { log } from 'src/util/helpers/log-helper';

/**
 * Verification-only page for IE-1524. Forces a runtime throw in
 * getServerSideProps so we can confirm Next.js serves the designed
 * Sitecore 500 page on the deployed environment. Remove this file
 * after verification.
 */
const ThrowFiveHundred: NextPage = (): JSX.Element => <></>;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  log('INFO', 'ThrowFiveHundred', 'pre-throw diagnostics', {
    referrer: req.headers['referer'] ?? null,
  });
  throw new Error('IE-1524 verification — forced 500');
};

export default ThrowFiveHundred;
