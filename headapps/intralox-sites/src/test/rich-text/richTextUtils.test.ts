import { describe, expect, it } from 'vitest';

import {
  getRichTextField,
  getRichTextRegionAriaLabel,
  isPatentsTableSpacerCell,
  isPatentsTableSpacerRow,
  isRichTextEffectivelyEmpty,
  applyPatentsSpacerRowStyles,
  markPatentsTableSpacerRows,
  markPatentsTableContinuationRows,
  markPatentsTablePatentOnlyRows,
  markPatentsTableCol3MobileRows,
  PATENTS_TABLE_MOBILE_ROOT_CLASS,
  PATENTS_TABLE_SERIES_BLOCK_CLASS,
  PATENTS_TABLE_PATENT_SCROLL_CLASS,
  PATENTS_TABLE_COL3_MOBILE_ROW_CLASS,
  PATENTS_TABLE_PATENT_ONLY_ROW_CLASS,
  isPatentsTableCol3MobileRow,
  stripPatentsTableAlignmentPadding,
  normalizeRichTextHtml,
  PATENTS_TABLE_CONTINUATION_ROW_CLASS,
  normalizeRichTextTableHtml,
  isPatentsTableMarkup,
  hasTrademarksCatalogInHtml,
  isTrademarksTableMarkup,
  tagTrademarksTable,
  stripTrademarksTableCellBorders,
  tagPatentsTableColgroup,
  TRADEMARKS_TABLE_CLASS,
  isRichTextImageGridContent,
  tagRichTextImageGrid,
  flattenRichTextImageGrid,
  mergeTrademarkLogoTableRows,
  isTrademarkLogoOnlyRow,
  tagResponsiveTableWrapper,
  findDivBlock,
  RTE_IMAGE_GRID_CLASS,
  RTE_IMAGE_GRID_ITEM_CLASS,
  RTE_IMAGE_GRID_LONE_CLASS,
  markLoneRichTextImageGrids,
  PATENTS_TABLE_CLASS,
  PATENTS_TABLE_COL1_WIDTH_PX,
  PATENTS_TABLE_COL2_WIDTH_PX,
  PATENTS_TABLE_COL3_WIDTH_PX,
  PATENTS_TABLE_ROW_MIN_HEIGHT_PX,
  PATENTS_TABLE_WIDTH_TABLET_PX,
  neutralizeCkeTableFigureMarkup,
  stripPatentsTableCellBorders,
  PATENTS_TABLE_SPACER_ROW_CLASS,
  PATENTS_TABLE_SPACER_ROW_DIVIDER_CLASS,
  PATENTS_TABLE_SPACER_ROW_TIGHT_CLASS,
  getPatentsTableSpacerRowVariant,
  transformPatentsDividerRowCellsToHr,
  stripPatentsTableSpacerRows,
  RICH_TEXT_TABLE_FOOTER_PADDING_DESKTOP_PX,
  RICH_TEXT_TABLE_FOOTER_PADDING_MOBILE_PX,
} from 'components/rich-text/richTextUtils';
import { getRichTextTableSectionClasses } from 'components/rich-text/RichText';

describe('RICH_TEXT_TABLE_FOOTER_PADDING_*', () => {
  it('matches live Section vertical band (48px mobile/tablet, 80px from lg)', () => {
    expect(RICH_TEXT_TABLE_FOOTER_PADDING_MOBILE_PX).toBe(48);
    expect(RICH_TEXT_TABLE_FOOTER_PADDING_DESKTOP_PX).toBe(80);
    expect(RICH_TEXT_TABLE_FOOTER_PADDING_MOBILE_PX).toBeLessThan(
      RICH_TEXT_TABLE_FOOTER_PADDING_DESKTOP_PX,
    );
  });
});


describe('getRichTextTableSectionClasses', () => {
  it('returns semantic section class when HTML includes a table', () => {
    expect(getRichTextTableSectionClasses('<table></table>')).toContain('!pt-12');
    expect(getRichTextTableSectionClasses('<p>no table</p>')).toBe('');
  });
});

describe('getRichTextField', () => {
  it('reads flat Text field', () => {
    const field = { value: '<p>Flat</p>' };
    expect(getRichTextField({ Text: field })).toBe(field);
  });

  it('reads GraphQL datasource jsonValue', () => {
    const field = { value: '<p>GraphQL</p>' };
    expect(
      getRichTextField({
        data: { datasource: { Text: { jsonValue: field } } },
      }),
    ).toBe(field);
  });
});

