import { describe, expect, it } from "vitest";

import type { ContactSupportServiceSelectionItem } from "@/components/core/ContactSupport/ContactSupport.type";
import { buildAccountContactsFromSelection, resolveContactSupportLinkText } from "@/lib/contact-support-utils";
import type { UserProfileAccount } from "@/lib/types/user-profile";

const servicesSelection: ContactSupportServiceSelectionItem[] = [
  {
    id: "cms-account-manager",
    displayName: "Account Manager",
    fields: { ServiceKey: { value: "Account Manager" } },
  },
  {
    id: "cms-account-rep",
    displayName: "Account Representative",
    fields: { ServiceKey: { value: "Account Representative" } },
  },
  {
    id: "cms-service-tech",
    displayName: "Service Tech",
    fields: { ServiceKey: { value: "Service Tech" } },
  },
];

const account: UserProfileAccount = {
  id: "acc-1",
  accountManager: {
    id: "api-manager",
    name: "Pat Manager",
    email: "pat@example.com",
    mobile: "111",
  },
  accountRep: {
    id: "api-rep",
    name: "Riley Rep",
    email: "riley@example.com",
  },
  serviceTech: {
    id: "api-tech",
    name: "Sam Tech",
    email: "sam@example.com",
    mobile: "222",
  },
};

describe("buildAccountContactsFromSelection", () => {
  it("returns contacts in CMS order with Sitecore ids and display names", () => {
    const contacts = buildAccountContactsFromSelection(account, servicesSelection);

    expect(contacts).toHaveLength(3);
    expect(contacts[0]).toMatchObject({
      id: "cms-account-manager",
      fullName: "Pat Manager",
      jobTitle: "Account Manager",
    });
    expect(contacts[1]).toMatchObject({
      id: "cms-account-rep",
      jobTitle: "Account Representative",
    });
    expect(contacts[2]).toMatchObject({
      id: "cms-service-tech",
      jobTitle: "Service Tech",
    });
  });

  it("skips CMS items without ServiceKey or API data", () => {
    const selection: ContactSupportServiceSelectionItem[] = [
      { id: "no-key", displayName: "Missing Key", fields: {} },
      {
        id: "no-api",
        displayName: "Account Manager",
        fields: { ServiceKey: { value: "Account Manager" } },
      },
    ];
    const sparseAccount: UserProfileAccount = { id: "acc-2" };

    expect(buildAccountContactsFromSelection(sparseAccount, selection)).toEqual([]);
  });

  it("only includes roles present in ServicesSelection", () => {
    const selection: ContactSupportServiceSelectionItem[] = [
      {
        id: "cms-service-tech",
        fields: { ServiceKey: { value: "Service Tech" } },
      },
    ];

    const contacts = buildAccountContactsFromSelection(account, selection);
    expect(contacts).toHaveLength(1);
    expect(contacts[0]?.fullName).toBe("Sam Tech");
  });

  it("returns empty when ServicesSelection is missing or empty", () => {
    expect(buildAccountContactsFromSelection(account, undefined)).toEqual([]);
    expect(buildAccountContactsFromSelection(account, [])).toEqual([]);
  });
});

describe("resolveContactSupportLinkText", () => {
  it("uses hotline when present and non-blank", () => {
    expect(resolveContactSupportLinkText(" 1-800-555-0100 ", "CMS Hotline")).toBe("1-800-555-0100");
  });

  it("falls back to Sitecore text when hotline is missing or blank", () => {
    expect(resolveContactSupportLinkText(undefined, "CMS Hotline")).toBe("CMS Hotline");
    expect(resolveContactSupportLinkText("   ", "CMS Hotline")).toBe("CMS Hotline");
    expect(resolveContactSupportLinkText("", undefined)).toBe("");
  });
});
