import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CountryLanguageDropdown } from 'components/country-language-dropdown/CountryLanguageDropdown';
import type { CountryItem, LanguageDocumentItem } from 'components/country-language-dropdown/CountryLanguageDropdown.type';
import { POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY } from 'components/country-language-dropdown/countryLanguageDropdownUtils';

/**
 * App RouterΓÇôshaped prefix so {@link getContentPathFromAppPathname} matches Sitecore-style
 * paths used in fixtures (`/support/...`).
 */
const MOCK_SITE_ROOT = '/mocksite';

function appPathname(contentPath: string): string {
  const c = contentPath.startsWith('/') ? contentPath : `/${contentPath}`;
  return `${MOCK_SITE_ROOT}${c}`;
}

// Mock next/navigation so useRouter / usePathname don't throw in tests.
const mockPush = vi.fn();
let mockPathname = appPathname('/support/policy-statements');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

// Stub window.location so jsdom doesn't throw on assignment.
const mockLocationHref = vi.fn();

beforeEach(() => {
  mockPush.mockClear();
  mockLocationHref.mockClear();
  mockPathname = appPathname('/support/policy-statements');
  sessionStorage.clear();
  Object.defineProperty(window, 'location', {
    value: { ...window.location, set href(url: string) { mockLocationHref(url); } },
    writable: true,
    configurable: true,
  });
});

// Fixture data

/** Countries with a single navigation link each ΓÇö actual Sitecore datasource shape. */
const singleLanguageCountries: CountryItem[] = [
  {
    id: 'country-IN',
    name: 'India',
    code: 'IN',
    documents: [{ id: 'doc-IN-0', language: '', href: '/support/policy-statements/india' }],
  },
  {
    id: 'country-US',
    name: 'United States',
    code: 'US',
    documents: [{ id: 'doc-US-0', language: '', href: '/support/policy-statements/united-states' }],
  },
];

const manyCountries: CountryItem[] = Array.from({ length: 20 }, (_, index) => ({
  id: `country-${index}`,
  name: `Country ${index}`,
  code: `C${index}`,
  documents: [{ id: `doc-${index}`, language: '', href: `/support/policy-statements/country-${index}` }],
}));

/** Route-level language documents ΓÇö from the Country Policy Statement page fields. */
const routeDocuments: LanguageDocumentItem[] = [
  { id: 'route-doc-0', language: 'English', href: 'https://cdn.example.com/india-en.pdf' },
  { id: 'route-doc-1', language: 'Hindi', href: 'https://cdn.example.com/india-hi.pdf' },
];

// Country dropdown rendering

describe('CountryLanguageDropdown ΓÇö country dropdown', () => {
  it('renders the country label when provided', () => {
    render(
      <CountryLanguageDropdown countryLabel="Select your country or region:" countries={singleLanguageCountries} />,
    );
    expect(screen.getByText('Select your country or region:')).toBeInTheDocument();
  });

  it('renders country options in the native select', () => {
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
  });

  it('renders the country placeholder as an enabled option', () => {
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    expect(screen.getByRole('option', { name: '-- Select --' })).toBeEnabled();
  });

  it('shows the country placeholder when no country is chosen', () => {
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    expect(screen.getByRole('combobox', { name: /country/i })).toHaveValue('');
  });

  it('renders nothing when no countryLabel and not editing', () => {
    const { container } = render(<CountryLanguageDropdown countries={singleLanguageCountries} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows is-empty-hint for country label in editing mode', () => {
    render(<CountryLanguageDropdown countries={singleLanguageCountries} isEditing={true} />);
    expect(screen.getByText('Country Label')).toBeInTheDocument();
  });

  it('shows country control in preview mode even without countryLabel (no navigation)', () => {
    render(<CountryLanguageDropdown countries={singleLanguageCountries} isPreview={true} />);
    expect(screen.getByText('Country Label')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /country/i })).toBeInTheDocument();
  });

  it('reflects a route-derived country selection in the native select value', async () => {
    mockPathname = appPathname('/support/policy-statements/india');
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /country/i })).toHaveValue('IN');
    });
  });

  it('updates the native select value after a manual country change in editing mode', async () => {
    const user = userEvent.setup();
    render(
      <CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} isEditing />,
    );
    const combo = screen.getByRole('combobox', { name: /country/i });
    await user.selectOptions(combo, 'US');
    expect(combo).toHaveValue('US');
  });

  it('updates the native select value for a long country list', async () => {
    const user = userEvent.setup();
    render(<CountryLanguageDropdown countryLabel="Country" countries={manyCountries} isEditing />);
    const combo = screen.getByRole('combobox', { name: /country/i });
    await user.selectOptions(combo, 'C15');
    expect(combo).toHaveValue('C15');
  });
});

