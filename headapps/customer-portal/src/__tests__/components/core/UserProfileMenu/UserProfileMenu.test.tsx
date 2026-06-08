import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfileMenu from 'components/core/UserProfileMenu/UserProfileMenu';
import { TEST_CASE_DATA_IDS } from '../../../../helpers/enums';
import type { IUserProfileMenuFields } from 'components/core/UserProfileMenu/UserProfileMenu.type';

// Mock the variant component
vi.mock('components/core/UserProfileMenu/variants/UserProfileMenuDefault.variant', () => ({
  UserProfileMenuDefaultVariant: ({ testId, fields }: { testId: string; fields: IUserProfileMenuFields }) => (
    <div data-testid={testId}>UserProfileMenuDefaultVariant</div>
  ),
}));

describe('UserProfileMenu', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const mockFields: IUserProfileMenuFields = {
    CompanyIcon: {
      value: {
        src: '/account-logo.png',
        alt: 'Account Logo',
        width: 16,
        height: 16,
      },
    },
    SectionTitle: {
      value: 'Account Selection',
    },
    AccountInfo: {
      value: 'Select an account',
    },
    ProfileIcon: {
      value: {
        src: '/profile-icon.png',
        alt: 'Profile Icon',
        width: 16,
        height: 16,
      },
    },
    ProfileUrl: {
      value: {
        href: '/profile',
        text: 'Profile Settings',
      },
    },
    SignOutIcon: {
      value: {
        src: '/signout-icon.png',
        alt: 'Sign Out Icon',
        width: 16,
        height: 16,
      },
    },
    SignOutText: {
      value: 'Sign Out',
    },
    AccountAddress: {
      value: 'Account Address',
    },
  };

  it('should render component with test id', () => {
    render(<UserProfileMenu fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
  });

  it('should pass fields and params to variant component', () => {
    render(<UserProfileMenu fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU);
    expect(variant).toBeInTheDocument();
    expect(variant.textContent).toBe('UserProfileMenuDefaultVariant');
  });

  it('should handle empty fields', () => {
    const emptyLinkValue = { href: '', text: '', linktype: 'internal' as const, anchor: '', class: '', title: '', target: '', querystring: '', id: '' };
    const emptyFields: IUserProfileMenuFields = {
      CompanyIcon: { value: { src: '', alt: '', width: '0', height: '0' } },
      SectionTitle: { value: '' },
      AccountInfo: { value: '' },
      ProfileIcon: { value: { src: '', alt: '', width: '0', height: '0' } },
      ProfileUrl: { value: emptyLinkValue },
      SignOutIcon: { value: { src: '', alt: '', width: '0', height: '0' } },
      SignOutText: { value: '' },
      AccountAddress: { value: '' },
    };

    render(<UserProfileMenu fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
  });

  it('should handle missing fields gracefully', () => {
    const partialFields = {
      SectionHeading: { value: 'Account Selection' },
    } as unknown as IUserProfileMenuFields;

    render(<UserProfileMenu fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_PROFILE_MENU)).toBeInTheDocument();
  });
});



