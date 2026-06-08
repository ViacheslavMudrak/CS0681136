import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  LabelHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";

import { QuoteRequestGeneralStep } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestGeneralStep";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field }: { field?: { value?: string } }): ReactElement | null =>
    field?.value ? <span>{field.value}</span> : null,
  RichText: (): ReactElement => <span data-testid="rich-text" />,
  Image: ({ field }: { field?: { value?: { src?: string } } }): ReactElement | null =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="banner-img" /> : null,
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="banner-fallback-icon" />,
  Label: ({
    children,
    isRequired,
    ...rest
  }: {
    children?: ReactNode;
    isRequired?: boolean;
  } & LabelHTMLAttributes<HTMLLabelElement>): ReactElement => (
    <label {...rest}>
      {children}
      {isRequired ? <span aria-hidden="true">*</span> : null}
    </label>
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
  } & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Input", () => ({
  __esModule: true,
  default: (
    props: ComponentProps<"input"> & { state?: string }
  ): ReactElement => <input {...props} data-input-state={props.state} />,
}));

vi.mock("@/components/ui/Textarea", () => ({
  __esModule: true,
  default: (
    props: ComponentProps<"textarea"> & { state?: string }
  ): ReactElement => <textarea {...props} data-textarea-state={props.state} />,
}));

const baseCms = (): QuoteRequestCmsFields => ({
  ApplicationLabel: { value: "Application" },
  ApplicationPlaceholder: { value: "App ph" },
  ProductDetailsLabel: { value: "Product" },
  ProductDetailsPlaceholder: { value: "Prod ph" },
  GeneralEntryCommentsFieldLabel: { value: "Comments" },
  GeneralEntryCommentsFieldPlaceholder: { value: "Comm ph" },
  GeneralEntryCancelButtonLabel: { value: "Cancel" },
  GeneralEntrySubmitButtonLabel: { value: "Continue" },
});

describe("QuoteRequestGeneralStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultHandlers = {
    application: "",
    productDetails: "",
    comments: "",
    fieldErrors: {},
    isSaving: false,
    onChange: vi.fn(),
    onCancel: vi.fn(),
    onContinue: vi.fn(),
    onSearchOrders: vi.fn(),
  };

  it("shows reorder banner with CMS icon and search link when orders history exists", async () => {
    const user = userEvent.setup();
    const onSearchOrders = vi.fn();
    const quoteCms: QuoteRequestCmsFields = {
      ...baseCms(),
      BannerHeading: { value: "Reorder" },
      BannerText: { value: "Copy" },
      BannerLinkLabel: { value: "Search orders" },
      BannerIcon: { value: { src: "/b.svg", alt: "" } },
    };
    render(
      <QuoteRequestGeneralStep
        quoteCms={quoteCms}
        hasOrdersHistory
        {...defaultHandlers}
        onSearchOrders={onSearchOrders}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByTestId("banner-img")).toHaveAttribute("src", "/b.svg");
    await user.click(screen.getByRole("button", { name: /search orders/i }));
    expect(onSearchOrders).toHaveBeenCalled();
  });

  it("uses fallback banner icon when BannerIcon has no src", () => {
    render(
      <QuoteRequestGeneralStep
        quoteCms={{
          ...baseCms(),
          BannerHeading: { value: "H" },
          BannerIcon: { value: { src: "", alt: "" } },
        }}
        hasOrdersHistory
        {...defaultHandlers}
      />
    );
    expect(screen.getByTestId("banner-fallback-icon")).toBeInTheDocument();
  });

  it("hides banner when HideBanner is true", () => {
    render(
      <QuoteRequestGeneralStep
        quoteCms={{
          ...baseCms(),
          HideBanner: { value: true },
          BannerHeading: { value: "X" },
        }}
        hasOrdersHistory
        {...defaultHandlers}
      />
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows required markers and field errors when CMS flags and errors are set", () => {
    render(
      <QuoteRequestGeneralStep
        quoteCms={{
          ...baseCms(),
          ApplicationRequiredIndicator: { value: true },
          ProductDetailsIndicator: { value: true },
          GeneralEntryCommentsRequiredIndicator: { value: true },
        }}
        hasOrdersHistory={false}
        {...defaultHandlers}
        fieldErrors={{
          application: "App err",
          productDetails: "Prod err",
          comments: "Comm err",
        }}
      />
    );
    const asterisks = screen.getAllByText("*");
    expect(asterisks.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("App err")).toBeInTheDocument();
    expect(screen.getByText("Prod err")).toBeInTheDocument();
    expect(screen.getByText("Comm err")).toBeInTheDocument();
  });

  it("updates fields and invokes cancel / continue", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCancel = vi.fn();
    const onContinue = vi.fn();
    render(
      <QuoteRequestGeneralStep
        quoteCms={baseCms()}
        hasOrdersHistory={false}
        application="A"
        productDetails="P"
        comments="C"
        fieldErrors={{}}
        isSaving={false}
        onChange={onChange}
        onCancel={onCancel}
        onContinue={onContinue}
        onSearchOrders={vi.fn()}
      />
    );
    await user.clear(screen.getByPlaceholderText("App ph"));
    await user.type(screen.getByPlaceholderText("App ph"), "Z");
    expect(onChange).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onCancel).toHaveBeenCalled();
    expect(onContinue).toHaveBeenCalled();
  });

  it("disables footer buttons while saving", () => {
    render(
      <QuoteRequestGeneralStep
        quoteCms={baseCms()}
        hasOrdersHistory={false}
        {...defaultHandlers}
        isSaving
      />
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });
});
