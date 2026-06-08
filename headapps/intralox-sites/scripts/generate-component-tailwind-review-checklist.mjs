#!/usr/bin/env node
/**
 * Builds docs/component-tailwind-dev-review-checklist.md from:
 * - docs/component-page-test-map.md (up to 10 example pages per component)
 * - docs/intralox-ui-parity-vs-dev.md tiers (manual map below — update when parity doc changes)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const mapPath = join(root, 'docs/component-page-test-map.md');
const outPath = join(root, 'docs/component-tailwind-dev-review-checklist.md');

const DEV_BASE = 'https://intralox-dev.vercel.app';
const LOCAL_BASE = 'http://localhost:3000';

/** Parity tier vs dev — sync with intralox-ui-parity-vs-dev.md */
const PARITY = {
  ArticleBanner: { tier: 'C', status: '👁 Visual QA' },
  Banner: { tier: 'C', status: '👁 Visual QA' },
  Belt: { tier: 'D', status: '👁 Visual QA' },
  BeltComponent: { tier: 'D', status: '👁 Visual QA' },
  BeltLanding: { tier: 'D', status: '👁 Visual QA' },
  BeltTool: { tier: '—', status: '⬜ Open' },
  Billboard: { tier: 'D', status: '👁 Visual QA' },
  BrandingLine: { tier: 'C', status: '👁 Visual QA' },
  Breadcrumbs: { tier: 'C', status: '👁 Visual QA' },
  Callout: { tier: 'B', status: '✅ Done*' },
  CallToAction: { tier: 'B', status: '⏸ Deferred' },
  CardCarousel: { tier: '—', status: '⬜ Open' },
  Carousel: { tier: 'C', status: '👁 Visual QA' },
  CaseStudyBanner: { tier: 'C', status: '👁 Visual QA' },
  ColumnSplitter: { tier: 'D', status: '👁 Visual QA' },
  ContactDirectory: { tier: 'D', status: '👁 Visual QA' },
  Container: { tier: 'C', status: '👁 Visual QA' },
  ContentBlock: { tier: '—', status: '⬜ Open' },
  ContentSwitcher: { tier: 'C', status: '👁 Visual QA' },
  CookieBanner: { tier: 'C', status: '👁 Visual QA' },
  CountryLanguageDropdown: { tier: 'C', status: '👁 Visual QA' },
  Divider: { tier: 'C', status: '👁 Visual QA' },
  EventList: { tier: 'C', status: '👁 Visual QA' },
  FAQ: { tier: 'B', status: '✅ Done*' },
  FeaturedNews: { tier: 'B', status: '✅ Done*' },
  FloatingActionButton: { tier: 'C', status: '👁 Visual QA' },
  Footer: { tier: 'B', status: '✅ Done*' },
  GlobalLocations: { tier: 'B', status: '✅ Done*' },
  Header: { tier: 'C', status: '👁 Visual QA' },
  HeadingComponent: { tier: 'B', status: '✅ Done*' },
  Image: { tier: 'C', status: '👁 Visual QA' },
  InfoBox: { tier: 'B', status: '✅ Done*' },
  Introduction: { tier: 'A', status: '✅ Done' },
  LinkCards: { tier: 'D', status: '👁 Visual QA' },
  LinkGrid: { tier: 'B', status: '✅ Done*' },
  LinkGroup: { tier: 'B', status: '✅ Done*' },
  LinkList: { tier: 'C', status: '👁 Visual QA' },
  LocalNavigation: { tier: 'C', status: '✅ Done*' },
  LocationList: { tier: 'B', status: '✅ Done*' },
  Media: { tier: 'C', status: '👁 Visual QA' },
  MediaBox: { tier: 'B', status: '✅ Done*' },
  MediaTile: { tier: 'B', status: '✅ Done*' },
  Navigation: { tier: 'B', status: '✅ Done*' },
  PageContent: { tier: 'D', status: '✅ Done*' },
  PartialDesignDynamicPlaceholder: { tier: '—', status: '⬜ Open' },
  PolicyStatements: { tier: 'C', status: '👁 Visual QA' },
  ProductSegment: { tier: '—', status: '⬜ Open' },
  Promo: { tier: 'C', status: '👁 Visual QA' },
  QuickLink: { tier: 'B', status: '✅ Done*' },
  QuickLinkGroup: { tier: 'B', status: '✅ Done*' },
  RelatedCaseStudies: { tier: 'B', status: '✅ Done*' },
  RichText: { tier: 'C', status: '👁 Visual QA' },
  RowSplitter: { tier: 'D', status: '✅ Done*' },
  ScriptContent: { tier: '—', status: '⬜ Open' },
  SearchComponent: { tier: 'B', status: '✅ Done*' },
  SolutionsGroup: { tier: 'B', status: '✅ Done*' },
  Tabs: { tier: 'C', status: '👁 Visual QA' },
  Testimonial: { tier: 'B', status: '✅ Done*' },
  TextAndAside: { tier: 'B', status: '✅ Done*' },
  TextBlock: { tier: '—', status: '⬜ Open' },
  Timeline: { tier: 'B', status: '✅ Done*' },
  Title: { tier: 'C', status: '👁 Visual QA' },
  TwoColumnContainer: { tier: 'A', status: '✅ Done' },
};

