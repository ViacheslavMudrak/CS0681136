import type {
  DocumentRequestEntryPoint,
  DocumentRequestItemPayload,
  DocumentRequestLinePayload,
  DocumentRequestPayload,
  DocumentRequestRecipientPayload,
} from "@/lib/apis/document-request-api";
import { resolveAccountIdForDocumentRequest } from "@/lib/documentRequestMappings";
import type { ProfileAccount, UserProfileResponse } from "@/lib/types/user-profile";

export interface DocumentRequestContactSnapshot {
  name: string;
  email: string;
  phone: string;
}

/** Minimal CMS row shape for building `requests[]` (Label = API-facing document type name). */
export interface DocumentRequestDocTypeRow {
  id: string;
  label: string;
  value: string;
  isOther: boolean;
}

function claimString(claims: Record<string, unknown> | undefined, key: string): string {
  const v = claims?.[key];
  return typeof v === "string" ? v.trim() : "";
}

function isInvalidPreferenceEmail(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  return t === "" || t === "string" || t === "null" || t === "undefined";
}

/**
 * Portal submitter identity: DXP `parentContact[0]` for name; email from Okta, preference, or leads;
 * phone only from Okta (never accountRep / accountManager / serviceTech mobile).
 */
export function resolveDocumentRequestContact(
  profile: UserProfileResponse | null | undefined,
  oktaClaims: Record<string, unknown> | undefined
): DocumentRequestContactSnapshot {
  const parent = profile?.parentContact?.[0];
  const parentName = [parent?.firstName, parent?.lastName]
    .filter((p) => String(p ?? "").trim())
    .join(" ")
    .trim();

  const lead = profile?.leads?.[0];
  const leadPersonName = [lead?.firstName, lead?.lastName]
    .filter((p) => String(p ?? "").trim())
    .join(" ")
    .trim();
  const leadDisplayName = String(lead?.companyName ?? "").trim();
  const leadName = leadPersonName || leadDisplayName;

  const oktaName = claimString(oktaClaims, "name");
  const name = parentName || oktaName || leadName;

  const oktaEmail = claimString(oktaClaims, "email");
  const prefRaw = profile?.userPreference?.userEmail?.trim() ?? "";
  const prefEmail = isInvalidPreferenceEmail(prefRaw) ? "" : prefRaw;
  const leadEmail = String(profile?.leads?.[0]?.email ?? "").trim();
  const email = oktaEmail || prefEmail || leadEmail;

  const phone =
    claimString(oktaClaims, "phone_number") ||
    claimString(oktaClaims, "mobile_phone") ||
    claimString(oktaClaims, "phone") ||
    "";

  return { name, email, phone };
}

/**
 * Substitutes `{orderNumber}`, `{poNumber}`, `{accountId}` in
 * `NEXT_PUBLIC_DOCUMENT_REQUEST_DYNAMICS_LINK_TEMPLATE`. Returns empty string when unset.
 */
export function resolveDocumentRequestDynamicsLink(params: {
  orderNumber: string;
  poNumber: string;
  accountId: string;
}): string {
  const template = process.env.NEXT_PUBLIC_DOCUMENT_REQUEST_DYNAMICS_LINK_TEMPLATE?.trim() ?? "";
  if (!template) return "";
  return template
    .replaceAll("{orderNumber}", params.orderNumber)
    .replaceAll("{poNumber}", params.poNumber)
    .replaceAll("{accountId}", params.accountId);
}

export interface BuildDocumentRequestPayloadParams {
  entryPoint: DocumentRequestEntryPoint;
  orderNumber: string;
  poNumber: string;
  lineItems: DocumentRequestLinePayload[];
  /** Only the user-selected account (ProfileContext `selectedAccount`). */
  selectedAccount: ProfileAccount | null;
  contact: DocumentRequestContactSnapshot;
  /** Preserve UI selection order. */
  selectedDocTypeIds: string[];
  documentTypeRows: DocumentRequestDocTypeRow[];
  /** Trimmed free text when an "Other" document type is selected. */
  otherDocumentTypeText: string;
  /** Trimmed notes from the form (sent as root-level `comments` on the payload). */
  comments: string;
}

export function buildDocumentRequestPayload(
  params: BuildDocumentRequestPayloadParams
): DocumentRequestPayload {
  const accountId = resolveAccountIdForDocumentRequest(params.selectedAccount);
  const customerAccountName = String(params.selectedAccount?.companyName ?? "").trim();
  const customerAccountNumber = String(params.selectedAccount?.accountNumber ?? "").trim();

  const orderedRows: DocumentRequestDocTypeRow[] = params.selectedDocTypeIds
    .map((id) => params.documentTypeRows.find((r) => r.id === id))
    .filter((r): r is DocumentRequestDocTypeRow => Boolean(r));

  const notes = params.comments.trim();
  const otherText = params.otherDocumentTypeText.trim();

  const requests: DocumentRequestItemPayload[] = orderedRows.map((row) => {
    const item: DocumentRequestItemPayload = { documentType: row.label };
    if (row.isOther && otherText) {
      item.otherDocumentType = otherText;
    }
    return item;
  });

  const recipients: DocumentRequestRecipientPayload[] = [];
  const email = params.contact.email.trim();
  if (email) {
    recipients.push({
      email,
      name: params.contact.name.trim() || email,
    });
  }

  return {
    entryPoint: params.entryPoint,
    accountId,
    customerAccountName,
    customerAccountNumber,
    contactName: params.contact.name.trim(),
    contactEmail: email,
    contactPhone: params.contact.phone.trim(),
    dynamicsLink: resolveDocumentRequestDynamicsLink({
      orderNumber: params.orderNumber,
      poNumber: params.poNumber,
      accountId,
    }),
    orderNumber: params.orderNumber,
    poNumber: params.poNumber,
    requests,
    comments: notes,
    lineItems: params.lineItems,
    recipients,
  };
}
