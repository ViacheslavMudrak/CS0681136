import type { OrderDetailApiData } from "@/components/core/OrderDetail/OrderDetail.type";

const blankMoney = {
  value: 0,
  currency: "",
  displayValue: "",
};

/**
 * Empty-shaped order detail for XM Cloud Experience Editor when no account / header id
 * is available (authors still see layout + CMS chrome).
 */
export function getBlankOrderDetailApiData(): OrderDetailApiData {
  return {
    order: {
      orderId: 0,
      orderHeaderId: 0,
      accountId: 0,
      poNumber: "",
      orderDate: "",
      orderStatus: "",
      referenceId: "",
    },
    contacts: {},
    lineItems: [],
    shipments: [],
    billingAddress: {},
    orderSummary: {
      subTotal: { ...blankMoney },
      tax: { ...blankMoney },
      totalAmount: { ...blankMoney },
    },
    invoices: [],
    documents: [],
  };
}
