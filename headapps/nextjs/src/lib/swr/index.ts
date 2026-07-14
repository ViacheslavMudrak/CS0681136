/**
 * Shared SWR utilities for consistent data fetching across the application
 */

export { swrFetcher } from './fetcher';
export {
  useSwr,
  useSwrWithAuth,
  defaultSwrConfig,
  type UseSwrOptions,
  type UseSwrWithAuthOptions,
} from './use-swr-hook';