/** IT-INLINE styling tracker — sync with styling-functions-inventory.md */
const INLINE = {
  Callout: 'Done',
  LinkGrid: 'Done',
  MediaBox: 'Done',
  QuickLink: 'Done',
  RelatedCaseStudies: 'Done',
  RichText: 'Exception',
  HeadingComponent: 'Done',
  Timeline: 'Done',
  Testimonial: 'Done',
  MediaTile: 'Done',
  GlobalLocations: 'Done',
  LinkGroup: 'Done',
  Promo: 'Done',
  QuickLinkGroup: 'Done',
  TextAndAside: 'Done',
  FloatingActionButton: 'Done',
};

/** Sitecore name → src/components folder */
const SRC_FOLDER = {
  ArticleBanner: 'articleBanner',
  Banner: 'banner',
  Belt: 'belt',
  BeltComponent: 'beltComponent',
  BeltLanding: 'beltLanding',
  BeltTool: 'beltTool',
  Billboard: 'billboard',
  BrandingLine: 'branding-line',
  Breadcrumbs: 'breadcrumbs',
  Callout: 'callout',
  CallToAction: 'callToAction',
  CardCarousel: 'cardCarousel',
  Carousel: 'carousel',
  CaseStudyBanner: 'caseStudyBanner',
  ColumnSplitter: 'column-splitter',
  ContactDirectory: 'contactDirectory',
  Container: 'container',
  ContentBlock: 'content-block',
  ContentSwitcher: 'contentSwitcher',
  CookieBanner: 'cookie-banner',
  CountryLanguageDropdown: 'country-language-dropdown',
  Divider: 'divider',
  EventList: 'event-list',
  FAQ: 'faq',
  FeaturedNews: 'featured-news',
  FloatingActionButton: 'floating-action-button',
  Footer: 'footer',
  GlobalLocations: 'global-locations',
  Header: 'header',
  HeadingComponent: 'heading-component',
  Image: 'image',
  InfoBox: 'info-box',
  Introduction: 'introduction',
  LinkCards: 'linkCards',
  LinkGrid: 'linkGrid',
  LinkGroup: 'link-group',
  LinkList: 'link-list',
  LocalNavigation: 'local-navigation',
  LocationList: 'location-list',
  Media: 'media',
  MediaBox: 'media-box',
  MediaTile: 'media-tile',
  Navigation: 'navigation',
  PageContent: 'page-content',
  PartialDesignDynamicPlaceholder: 'partial-design-dynamic-placeholder',
  PolicyStatements: 'policy-statements',
  ProductSegment: '—',
  Promo: 'promo',
  QuickLink: 'quick-link',
  QuickLinkGroup: 'quick-link-group',
  RelatedCaseStudies: 'related-case-studies',
  RichText: 'rich-text',
  RowSplitter: 'row-splitter',
  ScriptContent: 'scriptContent',
  SearchComponent: 'search',
  SolutionsGroup: 'solutions-group',
  Tabs: 'tab',
  Testimonial: 'testimonial',
  TextAndAside: 'text-aside',
  TextBlock: 'textBlock',
  Timeline: 'timeline',
  Title: 'title',
  TwoColumnContainer: 'two-column-container',
};

