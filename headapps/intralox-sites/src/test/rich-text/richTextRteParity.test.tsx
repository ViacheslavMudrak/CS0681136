import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Default } from "components/rich-text/RichText";
import type { RichTextProps } from "components/rich-text/RichText.type";

vi.mock("lib/rich-text-i18n", () => ({
  getRichTextLabels: vi.fn(async () => ({ emptyHint: "Rich text" })),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  RichText: ({
    field,
    className,
  }: {
    field?: { value?: string };
    className?: string;
  }) => (
    <div
      data-testid="rich-text"
      className={className}
      dangerouslySetInnerHTML={{ __html: field?.value ?? "" }}
    />
  ),
}));

function tokenSet(className: string): Set<string> {
  return new Set(
    className
      .trim()
      .split(/\s+/)
      .map((t) => t.replaceAll("&#x27;", "'"))
      .filter(Boolean),
  );
}

function createProps(overrides: Partial<RichTextProps> = {}): RichTextProps {
  return {
    rendering: { componentName: "RichText" } as never,
    params: { styles: "", RenderingIdentifier: "parity" },
    page: {
      mode: { isEditing: false },
      layout: { sitecore: { route: {} } },
      ...overrides.page,
    },
    fields: overrides.fields,
  } as RichTextProps;
}

describe("Rich Text styling parity (rendered className vs migration snapshot)", () => {
  it("applies the full field stack on ContentSdkRichText", async () => {
    const snapshotPath = resolve(
      __dirname,
      "fixtures/rich-text-field-utilities.snapshot.txt",
    );
    const snapshotSet = tokenSet(readFileSync(snapshotPath, "utf8"));

    const ui = await Default(
      createProps({ fields: { Text: { value: "<p>Body</p>" } } }),
    );
    render(ui);

    const fieldSet = tokenSet(screen.getByTestId("rich-text").className);
    expect(fieldSet.size).toBe(822);
    expect(snapshotSet.size).toBe(822);
    expect([...fieldSet].filter((u) => !snapshotSet.has(u))).toEqual([]);
    expect([...snapshotSet].filter((u) => !fieldSet.has(u))).toEqual([]);
  });

  it("applies table section padding on the region when HTML has a table", async () => {
    const ui = await Default(
      createProps({
        fields: { Text: { value: "<table><tr><td>A</td></tr></table>" } },
      }),
    );
    render(ui);
    expect(screen.getByRole("region").className).toContain("!pt-12");
  });

  it("applies trademarks catalog wrapper utilities on component-content", async () => {
    const ui = await Default(
      createProps({
        fields: {
          Text: {
            value:
              '<table class="trademarks-table" data-trademarks-catalog="true"><tr><td>x</td></tr></table>',
          },
        },
      }),
    );
    render(ui);
    const content = document.querySelector(".component-content");
    expect(content?.className).toContain("rte-trademarks-catalog");
  });
});
