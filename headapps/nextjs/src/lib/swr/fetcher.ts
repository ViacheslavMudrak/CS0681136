/**
 * Generic SWR fetcher with error handling
 * Can be used with any API endpoint
 */
export async function swrFetcher<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    const errorMessage = errorData.error?.message || errorData.error || response.statusText;

    // Create error with additional context for better debugging
    const error = new Error(errorMessage) as Error & {
      status?: number;
      statusText?: string;
      url?: string;
      errorData?: unknown;
    };

    error.status = response.status;
    error.statusText = response.statusText;
    error.url = url;
    error.errorData = errorData;

    // Log 500 errors and other server errors client-side
    if (response.status >= 500) {
      console.error('[SWR Fetcher] Server Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorData,
        timestamp: new Date().toISOString(),
      });
    }

    throw error;
  }

  return response.json();
}
