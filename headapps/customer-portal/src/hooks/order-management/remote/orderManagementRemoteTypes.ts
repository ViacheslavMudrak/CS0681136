import type { InvoiceRecord } from "@/lib/apis/invoices-api";
import type { OrderRecord, QuoteRecord } from "@/lib/orderManagementUtils";

export type OrderManagementRemoteFetchPatch = {
  remoteOrders: OrderRecord[] | null;
  remoteInvoices: InvoiceRecord[] | null;
  remoteQuotes: QuoteRecord[] | null;
  apiLive: boolean;
  apiTotalRecords: number;
  loadError: string | null;
};