// Navigation on country change (listing page ΓÇö no routeDocuments)

describe('CountryLanguageDropdown ΓÇö country navigation', () => {
  it('navigates to the country link when a country is selected', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(
      POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
      JSON.stringify({ v: 1, originPath: '/x', documentHref: 'https://y' }),
    );
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /country/i }), 'IN');
    expect(sessionStorage.getItem(POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY)).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/support/policy-statements/india');
  });

  it('navigates to the correct country link when a different country is selected', async () => {
    const user = userEvent.setup();
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /country/i }), 'US');
    expect(mockPush).toHaveBeenCalledWith('/support/policy-statements/united-states');
  });

  it('does NOT navigate when in editing mode', async () => {
    const user = userEvent.setup();
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
        isEditing={true}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /country/i }), 'IN');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does NOT navigate when in preview mode (XM Cloud Pages preview)', async () => {
    const user = userEvent.setup();
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
        isPreview={true}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /country/i }), 'IN');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does NOT navigate when the placeholder is selected', async () => {
    const user = userEvent.setup();
    render(<CountryLanguageDropdown countryLabel="Country" countries={singleLanguageCountries} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /country/i }), '');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does NOT render a content region on the listing page (no routeDocuments)', () => {
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
      />,
    );
    expect(screen.queryByRole('region', { name: /policy document/i })).toBeNull();
  });
});

// Country pre-selection ΓÇö URL path matching fallback

describe('CountryLanguageDropdown ΓÇö country pre-selection via URL', () => {
  it('pre-selects when pathname includes site and locale before the content path', () => {
    mockPathname = `${MOCK_SITE_ROOT}/en/support/policy-statements/india`;
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
      />,
    );
    expect(screen.getByRole('combobox', { name: /country/i })).toHaveTextContent('India');
  });

  it('pre-selects the country whose link matches the current pathname', () => {
    mockPathname = appPathname('/support/policy-statements/india');
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
      />,
    );
    expect(screen.getByRole('combobox', { name: /country/i })).toHaveTextContent('India');
  });

  it('prefers initialCountryCode over URL matching when both are present', () => {
    mockPathname = appPathname('/support/policy-statements/india');
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
        initialCountryCode="US"
      />,
    );
    expect(screen.getByRole('combobox', { name: /country/i })).toHaveTextContent('United States');
  });

  it('shows language dropdown after URL-based pre-selection when routeDocuments provided', () => {
    mockPathname = appPathname('/support/policy-statements/india');
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        routeDocuments={routeDocuments}
      />,
    );
    expect(screen.getByRole('combobox', { name: /language/i })).toBeInTheDocument();
  });
});

// Language dropdown (country page ΓÇö routeDocuments provided)

describe('CountryLanguageDropdown ΓÇö language dropdown visibility', () => {
  it('does NOT show language dropdown when routeDocuments is absent', () => {
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
      />,
    );
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(1);
  });

  it('shows language dropdown when routeDocuments are provided (with label)', () => {
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={routeDocuments}
      />,
    );
    expect(screen.getByRole('combobox', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hindi' })).toBeInTheDocument();
  });

  it('shows the language placeholder when no language is chosen', () => {
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={routeDocuments}
      />,
    );
    expect(screen.getByRole('combobox', { name: /language/i })).toHaveValue('');
  });

  it('shows language dropdown when routeDocuments are provided even without a languageLabel', () => {
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={routeDocuments}
      />,
    );
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('shows is-empty-hint for language label in editing mode with routeDocuments', () => {
    render(
      <CountryLanguageDropdown
        countries={singleLanguageCountries}
        isEditing={true}
        routeDocuments={routeDocuments}
      />,
    );
    expect(screen.getByText('Language Label')).toBeInTheDocument();
  });

  it('reflects a route-derived language selection in the native select value', async () => {
    mockPathname = appPathname('/support/policy-statements/india/english');
    const internalDocs: LanguageDocumentItem[] = [
      { id: 'int-0', language: 'English', href: '/support/policy-statements/india/english' },
      { id: 'int-1', language: 'Hindi', href: '/support/policy-statements/india/hindi' },
    ];
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={internalDocs}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /language/i })).toHaveValue('0');
    });
  });
});

