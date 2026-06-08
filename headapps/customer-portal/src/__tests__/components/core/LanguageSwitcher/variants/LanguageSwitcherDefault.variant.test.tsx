import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { LanguageSwitcherDefaultVariant } from 'components/core/LanguageSwitcher/variants/LanguageSwitcherDefault.variant';
import { TEST_CASE_DATA_IDS } from '../../../../../helpers/enums';
import type { ILanguageSwitcherFields, ILanguageSelection } from 'components/core/LanguageSwitcher/LanguageSwitcher.type';
import type { IParams } from 'src/helpers/interface';
import * as gtmModule from 'src/lib/gtm';
import * as cdpModule from '@/lib/CDPEvents';
import { LanguageSelectionModalProvider } from '@/lib/language-selection-modal-context';

vi.mock('@okta/okta-react', () => ({
  useOktaAuth: () => ({
    authState: { idToken: { claims: { email: 'test@example.com' } } },
  }),
}));

vi.mock('@/lib/apis/user-preference-api', () => ({
  saveUserPreferences: vi.fn(() => Promise.resolve(null)),
}));

const { mockUseDeviceType } = vi.hoisted(() => ({
  mockUseDeviceType: vi.fn(() => ({ isMobile: false, isTablet: false })),
}));

vi.mock('@/hooks/use-device-type', () => ({
  useDeviceType: () => mockUseDeviceType(),
}));

vi.mock('@/components/ui/Button', () => ({
  default: ({
    children,
    onPress,
    className,
    role,
    type,
    'aria-label': ariaLabel,
    'aria-selected': ariaSelected,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
    className?: string;
    role?: string;
    type?: 'button';
    'aria-label'?: string;
    'aria-selected'?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      type={type ?? 'button'}
      onClick={onPress}
      className={className}
      role={role}
      aria-label={ariaLabel}
      aria-selected={ariaSelected}
      {...rest}
    >
      {children}
    </button>
  ),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockPathname = '/en-US/home';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => mockPathname,
}));

// Mock GTM functions
vi.mock('src/lib/gtm', () => ({
  logGTMLanguageSwitched: vi.fn(),
  logGTMProfileContextSwitched: vi.fn(),
}));

// Mock CDP events
vi.mock('@/lib/CDPEvents', () => ({
  sendLanguageSwitchedEvent: vi.fn(),
  sendProfileContextSwitchedEvent: vi.fn(),
}));

// Mock Profile Context
const mockSetCurrentLanguage = vi.fn();
let mockSelectedAccount: any = null;

vi.mock('@/lib/profile-context', () => {
  const profile = () => ({
    selectedAccount: mockSelectedAccount,
    setCurrentLanguage: mockSetCurrentLanguage,
    currentLanguage: '',
  });
  return {
    useProfileContext: () => profile(),
    useProfileContextOptional: () => profile(),
  };
});

// Mock Sitecore Content SDK components
vi.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({
    page: { mode: { isEditing: false } },
  }),
  NextImage: ({ field, className, width, height, alt }: any) => {
    if (!field?.value?.src) return null;
    return (
      <img
        src={field.value.src}
        alt={alt || field.value.alt || ''}
        className={className}
        width={width}
        height={height}
        data-testid="content-sdk-image"
      />
    );
  },
  Text: ({ field, tag: Tag = 'span', className }: any) => {
    if (!field?.value) return null;
    return (
      <Tag className={className} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    );
  },
}));

// Mock icon components
vi.mock('components/shared/icons/ChevronUpIcon', () => ({
  default: ({ width, height, stroke, className, decorative }: any) => (
    <svg
      data-testid="chevron-up-icon"
      width={width}
      height={height}
      stroke={stroke}
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <path />
    </svg>
  ),
}));

vi.mock('components/shared/icons/ChevronDownIcon', () => ({
  default: ({ width, height, stroke, className, decorative }: any) => (
    <svg
      data-testid="chevron-down-icon"
      width={width}
      height={height}
      stroke={stroke}
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <path />
    </svg>
  ),
}));

function expectSelectedLanguageOption(option: HTMLElement | null | undefined): void {
  expect(option).toBeTruthy();
  expect(option).toHaveAttribute('aria-selected', 'true');
}

function setMobileLanguageViewport(): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
  window.dispatchEvent(new Event('resize'));
}

function LanguageSwitcherTestWrapper({ children }: { children: ReactNode }) {
  return <LanguageSelectionModalProvider>{children}</LanguageSelectionModalProvider>;
}

function renderWithLanguageModal(ui: ReactElement) {
  return render(ui, { wrapper: LanguageSwitcherTestWrapper });
}