describe('stripPatentsTableSpacerRows', () => {
  const patentsSnippet =
    '<table><tbody>' +
    '<tr><td><strong>Series</strong></td><td><strong>Style</strong></td><td><strong>US Patent Number(s)</strong></td></tr>' +
    '<tr><td>Series 400</td><td>Dual Angled Roller</td><td>7360641</td></tr>' +
    '<tr><td>&nbsp;</td><td><br/></td><td><br/></td></tr>' +
    '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
    '<tr><td>Series 800</td><td>OHFT</td><td>11807461</td></tr>' +
    '<tr><td><br/></td><td>Perforated</td><td>11807461</td></tr>' +
    '</tbody></table>';

  it('detects spacer cells and rows from Sitecore markup', () => {
    expect(isPatentsTableSpacerCell('&nbsp;')).toBe(true);
    expect(isPatentsTableSpacerCell('<br/>&nbsp;')).toBe(true);
    expect(isPatentsTableSpacerCell('Dual Angled Roller')).toBe(false);
    expect(
      isPatentsTableSpacerRow(
        '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>',
        false,
      ),
    ).toBe(true);
    expect(
      isPatentsTableSpacerRow(
        '<tr><td><br/></td><td>Perforated</td><td>11807461</td></tr>',
        false,
      ),
    ).toBe(false);
  });

  it('stripPatentsTableSpacerRows still removes rows when explicitly called', () => {
    const result = stripPatentsTableSpacerRows(patentsSnippet);
    expect(result).not.toContain('<td><br/></td><td><br/></td>');
    expect(result).toContain('Series 800');
  });

  it('normalizeRichTextTableHtml strips figure inline height and tags patents table', () => {
    const html =
      '<figure class="table" style="height:2662px;width:1154px"><table style="top:0.37px"><tbody>' +
      '<tr><td>A</td><td>B</td><td>C</td></tr></tbody></table></figure>';
    const result = normalizeRichTextTableHtml(html);
    expect(result).not.toContain('height:2662');
    expect(result).not.toContain('width:1154');
    expect(result).not.toContain('top:0.37');
    expect(result).toContain('<figure class="table">');
    expect(result).toContain(`class="${PATENTS_TABLE_CLASS}"`);
    expect(result).toContain('width:172.12px');
    expect(result).toContain('width:298.94px');
    expect(result).toContain('width:194.82px');
  });

  it('stripPatentsTableCellBorders removes CKEditor border attributes from patents cells', () => {
    const html =
      '<table class="patents-table" border="1" rules="cols" style="border-collapse:collapse">' +
      '<tbody><tr>' +
      '<td style="border:1px solid #ccc">A</td>' +
      "<td border=\"1\" style='border-width:1px'>B</td>" +
      '<td>C</td></tr></tbody></table>';
    const result = stripPatentsTableCellBorders(html);
    expect(result).not.toContain('border="1"');
    expect(result).not.toContain('rules="cols"');
    expect(result).not.toContain('border:1px');
    expect(result).not.toContain('border-width:1px');
    expect(result).toContain('<td>A</td>');
  });

  it('stripPatentsTableCellBorders runs on 3-column tables before patents-table class is present', () => {
    const html =
      '<table border="1"><tbody><tr><td style="border-left:1px solid">A</td><td>B</td><td>C</td></tr></tbody></table>';
    const result = stripPatentsTableCellBorders(html);
    expect(result).not.toContain('border-left:1px');
    expect(result).not.toContain('border="1"');
  });

  it('isPatentsTableMarkup is true only for 3-column catalog tables', () => {
    expect(
      isPatentsTableMarkup(
        '<table><tbody><tr><td><strong>Registered Marks</strong></td></tr></tbody></table>',
      ),
    ).toBe(false);
    expect(
      isPatentsTableMarkup('<table><tbody><tr><td>A</td><td>B</td><td>C</td></tr></tbody></table>'),
    ).toBe(true);
    expect(
      normalizeRichTextTableHtml(
        '<table><tbody><tr><td>THERMODRIVE®</td></tr></tbody></table>',
      ),
    ).not.toContain(PATENTS_TABLE_CLASS);
  });

  it('tags single-column trademarks catalog tables with trademarks-table class', () => {
    const html =
      '<table border="1"><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr>' +
      '<tr><td style="border-bottom:1px solid #ccc">INTRALOX®</td></tr>' +
      '</tbody></table>';
    expect(isTrademarksTableMarkup(html)).toBe(true);
    expect(isTrademarksTableMarkup('<table><tbody><tr><td>A</td><td>B</td></tr></tbody></table>')).toBe(
      false,
    );
    const tagged = tagTrademarksTable(html);
    expect(tagged).toContain(TRADEMARKS_TABLE_CLASS);
    expect(tagged).toContain('data-trademarks-catalog="true"');
    const stripped = stripTrademarksTableCellBorders(tagged);
    expect(stripped).not.toContain('border="1"');
    expect(stripped).not.toContain('border-bottom:1px');
    const normalized = normalizeRichTextTableHtml(html);
    expect(normalized).toContain(TRADEMARKS_TABLE_CLASS);
  });

  it('treats CKEditor spacer second column as single-column trademarks table', () => {
    const html =
      '<table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td><td>&nbsp;</td></tr>' +
      '<tr><td>INTRALOX®</td><td></td></tr>' +
      '</tbody></table>';
    expect(isTrademarksTableMarkup(html)).toBe(true);
    expect(hasTrademarksCatalogInHtml(tagTrademarksTable(html))).toBe(true);
  });

  it('hasTrademarksCatalogInHtml detects tagged trademarks catalog tables', () => {
    const html =
      '<div class="responsive-table"><table class="trademarks-table" data-trademarks-catalog="true"><tbody>' +
      '<tr><td>SLIDELOX®</td></tr></tbody></table></div>';
    expect(hasTrademarksCatalogInHtml(html)).toBe(true);
  });

  it('normalizeRichTextHtml tags trademarks-table for visitor display pipeline', () => {
    const html =
      '<div class="responsive-table"><table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr>' +
      '<tr><td>SLIDELOX®</td></tr>' +
      '</tbody></table></div>';
    expect(normalizeRichTextHtml(html)).toContain(TRADEMARKS_TABLE_CLASS);
  });

  it('tagPatentsTableColgroup inserts colgroup for patents tables only', () => {
    const withPatents = tagPatentsTableColgroup(
      '<table class="patents-table"><tbody><tr><td>A</td></tr></tbody></table>',
    );
    expect(withPatents).toContain('width:194.82px');
    expect(withPatents).not.toContain('<col><col');
    const plain = tagPatentsTableColgroup('<table><tbody><tr><td>A</td></tr></tbody></table>');
    expect(plain).not.toContain('<colgroup>');
  });

  it('stripPatentsTableAlignmentPadding removes CKEditor nbsp before closing strong tags', () => {
    const html =
      '<table><tbody><tr><td><strong>Series&nbsp;&nbsp;&nbsp;</strong></td><td>B</td></tr></tbody></table>';
    const result = stripPatentsTableAlignmentPadding(html);
    expect(result).toContain('<strong>Series</strong>');
    expect(result).not.toContain('Series&nbsp;');
  });
});