// Language selection navigation (country page ΓÇö routeDocuments provided)

describe('CountryLanguageDropdown ΓÇö language selection navigation', () => {
  it('navigates in the same window for a PDF link', async () => {
    const user = userEvent.setup();
    mockPathname = appPathname('/support/policy-statements/india');
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={routeDocuments}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /language/i }), '0');
    const stored = sessionStorage.getItem(POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toMatchObject({
      v: 1,
      originPath: '/support/policy-statements/india',
      documentHref: 'https://cdn.example.com/india-en.pdf',
    });
    expect(mockLocationHref).toHaveBeenCalledWith('https://cdn.example.com/india-en.pdf');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates in the same window for an external (non-PDF) link', async () => {
    const user = userEvent.setup();
    mockPathname = appPathname('/support/policy-statements/india');
    const externalDocs: LanguageDocumentItem[] = [
      { id: 'ext-0', language: 'English', href: 'https://cdn.example.com/policy' },
    ];
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={externalDocs}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /language/i }), '0');
    const stored = sessionStorage.getItem(POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY);
    expect(JSON.parse(stored!)).toMatchObject({
      v: 1,
      originPath: '/support/policy-statements/india',
      documentHref: 'https://cdn.example.com/policy',
    });
    expect(mockLocationHref).toHaveBeenCalledWith('https://cdn.example.com/policy');
  });

  it('uses router.push for internal document paths', async () => {
    const user = userEvent.setup();
    mockPathname = appPathname('/support/policy-statements/india');
    sessionStorage.setItem(
      POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        originPath: '/support/policy-statements/india',
        documentHref: 'https://cdn.example.com/stale.pdf',
      }),
    );
    const internalDocs: LanguageDocumentItem[] = [
      { id: 'int-0', language: 'English', href: '/support/policy-statements/india/english' },
    ];
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={internalDocs}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /language/i }), '0');
    expect(mockPush).toHaveBeenCalledWith('/support/policy-statements/india/english');
    expect(mockLocationHref).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY)).toBeNull();
  });

  it('pre-selects the language when pathname matches an internal document href', async () => {
    mockPathname = appPathname('/support/policy-statements/india/english');
    const internalDocs: LanguageDocumentItem[] = [
      { id: 'int-0', language: 'English', href: '/support/policy-statements/india/english' },
      { id: 'int-1', language: 'Hindi', href: '/support/policy-statements/india/hindi' },
    ];
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={internalDocs}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /language/i })).toHaveTextContent('English');
    });
  });

  it('pre-selects the language from sessionStorage after returning from a PDF (same pathname)', async () => {
    mockPathname = appPathname('/support/policy-statements/india');
    sessionStorage.setItem(
      POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        originPath: '/support/policy-statements/india',
        documentHref: 'https://cdn.example.com/india-hi.pdf',
      }),
    );
    const pdfDocs: LanguageDocumentItem[] = [
      { id: 'route-doc-0', language: 'English', href: 'https://cdn.example.com/india-en.pdf' },
      { id: 'route-doc-1', language: 'Hindi', href: 'https://cdn.example.com/india-hi.pdf' },
    ];
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={pdfDocs}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /language/i })).toHaveTextContent('Hindi');
    });
  });

  it('does NOT navigate when in editing mode', async () => {
    const user = userEvent.setup();
    render(
      <CountryLanguageDropdown
        countries={singleLanguageCountries}
        isEditing={true}
        routeDocuments={routeDocuments}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /language/i }), '0');
    expect(mockLocationHref).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does NOT navigate when in preview mode (XM Cloud Pages preview)', async () => {
    const user = userEvent.setup();
    render(
      <CountryLanguageDropdown
        countries={singleLanguageCountries}
        isPreview={true}
        routeDocuments={routeDocuments}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /language/i }), '0');
    expect(mockLocationHref).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('never renders an inline content region or iframe', async () => {
    const user = userEvent.setup();
    render(
      <CountryLanguageDropdown
        countryLabel="Country"
        languageLabel="Language"
        countries={singleLanguageCountries}
        initialCountryCode="IN"
        routeDocuments={routeDocuments}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox', { name: /language/i }), '0');
    expect(screen.queryByRole('region', { name: /policy document/i })).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });
});