function parsePageMap(md) {
  const components = [];
  const detailsRe = /<details>\s*<summary><strong>([^<]+)<\/strong><\/summary>([\s\S]*?)<\/details>/g;
  let m;
  while ((m = detailsRe.exec(md)) !== null) {
    const summary = m[1].trim();
    const body = m[2];
    const nameMatch = summary.match(/^(.+?)\s*\((\w+)\)/);
    if (!nameMatch) continue;
    const displayName = nameMatch[1].trim();
    const codeName = nameMatch[2];
    const isGlobal = /global layout/i.test(summary);
    const pageCountMatch = summary.match(/(\d+)\s*pages?/);
    const totalPages = pageCountMatch ? Number(pageCountMatch[1]) : 0;
    const notFound = /Not found on any crawled/i.test(body);

    const paths = [];
    const pathRe = /\|\s*`(\/[^`]*)`\s*\|/g;
    let pm;
    while ((pm = pathRe.exec(body)) !== null) paths.push(pm[1]);
    if (paths.length === 0) {
      const bulletRe = /^-\s*`(\/[^`]+)`/gm;
      while ((pm = bulletRe.exec(body)) !== null) paths.push(pm[1]);
    }

    components.push({
      displayName,
      codeName,
      isGlobal,
      totalPages,
      notFound,
      paths: [...new Set(paths)].slice(0, 10),
    });
  }
  return components;
}

