import { NextApiRequest, NextApiResponse } from 'next';

export interface AuthErrorResponse {
  success: false;
  message: string;
}

/**
 * Middleware to validate API Key from request header "x-api-key".
 * In non-production environments, the request passes through.
 * In production, validates the API key against process.env.API_ROUTE_SECRET.
 *
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @returns true if authorized, false otherwise
 */
export function validateApiKey(req: NextApiRequest, res: NextApiResponse): boolean {
  // Allow all requests in non-production environments
  if (process.env.NEXT_PUBLIC_ENV === 'LOCAL') {
    return true;
  }

  // In production, validate the API key
  const apiKey = req.headers['x-api-key'] as string | undefined;
  const secretKey = process.env.API_ROUTE_SECRET;

  if (!apiKey || apiKey !== secretKey) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API Key',
    } as AuthErrorResponse);
    return false;
  }

  return true;
}