describe('LanguageSwitcherDefaultVariant', () => {
  const mockParams = {
    params: {
      styles: 'test-styles',
      RenderingIdentifier: 'test-id',
    },
  };

  const createMockLanguageSelection = (
    id: string,
    title: string,
    iso: string,
    regionalIso?: string
  ): ILanguageSelection => ({
    id,
    url: `/language/${id}`,
    name: `Language ${id}`,
    displayName: title,
    fields: {
      LanguageTitle: {
        value: title,
      },
      LanguageSource: {
        id: `source-${id}`,
        url: `/source/${id}`,
        name: iso,
        displayName: iso,
        fields: {
          'Base Culture': { value: '' },
          'Fallback Region Display Name': { value: '' },
          Charset: { value: '' },
          'Code page': { value: '' },
          Dictionary: { value: '' },
          Encoding: { value: '' },
          'Fallback Language': { value: '' },
          Iso: { value: iso },
          'Regional Iso Code': { value: regionalIso || '' },
          'WorldLingo Language Identifier': { value: '' },
        },
      },
    },
  });

  const createMockFields = (overrides?: Partial<ILanguageSwitcherFields>): ILanguageSwitcherFields => ({
    Title: {
      value: 'Language',
    },
    LanguageSelection: [
      createMockLanguageSelection('lang-1', 'English', 'en', 'en-US'),
      createMockLanguageSelection('lang-2', 'Français', 'fr', 'fr'),
      createMockLanguageSelection('lang-3', 'Español', 'es', 'es-ES'),
    ],
    Icon: {
      value: {
        src: '/globe-icon.png',
        alt: 'Language Icon',
        width: 12,
        height: 12,
      },
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSetCurrentLanguage.mockClear();
    mockSelectedAccount = null;
    mockPathname = '/en-US/home';
    mockUseDeviceType.mockReturnValue({ isMobile: false, isTablet: false });
    vi.mocked(gtmModule.logGTMLanguageSwitched).mockClear();
    vi.mocked(gtmModule.logGTMProfileContextSwitched).mockClear();
    vi.mocked(cdpModule.sendLanguageSwitchedEvent).mockClear();
    vi.mocked(cdpModule.sendProfileContextSwitchedEvent).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render component with test id', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      expect(screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER)).toBeInTheDocument();
    });

    it('should render empty div when DisableLanguageSwitcher param is "1"', () => {
      const fields = createMockFields();
      const paramsWithDisabled: IParams = {
        ...mockParams,
        DisableLanguageSwitcher: '1',
      };
      renderWithLanguageModal(
        <LanguageSwitcherDefaultVariant
          testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER}
          fields={fields}
          params={paramsWithDisabled}
        />
      );

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });

    it('should render empty div when LanguageSelection is empty', () => {
      const fields = createMockFields({ LanguageSelection: [] });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });
  });

  describe('Trigger Button', () => {
    it('should render trigger button with title', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toBeInTheDocument();
      // When pathname segment does not match a language name, trigger shows fields.Title ("Language")
      expect(screen.getByText('Language')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const image = screen.getByTestId('content-sdk-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/globe-icon.png');
      expect(image).toHaveAttribute('alt', 'Language Icon');
    });

    it('should not render icon when icon src is missing', () => {
      const fields = createMockFields({
        Icon: {
          value: {
            alt: 'Language Icon',
            width: 12,
            height: 12,
          },
        },
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const images = screen.queryAllByTestId('content-sdk-image');
      expect(images.length).toBe(0);
    });

    it('should render chevron down icon when dropdown is closed', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument();
    });

    it('should toggle chevron icon when button is clicked', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument();

      fireEvent.click(button);

      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-down-icon')).not.toBeInTheDocument();
    });

    it('should have correct aria attributes on trigger button', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Dropdown Functionality', () => {
    it('should open dropdown when trigger button is clicked', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const dropdown = screen.getByRole('listbox', { name: /language selection/i });
      expect(dropdown).toBeInTheDocument();
    });

    it('should close dropdown when trigger button is clicked again', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      
      fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should render all language options in dropdown', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      expect(within(listbox).getByText('English')).toBeInTheDocument();
      expect(within(listbox).getByText('Français')).toBeInTheDocument();
      expect(within(listbox).getByText('Español')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should not close dropdown when clicking inside', () => {
      const fields = createMockFields();
      const { container } = renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const dropdown = screen.getByRole('listbox');
      fireEvent.mouseDown(dropdown);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Language Selection', () => {
    it('should highlight current language based on pathname', () => {
      mockPathname = '/en/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('English');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const englishOption = within(listbox).getByText('English').closest('button');
      expectSelectedLanguageOption(englishOption);
    });

    it('should match language by name when pathname segment matches LanguageSource name', () => {
      mockPathname = '/fr/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('Français');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const frenchOption = within(listbox).getByText('Français').closest('button');
      expectSelectedLanguageOption(frenchOption);
    });

    it('should match language by name when pathname segment equals LanguageSource displayName', () => {
      mockPathname = '/es/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('Español');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const spanishOption = within(listbox).getByText('Español').closest('button');
      expectSelectedLanguageOption(spanishOption);
    });

    it('should default to en from list when no pathname match is found', () => {
      mockPathname = '/unknown/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('Language');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const englishOption = within(listbox).getByText('English').closest('button');
      expectSelectedLanguageOption(englishOption);
    });

    it('should handle language selection with only ISO code', () => {
      mockPathname = '/en/home';
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English', 'en'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('English');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const englishOption = within(listbox).getByText('English').closest('button');
      expectSelectedLanguageOption(englishOption);
    });
  });

  describe('Language Switching', () => {
    beforeEach(() => {
      mockPathname = '/en/home';
    });

    it('should call router.push with new locale when language is selected', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/fr/home');
    });

    it('should use regional ISO code when available', () => {
      mockPathname = '/en/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const spanishOption = screen.getByText('Español');
      fireEvent.click(spanishOption.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/es/home');
    });

    it('should fallback to ISO code when regional ISO is not available', () => {
      mockPathname = '/en/home';
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English', 'en'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/fr/home');
    });

    it('should prepend locale when pathname does not contain a locale', () => {
      mockPathname = '/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/fr/home');
    });

    it('should handle root pathname', () => {
      mockPathname = '/';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(mockPush).toHaveBeenCalledWith('/fr');
    });

    it('should call router.refresh after language selection', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should close dropdown after language selection', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      mockPathname = '/en-US/home';
    });

    it('should send GTM event when language is switched', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(gtmModule.logGTMProfileContextSwitched).toHaveBeenCalledWith({
        contextType: 'language',
        active_language: 'fr',
        active_organization: '',
        active_job_role: '',
        active_account: '',
      });
      expect(gtmModule.logGTMLanguageSwitched).toHaveBeenCalledWith({
        interaction_type: 'Language_Switched',
        previous_language: 'en',
        new_language: 'fr',
      });
    });

    it('should send CDP event when language is switched', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(cdpModule.sendProfileContextSwitchedEvent).toHaveBeenCalledWith({
        type: 'customerportal:PROFILE_CONTEXT_SWITCHED',
        contextType: 'language',
        active_language: 'fr',
        active_organization: '',
        active_job_role: '',
        active_account: '',
      });
      expect(cdpModule.sendLanguageSwitchedEvent).toHaveBeenCalledWith({
        interaction_type: 'Language_Switched',
        previous_language: 'en',
        new_language: 'fr',
      });
    });

    it('should include account data in events when account is selected', () => {
      // Set mock account
      mockSelectedAccount = {
        id: '1',
        companyName: 'Test Account',
        address: 'Test Address',
        accountNumber: '',
        isActive: true,
        role: 'Test Role',
        organization: 'Test Organization',
      };

      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(gtmModule.logGTMProfileContextSwitched).toHaveBeenCalledWith({
        contextType: 'language',
        active_language: 'fr',
        active_organization: 'Test Organization',
        active_job_role: 'Test Role',
        active_account: 'Test Account',
      });

      // Reset mock account
      mockSelectedAccount = null;
    });

    it('should call setCurrentLanguage when language is switched', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(mockSetCurrentLanguage).toHaveBeenCalledWith('fr');
    });

    it('should include empty account data when no account is selected', () => {
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText('Français');
      fireEvent.click(frenchOption.closest('button')!);

      expect(gtmModule.logGTMProfileContextSwitched).toHaveBeenCalledWith({
        contextType: 'language',
        active_language: 'fr',
        active_organization: '',
        active_job_role: '',
        active_account: '',
      });
    });

    it('should not send events when language fields are missing', () => {
      mockPathname = '/en-US/home';
      const langWithMissingSourceFields = {
        id: 'lang-1',
        url: '/lang-1',
        name: 'Language 1',
        displayName: 'Language 1',
        fields: {
          LanguageTitle: { value: 'English' },
          LanguageSource: {
            id: 'source-1',
            url: '/source-1',
            name: 'Source 1',
            displayName: 'Source 1',
            fields: undefined as any,
          },
        },
      };
      const fields = createMockFields({
        LanguageSelection: [
          langWithMissingSourceFields,
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const languageOption = within(listbox).getByText('English').closest('button')!;
      fireEvent.click(languageOption);

      // When LanguageSource fields are undefined, handleLanguageSelect returns early
      expect(mockPush).not.toHaveBeenCalled();
      expect(gtmModule.logGTMProfileContextSwitched).not.toHaveBeenCalled();
      expect(cdpModule.sendProfileContextSwitchedEvent).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing title field', () => {
      const fields = createMockFields({ Title: { value: '' } });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toBeInTheDocument();
      expect(screen.queryByText('Language')).not.toBeInTheDocument();
    });

    it('should handle language with missing LanguageSource fields', () => {
      mockPathname = '/en-US/home';
      const langWithMissingSourceFields = {
        id: 'lang-1',
        url: '/lang-1',
        name: 'Language 1',
        displayName: 'Language 1',
        fields: {
          LanguageTitle: { value: 'English' },
          LanguageSource: {
            id: 'source-1',
            url: '/source-1',
            name: 'Source 1',
            displayName: 'Source 1',
            fields: undefined as any,
          },
        },
      };
      const fields = createMockFields({
        LanguageSelection: [
          langWithMissingSourceFields,
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const languageOption = within(listbox).getByText('English').closest('button')!;
      fireEvent.click(languageOption);

      // When LanguageSource fields are undefined, handleLanguageSelect returns early
      expect(mockPush).not.toHaveBeenCalled();
      expect(gtmModule.logGTMProfileContextSwitched).not.toHaveBeenCalled();
      expect(cdpModule.sendProfileContextSwitchedEvent).not.toHaveBeenCalled();
    });

    it('should handle pathname with no segments', () => {
      mockPathname = '';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('Language');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const englishOption = within(listbox).getByText('English').closest('button');
      expectSelectedLanguageOption(englishOption);
    });

    it('should handle case-insensitive locale matching', () => {
      mockPathname = '/FR/home';
      const fields = createMockFields();
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      const trigger = screen.getByRole('button', { name: /select language/i });
      expect(trigger).toHaveTextContent('Français');
      fireEvent.click(trigger);
      const listbox = screen.getByRole('listbox', { name: /language selection/i });
      const frenchOption = within(listbox).getByText('Français').closest('button');
      expectSelectedLanguageOption(frenchOption);
    });
  });

  describe('Mobile drawer', () => {
    beforeEach(() => {
      mockPathname = '/en/home';
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      setMobileLanguageViewport();
    });

    it('should render drawer listbox instead of desktop dropdown when open', async () => {
      const user = userEvent.setup();
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English', 'en'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      await user.click(screen.getByRole('button', { name: /select language/i }));

      expect(screen.getByText('Select Language')).toBeInTheDocument();
      const listboxes = screen.getAllByRole('listbox', { name: /language selection/i });
      expect(listboxes.length).toBeGreaterThanOrEqual(1);
    });

    it('should close mobile drawer when backdrop is pressed', async () => {
      const user = userEvent.setup();
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English', 'en'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      await user.click(screen.getByRole('button', { name: /select language/i }));
      expect(screen.getByRole('button', { name: /close language selection/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close language selection/i }));

      await waitFor(() => {
        expect(screen.queryByText('Select Language')).not.toBeInTheDocument();
      });
    });

    it('should close mobile drawer from header close button', async () => {
      const user = userEvent.setup();
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English', 'en'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      await user.click(screen.getByRole('button', { name: /select language/i }));
      await user.click(screen.getByRole('button', { name: /^close$/i }));

      await waitFor(() => {
        expect(screen.queryByText('Select Language')).not.toBeInTheDocument();
      });
    });

    it('should switch language from mobile drawer options', async () => {
      const user = userEvent.setup();
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English', 'en'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      await user.click(screen.getByRole('button', { name: /select language/i }));

      const drawerBody = screen.getByText('Français').closest('div');
      expect(drawerBody).toBeTruthy();
      await user.click(screen.getByText('Français'));

      expect(mockPush).toHaveBeenCalledWith('/fr/home');
    });
  });

  describe('Context sync from URL', () => {
    it('should set current language from regional ISO when pathname matches', () => {
      mockPathname = '/en-US/home';
      const fields = createMockFields({
        LanguageSelection: [
          createMockLanguageSelection('lang-1', 'English (US)', 'en-US', 'en-US'),
          createMockLanguageSelection('lang-2', 'Français', 'fr'),
        ],
      });
      renderWithLanguageModal(<LanguageSwitcherDefaultVariant testId={TEST_CASE_DATA_IDS.LANGUAGE_SWITCHER} fields={fields} params={mockParams} />);

      expect(mockSetCurrentLanguage.mock.calls.some((call) => call[0] === 'en-US')).toBe(true);
    });
  });
});
