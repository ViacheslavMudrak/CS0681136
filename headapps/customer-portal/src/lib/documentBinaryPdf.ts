"use client";

import {
  fetchOrderDocumentPdfBlob,
} from "@/lib/apis/order-documents-api";
import { resolveDocumentPathForBinaryFetch } from "@/lib/safe-document-download-url";

export interface OpenBinaryPdfInNewTabInput {
  documentUrl?: string | null;
  requestId?: string;
  language?: string;
  requestSource?: string;
  suppressErrorToast?: boolean;
}

export function resolveBinaryPdfDocumentUrl(documentUrl?: string | null): string | null {
  const trimmed = documentUrl?.trim();
  if (!trimmed) return null;

  return resolveDocumentPathForBinaryFetch(trimmed) ?? trimmed;
}

function saveBlobAsAttachment(blob: Blob, filenameHint: string): void {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filenameHint || "document.pdf";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Downloads a document via the authenticated DXP BFF binary proxy (no arbitrary URL fetch).
 * Rejects when the URL is not a trusted document path or configured API binary endpoint.
 */
export async function downloadDocumentAsAttachment(
  documentUrl: string,
  filenameHint: string
): Promise<void> {
  const path = resolveDocumentPathForBinaryFetch(documentUrl);
  if (!path) {
    throw new Error("Download failed");
  }

  const blob = await fetchOrderDocumentPdfBlob({ path });
  saveBlobAsAttachment(blob, filenameHint);
}

function hasPdfHeader(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 5) return false;
  const bytes = new Uint8Array(buffer, 0, 5);
  return (
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  );
}

function toPdfBlob(blob: Blob): Blob {
  const mime = blob.type.toLowerCase();
  if (mime.includes("pdf")) {
    return blob;
  }
  // Keep original bytes and only normalize MIME for browser rendering.
  return blob.slice(0, blob.size, "application/pdf");
}

export const DOCUMENT_BINARY_OPEN_FAILED_TOAST_EVENT = "customerportal:document-binary-open-failed";

function emitDocumentBinaryOpenFailedToast(detail?: { title?: string; message?: string }): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(DOCUMENT_BINARY_OPEN_FAILED_TOAST_EVENT, {
      detail: {
        title: detail?.title ?? "Unable to open document",
        message:
          detail?.message ??
          "The document could not be opened because the PDF response is invalid or incomplete.",
      },
    })
  );
}

function showDownloadFailedAlert(openedWindow: Window): void {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Download failed</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: #f8f8f8;
      }
      .alert {
        width: min(440px, calc(100% - 32px));
        background: #fff;
        border: 1px solid #d6d6d6;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
      }
      .title {
        margin: 0 0 12px;
        font-size: 18px;
        line-height: 1.3;
      }
      .message {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.5;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
      }
      button {
        border: 1px solid #8b8b8b;
        background: #fff;
        color: #111;
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      }
      button:hover { background: #f1f1f1; }
    </style>
  </head>
  <body>
    <section class="alert" role="alert" aria-live="assertive">
      <h1 class="title">Unable to download document.</h1>
      <p class="message">The selected document is unavailable right now.</p>
      <div class="actions">
        <button type="button" id="close-btn">Close</button>
      </div>
    </section>
    <script>
      const closeBtn = document.getElementById("close-btn");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          window.close();
        });
      }
    </script>
  </body>
</html>`;
  openedWindow.document.open();
  openedWindow.document.write(html);
  openedWindow.document.close();
}

export async function openBinaryPdfInNewTab(input: OpenBinaryPdfInNewTabInput): Promise<void> {
  // Open a tab synchronously from the click event to avoid popup-blocker drops
  // when async network work completes.
  const openedWindow = window.open("about:blank", "_blank");
  if (!openedWindow) {
    throw new Error("Unable to open PDF tab.");
  }
  openedWindow.opener = null;

  const path = resolveBinaryPdfDocumentUrl(input.documentUrl);
  if (!path) {
    showDownloadFailedAlert(openedWindow);
    if (!input.suppressErrorToast) {
      emitDocumentBinaryOpenFailedToast({
        title: "Unable to download document.",
        message: "The selected document does not have a valid download URL.",
      });
    }
    throw new Error("Unable to download document.");
  }
  try {
    const rawBlob = await fetchOrderDocumentPdfBlob({
      path,
      requestId: input.requestId,
      language: input.language,
      requestSource: input.requestSource,
    });
    const rawBuffer = await rawBlob.arrayBuffer();
    // Keep checks minimal to avoid rejecting PDFs that browsers can still render.
    if (!hasPdfHeader(rawBuffer)) {
      throw new Error("Binary response is not a PDF payload.");
    }
    if (rawBlob.size === 0) {
      throw new Error("Binary response is empty.");
    }

    // Keep bytes exactly as received; only normalize MIME when needed.
    const pdfBlob = toPdfBlob(rawBlob);

    const objectUrl = URL.createObjectURL(pdfBlob);
    openedWindow.location.replace(objectUrl);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    showDownloadFailedAlert(openedWindow);
    if (!input.suppressErrorToast) {
      emitDocumentBinaryOpenFailedToast();
    }
    throw error;
  }
}
