import { describe, it, expect, afterEach } from "vitest";

import {
  buildDocumentRequestPayload,
  resolveDocumentRequestContact,
  resolveDocumentRequestDynamicsLink,
} from "@/lib/document-request-payload";
import type { ProfileAccount } from "@/lib/types/user-profile";
import type { UserProfileResponse } from "@/lib/types/user-profile";

const accountA: ProfileAccount = {
  id: "6087859",
  companyName: "TYSON FOOD SERVICE - JEFFERSON",
  address: "1 Rock River Rd",
  accountNumber: "710733",
  isActive: true,
  role: "Engineer",
  organization: "TYSON",
};

const accountB: ProfileAccount = {
  id: "999",
  companyName: "Other Co",
  address: "",
  accountNumber: "99999",
  isActive: true,
  role: "Buyer",
  organization: "O",
};

describe("resolveDocumentRequestContact", () => {
  it("uses parent firstName/lastName and Okta email", () => {
    const profile: UserProfileResponse = {
      parentContact: [
        { id: "p1", firstName: "Jeremy", lastName: "Gebert", childContacts: [] },
      ],
      leads: [],
    };
    expect(
      resolveDocumentRequestContact(profile, { email: "j@example.com", name: "Okta Name" })
    ).toEqual({
      name: "Jeremy Gebert",
      email: "j@example.com",
      phone: "",
    });
  });

  it("falls back to Okta name when parent name empty", () => {
    const profile: UserProfileResponse = {
      parentContact: [{ id: "p1", firstName: "", lastName: "", childContacts: [] }],
      leads: [],
    };
    expect(resolveDocumentRequestContact(profile, { name: "Okta Only", email: "o@x.com" })).toEqual(
      {
        name: "Okta Only",
        email: "o@x.com",
        phone: "",
      }
    );
  });

  it("uses userPreference userEmail when Okta email missing", () => {
    const profile: UserProfileResponse = {
      parentContact: [{ id: "p1", firstName: "A", lastName: "B", childContacts: [] }],
      leads: [],
      userPreference: { userEmail: "pref@corp.com", defaultLanguage: "en" },
    };
    expect(resolveDocumentRequestContact(profile, {})).toEqual({
      name: "A B",
      email: "pref@corp.com",
      phone: "",
    });
  });

  it("ignores placeholder userPreference userEmail", () => {
    const profile: UserProfileResponse = {
      parentContact: [{ id: "p1", firstName: "A", lastName: "B", childContacts: [] }],
      leads: [{ id: "L1", email: "lead@example.com" }],
      userPreference: { userEmail: "string" },
    };
    expect(resolveDocumentRequestContact(profile, {})).toEqual({
      name: "A B",
      email: "lead@example.com",
      phone: "",
    });
  });

  it("uses lead email for lead-only profile", () => {
    const profile: UserProfileResponse = {
      parentContact: [],
      leads: [{ id: "1", email: "lead@co.com", firstName: "Lee" }],
    };
    expect(resolveDocumentRequestContact(profile, {})).toEqual({
      name: "Lee",
      email: "lead@co.com",
      phone: "",
    });
  });
});

describe("resolveDocumentRequestDynamicsLink", () => {
  const envKey = "NEXT_PUBLIC_DOCUMENT_REQUEST_DYNAMICS_LINK_TEMPLATE";

  afterEach(() => {
    delete process.env[envKey];
  });

  it("returns empty when template env unset", () => {
    delete process.env[envKey];
    expect(
      resolveDocumentRequestDynamicsLink({ orderNumber: "1", poNumber: "P", accountId: "99" })
    ).toBe("");
  });

  it("substitutes placeholders", () => {
    process.env[envKey] = "https://x/o/{orderNumber}?a={accountId}&p={poNumber}";
    expect(
      resolveDocumentRequestDynamicsLink({
        orderNumber: "3807217",
        poNumber: "PO1",
        accountId: "710733",
      })
    ).toBe("https://x/o/3807217?a=710733&p=PO1");
  });
});

describe("buildDocumentRequestPayload", () => {
  it("uses only the passed selectedAccount for customer fields when two accounts exist in app", () => {
    const payload = buildDocumentRequestPayload({
      entryPoint: "EP1",
      orderNumber: "ORD1",
      poNumber: "PO1",
      lineItems: [
        {
          lineId: "L1",
          customerPartNumber: "c",
          intraloxPartNumber: "i",
          description: "d",
          quantity: 2,
        },
      ],
      selectedAccount: accountA,
      contact: { name: "Jeremy Gebert", email: "j@x.com", phone: "" },
      selectedDocTypeIds: ["t1"],
      documentTypeRows: [
        { id: "t1", label: "Certificate", value: "certificate", isOther: false },
        { id: "other", label: "Other", value: "other", isOther: true },
      ],
      otherDocumentTypeText: "",
      comments: "Please rush",
    });

    expect(payload.accountId).toBe("6087859");
    expect(payload.customerAccountName).toBe("TYSON FOOD SERVICE - JEFFERSON");
    expect(payload.customerAccountNumber).toBe("710733");
    expect(payload.contactName).toBe("Jeremy Gebert");
    expect(payload.contactEmail).toBe("j@x.com");
    expect(payload.requests).toEqual([{ documentType: "Certificate" }]);
    expect(payload.comments).toBe("Please rush");
    expect(payload.recipients).toEqual([{ email: "j@x.com", name: "Jeremy Gebert" }]);
  });

  it("uses account B when selectedAccount is B", () => {
    const payload = buildDocumentRequestPayload({
      entryPoint: "EP2a",
      orderNumber: "O",
      poNumber: "P",
      lineItems: [],
      selectedAccount: accountB,
      contact: { name: "N", email: "e@e.com", phone: "+1" },
      selectedDocTypeIds: ["t1"],
      documentTypeRows: [{ id: "t1", label: "Certificate", value: "certificate", isOther: false }],
      otherDocumentTypeText: "",
      comments: "",
    });
    expect(payload.accountId).toBe("999");
    expect(payload.customerAccountName).toBe("Other Co");
    expect(payload.customerAccountNumber).toBe("99999");
  });

  it("preserves selection order and attaches otherDocumentType only on Other row", () => {
    const payload = buildDocumentRequestPayload({
      entryPoint: "EP1",
      orderNumber: "1",
      poNumber: "2",
      lineItems: [],
      selectedAccount: accountA,
      contact: { name: "U", email: "u@u.com", phone: "" },
      selectedDocTypeIds: ["other", "t1"],
      documentTypeRows: [
        { id: "t1", label: "Certificate", value: "certificate", isOther: false },
        { id: "other", label: "Other", value: "other", isOther: true },
      ],
      otherDocumentTypeText: "MSDS sheet",
      comments: "Note",
    });
    expect(payload.requests).toEqual([
      { documentType: "Other", otherDocumentType: "MSDS sheet" },
      { documentType: "Certificate" },
    ]);
    expect(payload.comments).toBe("Note");
  });

  it("returns empty recipients when email missing", () => {
    const payload = buildDocumentRequestPayload({
      entryPoint: "EP1",
      orderNumber: "1",
      poNumber: "2",
      lineItems: [],
      selectedAccount: accountA,
      contact: { name: "No Email", email: "   ", phone: "" },
      selectedDocTypeIds: ["t1"],
      documentTypeRows: [{ id: "t1", label: "Certificate", value: "certificate", isOther: false }],
      otherDocumentTypeText: "",
      comments: "",
    });
    expect(payload.recipients).toEqual([]);
    expect(payload.contactEmail).toBe("");
    expect(payload.comments).toBe("");
  });
});
