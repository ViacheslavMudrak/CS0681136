import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import {
  ChromeIconFromCms,
  CmsIcon,
  FaIconFromCms,
  HEADER_ICON_DEFAULTS,
  isFontAwesomeClassString,
  normalizeFontAwesomeClassList,
  renderChromeIconFromFaClass,
  SocialPlatformIcon,
  UI_ICONS,
} from 'lib/chrome-icons';
import { SocialPlatform } from 'components/footer/footerUtils';

describe('normalizeFontAwesomeClassList', () => {
  it('maps FA5 fas prefix to fa-solid', () => {
    expect(normalizeFontAwesomeClassList('fas fa-phone')).toBe('fa-solid fa-phone');
  });

  it('leaves FA6-style classes unchanged', () => {
    expect(normalizeFontAwesomeClassList('fa-solid fa-globe')).toBe('fa-solid fa-globe');
  });

  it('maps FA4 fa fa-* to fa-solid fa-*', () => {
    expect(normalizeFontAwesomeClassList('fa fa-magnifying-glass')).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });

  it('maps fa-regular fa-phone to fa-solid for glyph availability', () => {
    expect(normalizeFontAwesomeClassList('fa-regular fa-phone')).toBe('fa-solid fa-phone');
  });

  it('maps fa-regular globe, search, xmark, and legacy fa-search to solid', () => {
    expect(normalizeFontAwesomeClassList('fa-regular fa-globe')).toBe('fa-solid fa-globe');
    expect(normalizeFontAwesomeClassList('fa-regular fa-magnifying-glass')).toBe(
      'fa-solid fa-magnifying-glass',
    );
    expect(normalizeFontAwesomeClassList('fa-regular fa-xmark')).toBe('fa-solid fa-xmark');
    expect(normalizeFontAwesomeClassList('fa-regular fa-search')).toBe(
      'fa-solid fa-magnifying-glass',
    );
  });

  it('maps far fa-globe through FA5 step then solid coercion', () => {
    expect(normalizeFontAwesomeClassList('far fa-globe')).toBe('fa-solid fa-globe');
  });
});

describe('isFontAwesomeClassString', () => {
  it('accepts fa-solid lists', () => {
    expect(isFontAwesomeClassString('fa-solid fa-phone')).toBe(true);
  });

  it('rejects fas shorthand before normalization', () => {
    expect(isFontAwesomeClassString('fas fa-phone')).toBe(false);
  });
});

describe('HEADER_ICON_DEFAULTS', () => {
  it('exposes FA class strings for CMS parity and glyph mapping', () => {
    expect(HEADER_ICON_DEFAULTS.search).toBe('fa-solid fa-magnifying-glass');
    expect(HEADER_ICON_DEFAULTS.language).toBe('fa-solid fa-globe');
    expect(HEADER_ICON_DEFAULTS.utilityPhone).toBe('fa-solid fa-phone');
  });
});

describe('UI_ICONS', () => {
  it('renders intralox-icon-library SVGs for search close and overlay close', () => {
    const { container: c1 } = render(<span>{UI_ICONS.searchClose}</span>);
    const { container: c2 } = render(<span>{UI_ICONS.close}</span>);
    expect(c1.querySelector('svg')).toBeInTheDocument();
    expect(c2.querySelector('svg')).toBeInTheDocument();
  });
});

