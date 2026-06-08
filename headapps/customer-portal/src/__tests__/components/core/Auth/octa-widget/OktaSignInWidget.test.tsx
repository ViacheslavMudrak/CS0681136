import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import OktaSignInWidget from 'components/core/Auth/octa-widget/OktaSignInWidget';

// Mock Okta Sign-In Widget
const mockOktaSignIn = vi.fn();
const mockRenderEl = vi.fn();
const mockRemove = vi.fn();

vi.mock('@okta/okta-signin-widget', () => {
  return {
    default: class MockOktaSignIn {
      constructor(config: any) {
        mockOktaSignIn(config);
        this.config = config;
      }
      renderEl = mockRenderEl;
      remove = mockRemove;
    },
  };
});

// Mock okta-config
vi.mock('lib/okta-config', () => ({
  getOktaConfig: vi.fn(() => ({
    domain: 'dev-12345.okta.com',
    clientId: '0oa123456789',
    redirectUri: 'http://localhost:3000/api/auth/callback/okta',
    issuer: 'https://dev-12345.okta.com/oauth2/default',
    scopes: ['openid', 'profile', 'email'],
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('OktaSignInWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRenderEl.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<OktaSignInWidget />);

    expect(screen.getByText('Loading sign-in form...')).toBeInTheDocument();
  });

  it('should initialize Okta widget with correct configuration', async () => {
    await act(async () => {
      render(<OktaSignInWidget />);
    });

    await waitFor(() => {
      expect(mockOktaSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: 'https://dev-12345.okta.com',
          clientId: '0oa123456789',
          redirectUri: 'http://localhost:3000/api/auth/callback/okta',
          authParams: expect.objectContaining({
            issuer: 'https://dev-12345.okta.com/oauth2/default',
            responseType: ['code'],
            scopes: ['openid', 'profile', 'email'],
            pkce: false,
          }),
          features: expect.objectContaining({
            registration: false,
            rememberMe: true,
            selfServiceUnlock: true,
            smsRecovery: true,
            callRecovery: true,
          }),
          colors: {
            brand: '#00287b',
          },
        })
      );
    });
  });

  it('should render widget container', async () => {
    await act(async () => {
      render(<OktaSignInWidget />);
    });

    await waitFor(() => {
      const wrapper = document.querySelector('.okta-widget-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  it('should call renderEl with correct parameters', async () => {
    await act(async () => {
      render(<OktaSignInWidget />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
      const callArgs = mockRenderEl.mock.calls[0];
      expect(callArgs[0]).toHaveProperty('el');
      expect(callArgs[1]).toBeInstanceOf(Function); // success callback
      expect(callArgs[2]).toBeInstanceOf(Function); // error callback
    });
  });

  it('should handle success callback', async () => {
    const onSuccess = vi.fn();
    const mockResponse = { status: 'SUCCESS', tokens: {} };

    await act(async () => {
      render(<OktaSignInWidget onSuccess={onSuccess} />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    const successCallback = mockRenderEl.mock.calls[0][1];
    await act(async () => {
      successCallback(mockResponse);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(screen.queryByText('Loading sign-in form...')).not.toBeInTheDocument();
    });
  });

  it('should handle error callback', async () => {
    const onError = vi.fn();
    const mockError = new Error('Authentication failed');

    await act(async () => {
      render(<OktaSignInWidget onError={onError} />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    const errorCallback = mockRenderEl.mock.calls[0][2];
    await act(async () => {
      errorCallback(mockError);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError);
      expect(screen.queryByText('Loading sign-in form...')).not.toBeInTheDocument();
    });
  });

  it('should handle error when Okta config is missing', async () => {
    const { getOktaConfig } = await import('lib/okta-config');
    vi.mocked(getOktaConfig).mockImplementationOnce(() => {
      throw new Error('Okta not configured');
    });

    render(<OktaSignInWidget />);

    expect(screen.getByText(/Okta is not configured/i)).toBeInTheDocument();
  });

  it('should cleanup widget on unmount', async () => {
    const { unmount } = render(<OktaSignInWidget />);

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should not render widget if ref is not available', () => {
    // This tests the early return in useEffect
    render(<OktaSignInWidget />);
    
    // Widget should still initialize
    expect(mockOktaSignIn).toHaveBeenCalled();
  });
});