describe('tagRichTextImageGrid', () => {
  const trademarksSnippet =
    '<div class="responsive-table"><table><tbody>' +
    '<tr><td><strong>Registered Marks</strong></td></tr>' +
    '<tr><td>THERMODRIVE®</td></tr></tbody></table></div>' +
    '<div><div><div><div><img src="/a.png" alt="Logo A" /></div></div></div>' +
    '<div><div><div><img src="/b.png" alt="Logo B" /></div></div></div>' +
    '<div><div><div><img src="/c.png" alt="Logo C" /></div></div></div></div>' +
    '<p>All the registered marks are licensed to Intralox.</p>';

  it('detects multi-image logo blocks without visible text', () => {
    expect(isRichTextImageGridContent('<div><img alt="a" /><img alt="b" /></div>')).toBe(
      true,
    );
    expect(isRichTextImageGridContent('<p>Hello</p><img alt="a" />')).toBe(false);
  });

  it('tags a two-logo table cell fragment', () => {
    const inner =
      '<div><div><div><img src="/a.png" alt="A" /></div></div></div>' +
      '<div><div><div><img src="/b.png" alt="B" /></div></div></div>';
    expect(tagRichTextImageGrid(`<td>${inner}</td>`)).toContain(RTE_IMAGE_GRID_CLASS);
  });

  it('wraps multi-logo td when Sitecore uses p tags instead of divs', () => {
    const html =
      '<table><tbody><tr><td>' +
      '<p><img src="/a.png" alt="Logo A" /></p>' +
      '<p><img src="/b.png" alt="Logo B" /></p>' +
      '</td></tr></tbody></table>';
    const result = normalizeRichTextHtml(html);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
    expect((result.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(2);
  });

  it('wraps consecutive top-level p logo blocks into one horizontal grid', () => {
    const html =
      '<p><img src="/a.png" alt="Logo A" /></p>' +
      '<p><img src="/b.png" alt="Logo B" /></p>' +
      '<p><img src="/c.png" alt="Logo C" /></p>';
    const result = normalizeRichTextHtml(html);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
    expect((result.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(3);
    expect(result.indexOf('Logo A')).toBeLessThan(result.indexOf('Logo C'));
  });

  it('merges logo rows separated by hr spacer rows', () => {
    const html =
      '<table><tbody>' +
      '<tr><td><div><img src="/a.png" alt="Logo A" /></div></td></tr>' +
      '<tr><td><hr /></td></tr>' +
      '<tr><td><div><img src="/b.png" alt="Logo B" /></div></td></tr>' +
      '</tbody></table>';
    const merged = mergeTrademarkLogoTableRows(html);
    expect(merged).toContain(RTE_IMAGE_GRID_CLASS);
    expect((merged.match(/<tr\b/gi) ?? []).length).toBe(1);
  });

  it('merges consecutive one-logo table rows into a single horizontal grid row', () => {
    const html =
      '<table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr>' +
      '<tr><td>THERMODRIVE®</td></tr>' +
      '<tr><td><div><div><img src="/a.png" alt="Logo A" /></div></div></td></tr>' +
      '<tr><td><div><div><img src="/b.png" alt="Logo B" /></div></div></td></tr>' +
      '<tr><td><div><div><img src="/c.png" alt="Logo C" /></div></div></td></tr>' +
      '<tr><td>INTRALOX®</td></tr>' +
      '</tbody></table>';
    expect(isTrademarkLogoOnlyRow('<tr><td><div><img src="/x.png" alt="X" /></div></td></tr>')).toBe(
      true,
    );
    expect(isTrademarkLogoOnlyRow('<tr><td>INTRALOX®</td></tr>')).toBe(false);
    const merged = mergeTrademarkLogoTableRows(html);
    expect((merged.match(/<tr\b/gi) ?? []).length).toBe(4);
    expect(merged).toContain(RTE_IMAGE_GRID_CLASS);
    const result = normalizeRichTextHtml(html);
    expect((result.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(3);
    expect(result.indexOf('Logo A')).toBeLessThan(result.indexOf('Logo C'));
  });

  it('tags logo grids inside trademark table rows (not only after the first table)', () => {
    const html =
      '<div class="responsive-table"><table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr>' +
      '<tr><td>THERMODRIVE®</td></tr>' +
      '<tr><td><div><div><div><img src="/a.png" alt="Logo A" /></div></div></div>' +
      '<div><div><div><img src="/b.png" alt="Logo B" /></div></div></div></td></tr>' +
      '<tr><td>INTRALOX®</td></tr>' +
      '<tr><td><div><div><div><img src="/c.png" alt="Logo C" /></div></div></div>' +
      '<div><div><div><img src="/d.png" alt="Logo D" /></div></div></div></td></tr>' +
      '</tbody></table></div>';
    const tableOnly =
      '<table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr>' +
      '<tr><td>THERMODRIVE®</td></tr>' +
      '<tr><td><div><div><div><img src="/a.png" alt="Logo A" /></div></div></div>' +
      '<div><div><div><img src="/b.png" alt="Logo B" /></div></div></div></td></tr>' +
      '</tbody></table>';
    const countGridRoots = (value: string) =>
      (
        value.match(
          new RegExp(`<div\\s+class="[^"]*\\b${RTE_IMAGE_GRID_CLASS}\\b[^"]*"`, 'gi'),
        ) ?? []
      ).length;
    expect(countGridRoots(tagRichTextImageGrid(tableOnly))).toBe(1);
    const tagged = tagRichTextImageGrid(html);
    expect(countGridRoots(tagged)).toBe(2);
    const flattened = flattenRichTextImageGrid(tagged);
    expect(countGridRoots(flattened)).toBe(2);
    expect((flattened.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(4);
    expect(countGridRoots(normalizeRichTextTableHtml(flattened))).toBe(2);
    const result = normalizeRichTextHtml(html);
    expect(countGridRoots(result)).toBe(2);
    expect((result.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(4);
  });

  it('tags nested div logo row after responsive-table (trademarks)', () => {
    const result = tagRichTextImageGrid(trademarksSnippet);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
    expect(result).toContain('Logo A');
    expect(result.indexOf(RTE_IMAGE_GRID_CLASS)).toBeLessThan(result.indexOf('Logo A'));
  });

  it('tags logo row after bare div-wrapped table (Sitecore trademarks RTE)', () => {
    const sitecoreSnippet =
      '<div><table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr>' +
      '<tr><td>INTRALOX®</td></tr></tbody></table></div>' +
      '<div>' +
      '<div><div><div><div><div><div><img src="/a.png" alt="Logo A" /></div></div></div></div></div></div>' +
      '<div><div><div><div><img src="/b.png" alt="Logo B" /></div></div></div></div>' +
      '<div><div><div><div><img src="/c.png" alt="Logo C" /></div></div></div></div>' +
      '</div>' +
      '<p>All the registered marks are licensed to Intralox.</p>';
    const result = tagRichTextImageGrid(sitecoreSnippet);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
    expect(result).toContain('Logo A');
    expect(result).toContain('Logo C');
  });

  it('wraps consecutive top-level logo divs when Sitecore omits a shared parent', () => {
    const flatLogos =
      '<div><table><tbody><tr><td>Marks</td></tr></tbody></table></div>' +
      '<div><div><div><img src="/a.png" alt="Logo A" /></div></div></div>' +
      '<div><div><div><img src="/b.png" alt="Logo B" /></div></div></div>' +
      '<p>Footer</p>';
    const result = tagRichTextImageGrid(flatLogos);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
    expect(result.indexOf(RTE_IMAGE_GRID_CLASS)).toBeLessThan(result.indexOf('Logo B'));
  });

  it('tags two-logo Sitecore RTE markup (RichText integration shape)', () => {
    const html =
      '<div class="responsive-table"><table><tbody>' +
      '<tr><td><strong>Registered Marks</strong></td></tr></tbody></table></div>' +
      '<div>' +
      '<div><div><div><img src="/logo-a.png" alt="Logo A" /></div></div></div>' +
      '<div><div><div><img src="/logo-b.png" alt="Logo B" /></div></div></div>' +
      '</div>';
    const tableClose = /<div[^>]*class="responsive-table"[^>]*>[\s\S]*?<\/div>\s*/i.exec(
      html,
    )!;
    const gridOpen = html.indexOf('<div', tableClose.index + tableClose[0].length);
    const block = findDivBlock(html, gridOpen);
    expect(block?.inner).toContain('logo-b.png');
    expect(isRichTextImageGridContent(block?.inner ?? '')).toBe(true);
    const result = tagRichTextImageGrid(html);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
  });

  it('markLoneRichTextImageGrids adds rte-image-grid--lone on single-tile grids', () => {
    const html =
      `<div class="${RTE_IMAGE_GRID_CLASS}">` +
      `<div class="${RTE_IMAGE_GRID_ITEM_CLASS}"><img src="/cfs.png" alt="CFS" /></div></div>`;
    expect(markLoneRichTextImageGrids(html)).toContain(RTE_IMAGE_GRID_LONE_CLASS);
  });

  it('markLoneRichTextImageGrids adds --lone on nested single-img grid without __item', () => {
    const html =
      `<div class="${RTE_IMAGE_GRID_CLASS}">` +
      '<div><div><img src="/cfs.png" width="356" height="237" alt="CFS" /></div></div></div>';
    expect(markLoneRichTextImageGrids(html)).toContain(RTE_IMAGE_GRID_LONE_CLASS);
  });

  it('normalizeRichTextHtml strips width on lone bottom logo and marks --lone', () => {
    const html =
      '<table><tbody>' +
      '<tr><td><hr /></td></tr>' +
      `<tr><td><div class="${RTE_IMAGE_GRID_CLASS}">` +
      '<div><div><img src="/cfs.png" width="356" height="237" alt="CFS" /></div></div></div></td></tr>' +
      '</tbody></table>';
    const result = normalizeRichTextHtml(html);
    expect(result).toContain(RTE_IMAGE_GRID_LONE_CLASS);
    expect(result).not.toMatch(/width\s*=\s*[\"']?356/i);
    expect(result).not.toMatch(/height\s*=\s*[\"']?237/i);
  });

  it('normalizeRichTextHtml wraps lone CFS logo after table (Sitecore nested divs)', () => {
    const html =
      '<div><table><tbody><tr><td>INTRALOX®</td></tr></tbody></table></div>' +
      '<div><div><div><div><div><div><img src="/cfs.png?w=356" alt="CFS logo" /></div></div></div></div></div></div>' +
      '<p>All the registered marks are licensed to Intralox.</p>';
    const result = normalizeRichTextHtml(html);
    expect(result).toContain(`class="${RTE_IMAGE_GRID_CLASS} ${RTE_IMAGE_GRID_LONE_CLASS}"`);
    expect(result).toContain(RTE_IMAGE_GRID_ITEM_CLASS);
    expect(result).not.toMatch(/width\s*=\s*[\"']?356/i);
  });

  it('markLoneRichTextImageGrids leaves multi-logo grids unchanged', () => {
    const html =
      `<div class="${RTE_IMAGE_GRID_CLASS}">` +
      `<div class="${RTE_IMAGE_GRID_ITEM_CLASS}"><img src="/a.png" alt="A" /></div>` +
      `<div class="${RTE_IMAGE_GRID_ITEM_CLASS}"><img src="/b.png" alt="B" /></div></div>`;
    expect(markLoneRichTextImageGrids(html)).not.toContain(RTE_IMAGE_GRID_LONE_CLASS);
  });

  it('flattenRichTextImageGrid emits one direct tile per nested Sitecore logo', () => {
    const nestedGrid =
      '<div class="rte-image-grid">' +
      '<div><div><div><div><div><img src="/a.png" alt="Logo A" /></div></div></div></div>' +
      '<div><div><div><div><img src="/b.png" alt="Logo B" /></div></div></div></div>' +
      '<div><div><div><div><img src="/c.png" alt="Logo C" /></div></div></div></div>' +
      '</div></div>';
    const result = flattenRichTextImageGrid(nestedGrid);
    expect(result).toContain(RTE_IMAGE_GRID_ITEM_CLASS);
    expect((result.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(3);
    expect(result.indexOf('Logo A')).toBeLessThan(result.indexOf('Logo B'));
    expect(result).toContain(RTE_IMAGE_GRID_ITEM_CLASS);
    expect(result).toMatch(
      /<div class="rte-image-grid"><div class="rte-image-grid__item"><img\b/i,
    );
  });

  it('re-flattens legacy nested tiles to one img per item', () => {
    const legacyFlat =
      '<div class="rte-image-grid">' +
      '<div class="rte-image-grid__item"><div class="rte-image-grid__aspect"><img src="/a.png" alt="A" /></div></div>' +
      '<div class="rte-image-grid__item"><div class="rte-image-grid__aspect"><img src="/b.png" alt="B" /></div></div>' +
      '</div>';
    const result = flattenRichTextImageGrid(legacyFlat);
    expect((result.match(new RegExp(RTE_IMAGE_GRID_ITEM_CLASS, 'g')) ?? []).length).toBe(2);
    expect(result).toContain('src="/a.png"');
    expect(result).toContain('src="/b.png"');
    expect(result).not.toContain('rte-image-grid__aspect');
  });

  it('normalizeRichTextHtml applies image grid and leaves patents table path intact', () => {
    const result = normalizeRichTextHtml(trademarksSnippet);
    expect(result).toContain(TRADEMARKS_TABLE_CLASS);
    expect(result).toContain(RTE_IMAGE_GRID_CLASS);
    expect(result).toContain(RTE_IMAGE_GRID_ITEM_CLASS);
    expect(result).not.toContain(PATENTS_TABLE_CLASS);
    const patentsOnly =
      '<div class="responsive-table"><table><tbody><tr><td>A</td><td>B</td><td>C</td></tr></tbody></table></div>';
    expect(normalizeRichTextHtml(patentsOnly)).toContain(PATENTS_TABLE_CLASS);
  });
});

describe('isRichTextEffectivelyEmpty', () => {
  it('treats nbsp-only HTML as empty', () => {
    expect(isRichTextEffectivelyEmpty('<p>&nbsp;</p>')).toBe(true);
  });

  it('treats visible text as non-empty', () => {
    expect(isRichTextEffectivelyEmpty('<p>Patents</p>')).toBe(false);
  });
});

describe('getRichTextRegionAriaLabel', () => {
  it('prefers displayName over componentName', () => {
    expect(
      getRichTextRegionAriaLabel(
        { displayName: '  Patents table  ', componentName: 'RichText' } as never,
        'Rich text',
      ),
    ).toBe('Patents table');
  });

  it('falls back to empty-hint label when names are absent', () => {
    expect(getRichTextRegionAriaLabel({} as never, 'Rich text')).toBe('Rich text');
  });
});