function link(path, base) {
  return `${base}${path}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const mapMd = readFileSync(mapPath, 'utf8');
const generatedMatch = mapMd.match(/Generated:\s*(\S+)/);
const mapGenerated = generatedMatch ? generatedMatch[1] : 'unknown';
const components = parsePageMap(mapMd);

const reviewed = 0;
let openVisual = 0;
let doneParity = 0;

for (const c of components) {
  const p = PARITY[c.codeName];
  if (p?.status?.includes('Done')) doneParity++;
  else if (p?.status?.includes('Visual QA') || p?.status === '⬜ Open') openVisual++;
}

const lines = [];
lines.push('# Component Tailwind / style review vs `dev`');
lines.push('');
lines.push(`**Generated:** ${today()} (from [component-page-test-map.md](./component-page-test-map.md) dated ${mapGenerated})`);
lines.push('');
lines.push('Use this checklist to review **every Sitecore rendering component** one by one: Tailwind classes, tokens, layout bands, and visual parity with **`dev`** (`https://intralox-dev.vercel.app`).');
lines.push('');
lines.push('## Related docs');
lines.push('');
lines.push('| Doc | Purpose |');
lines.push('|-----|---------|');
lines.push('| [component-page-test-map.md](./component-page-test-map.md) | Full crawl (collapsible); regenerate with `node scripts/generate-component-page-map.mjs` when available |');
lines.push('| [intralox-ui-parity-vs-dev.md](./intralox-ui-parity-vs-dev.md) | Tier A–D parity status, SCSS migration notes |');
lines.push('| [styling-functions-inventory.md](./styling-functions-inventory.md) | IT-INLINE: styling functions / constants per component |');
lines.push('| [component-pseudo-classes-audit.md](./component-pseudo-classes-audit.md) | Pseudo-class / variant audit |');
lines.push('');
lines.push('## Review workflow (per component)');
lines.push('');
lines.push('1. Open **local** and **dev** for each example page below (side-by-side at **320 / 768 / 992 / 1200px**).');
lines.push('2. Compare layout, spacing, typography, colors (`@theme` tokens vs legacy `gray-*`), hover/focus, and nested two-column shells.');
lines.push('3. Optional code check: `node scripts/compare-styles-vs-dev.mjs` (see parity doc).');
lines.push('4. Mark **Reviewed** and **Parity OK** in the master table; note issues in **Notes**.');
lines.push('5. Update [intralox-ui-parity-vs-dev.md](./intralox-ui-parity-vs-dev.md) when sign-off is complete.');
lines.push('');
lines.push('## Status legend');
lines.push('');
lines.push('| Column | Meaning |');
lines.push('|--------|---------|');
lines.push('| **Parity (vs dev)** | From [intralox-ui-parity-vs-dev.md](./intralox-ui-parity-vs-dev.md): ✅ Done = visual sign-off; ✅ Done* = code parity only; 👁 = needs browser QA |');
lines.push('| **IT-INLINE** | From [styling-functions-inventory.md](./styling-functions-inventory.md): no styling functions/constants in component code |');
lines.push('| **Reviewed** | Your checkbox when this component pass is complete |');
lines.push('| **Parity OK** | Visual match confirmed local vs dev on sample pages |');
lines.push('');
lines.push(`## Master checklist (${components.length} components)`);
lines.push('');
lines.push(
  '| # | Component | Code | Source folder | Parity tier | Parity (vs dev) | IT-INLINE | Pages on dev | Reviewed | Parity OK | Notes |',
);
lines.push(
  '|---:|-----------|------|---------------|:-----------:|-----------------|:---------:|-------------:|:--------:|:---------:|-------|',
);

components.forEach((c, i) => {
  const p = PARITY[c.codeName] ?? { tier: '—', status: '⬜ Open' };
  const inline = INLINE[c.codeName] ?? '—';
  const folder = SRC_FOLDER[c.codeName] ?? '—';
  const pagesCol = c.notFound ? '0 (not on sitemap)' : c.isGlobal ? `global (~${c.totalPages})` : String(c.totalPages);
  lines.push(
    `| ${i + 1} | ${c.displayName} | \`${c.codeName}\` | \`src/components/${folder}/\` | ${p.tier} | ${p.status} | ${inline} | ${pagesCol} | ☐ | ☐ | |`,
  );
});

lines.push('');
lines.push('---');
lines.push('');
lines.push('## Components with example pages (max 10 per component)');
lines.push('');
lines.push(`**Dev base:** ${DEV_BASE} · **Local base:** ${LOCAL_BASE}`);
lines.push('');

for (const c of components) {
  const p = PARITY[c.codeName] ?? { tier: '—', status: '⬜ Open' };
  const folder = SRC_FOLDER[c.codeName] ?? '—';
  lines.push(`### ${c.displayName} (\`${c.codeName}\`)`);
  lines.push('');
  lines.push(`- **Source:** \`src/components/${folder}/\``);
  lines.push(`- **Parity:** ${p.status} (tier ${p.tier})`);
  if (INLINE[c.codeName]) lines.push(`- **IT-INLINE:** ${INLINE[c.codeName]}`);
  if (c.isGlobal) {
    lines.push(`- **Usage:** Global layout chrome (~${c.totalPages} pages on dev sitemap)`);
  } else if (c.notFound) {
    lines.push('- **Usage:** Not found on crawled English pages — use Storybook, test routes, or CM preview');
  } else {
    lines.push(`- **Usage:** ${c.totalPages} page(s) on dev sitemap`);
  }
  lines.push('');

  if (c.paths.length === 0) {
    lines.push('*No example URLs in page map — add test route or re-crawl.*');
    lines.push('');
    continue;
  }

  lines.push('| # | Path | Local | Dev |');
  lines.push('|---:|------|-------|-----|');
  c.paths.forEach((path, idx) => {
    lines.push(
      `| ${idx + 1} | \`${path}\` | [open](${link(path, LOCAL_BASE)}) | [open](${link(path, DEV_BASE)}) |`,
    );
  });
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## Components without sitemap examples (0 pages in crawl)');
lines.push('');
const zeroPages = components.filter((c) => c.notFound && !c.isGlobal);
if (zeroPages.length === 0) {
  lines.push('*None — all components have at least one crawled page or global layout.*');
} else {
  lines.push('| Component | Code | Source folder | Parity (vs dev) |');
  lines.push('|-----------|------|---------------|-----------------|');
  for (const c of zeroPages) {
    const p = PARITY[c.codeName] ?? { status: '⬜ Open' };
    const folder = SRC_FOLDER[c.codeName] ?? '—';
    lines.push(`| ${c.displayName} | \`${c.codeName}\` | \`src/components/${folder}/\` | ${p.status} |`);
  }
}
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`| Metric | Count |`);
lines.push(`|--------|------:|`);
lines.push(`| Total Sitecore components | ${components.length} |`);
lines.push(`| With example page URLs (≤10 each) | ${components.filter((c) => c.paths.length > 0).length} |`);
lines.push(`| Global layout (Header, Nav, Footer, etc.) | ${components.filter((c) => c.isGlobal).length} |`);
lines.push(`| Zero pages in sitemap crawl | ${zeroPages.length} |`);
lines.push(`| Parity ✅ Done / Done* (pre-tracked) | ${components.filter((c) => PARITY[c.codeName]?.status?.includes('Done')).length} |`);
lines.push(`| Needs visual QA or open (pre-tracked) | ${components.filter((c) => { const s = PARITY[c.codeName]?.status; return s && (s.includes('Visual QA') || s === '⬜ Open' || s === '⏸ Deferred'); }).length} |`);
lines.push('');

writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${outPath} (${components.length} components)`);