describe('ChromeIconFromCms', () => {
  it('renders after normalizing fas shorthand', () => {
    const { container } = render(<ChromeIconFromCms cssClass="fas fa-phone" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders footer-style fab fa-youtube', () => {
    const { container } = render(<ChromeIconFromCms cssClass="fab fa-youtube" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('returns null when empty', () => {
    const { container } = render(<ChromeIconFromCms cssClass="" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('returns null when cssClass is undefined', () => {
    const { container } = render(<ChromeIconFromCms />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('returns null for unsafe CMS strings (injection guard)', () => {
    const { container: c1 } = render(
      <ChromeIconFromCms cssClass={'fa-solid fa-phone"><script'} />,
    );
    const { container: c2 } = render(
      <ChromeIconFromCms cssClass="fa-solid fa-phone style=expression()" />,
    );
    expect(c1.querySelector('svg')).toBeNull();
    expect(c2.querySelector('svg')).toBeNull();
  });

  it('returns null when normalized string is not a mapped FA glyph', () => {
    const { container } = render(<ChromeIconFromCms cssClass="sometext" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders phone SVG for fa-solid fa-phone-volume (CMS floating-button icon)', () => {
    const { container } = render(<ChromeIconFromCms cssClass="fa-solid fa-phone-volume" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders phone SVG for intralox utility kit classes', () => {
    const { container } = render(
      <ChromeIconFromCms cssClass="fa-utility-fill fa-semibold fa-phone-volume" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders message SVG for fa-solid fa-message-square (Quick Link CMS icon)', () => {
    const { container } = render(<ChromeIconFromCms cssClass="fa-solid fa-message-square" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders award SVG for fa-solid fa-award (guarantee tile)', () => {
    const { container } = render(<ChromeIconFromCms cssClass="fa-solid fa-award" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders image SVG for fa-solid fa-image (Sitecore Image icon item)', () => {
    const { container } = render(<ChromeIconFromCms cssClass="fa-solid fa-image" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('renderChromeIconFromFaClass', () => {
  it('renders FAB phone-volume as PhoneCall with solid fill', () => {
    const { container } = render(
      <span>{renderChromeIconFromFaClass('fa-solid fa-phone-volume')}</span>,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const pathD = svg?.querySelector('path')?.getAttribute('d') ?? '';
    expect(pathD).toContain('15.05');
    const className = svg?.getAttribute('class') ?? '';
    expect(className).toMatch(/fill-current/);
    expect(className).toMatch(/stroke-0/);
  });

  it('renders FAB plain fa-phone as handset-only Phone glyph', () => {
    const { container } = render(
      <span>{renderChromeIconFromFaClass('fa-solid fa-phone')}</span>,
    );
    const svg = container.querySelector('svg');
    const pathD = svg?.querySelector('path')?.getAttribute('d') ?? '';
    expect(pathD).toContain('16.92');
    expect(svg?.getAttribute('class') ?? '').not.toMatch(/fill-current/);
  });
});

describe('FaIconFromCms / CmsIcon aliases', () => {
  it('FaIconFromCms renders a mapped icon', () => {
    const { container } = render(<FaIconFromCms cssClass="fa-solid fa-phone" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('CmsIcon returns null for empty class', () => {
    const { container } = render(<CmsIcon cssClass="" />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('SocialPlatformIcon', () => {
  it('renders LinkedIn for platform fallback', () => {
    const { container } = render(<SocialPlatformIcon platform={SocialPlatform.LinkedIn} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('uses filled footer social icon classes', () => {
    const { container } = render(<SocialPlatformIcon platform={SocialPlatform.LinkedIn} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class') ?? '').toMatch(/\[&_path\]:fill-current/);
    expect(svg).toHaveClass('stroke-0');
  });

  it('fills LinkedIn “i” dot circle in footer social icons', () => {
    const { container } = render(<SocialPlatformIcon platform={SocialPlatform.LinkedIn} />);
    const className = container.querySelector('svg')?.getAttribute('class') ?? '';
    expect(className).toMatch(/\[&_circle\]:fill-current/);
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('keeps YouTube play path dark inside white frame', () => {
    const { container } = render(<SocialPlatformIcon platform={SocialPlatform.YouTube} />);
    const svg = container.querySelector('svg');
    const className = svg?.getAttribute('class') ?? '';
    expect(className).toMatch(/\[&_path:last-of-type\]:fill-ink/);
    expect(className).toMatch(/\[&_path:first-of-type\]:fill-current/);
  });
});
