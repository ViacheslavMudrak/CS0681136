import { I18N } from "./dictionary-keys";

export interface OktaConfig {
  domain: string;
  clientId: string;
  redirectUri: string;
  issuer: string;
  scopes: string[];
  baseUrl: string;
  authParams: {
    issuer: string;
    responseType: string[];
    display: string;
    scopes: string[];
    pkce: boolean;
  };
  useInteractionCodeFlow: boolean;
  features: {
    registration: boolean;
    rememberMe: boolean;
    multiOptionalFactorEnroll: boolean;
    selfServiceUnlock: boolean;
    smsRecovery: boolean;
    callRecovery: boolean;
    useInteractionCodeFlow: boolean;
    resetPassword?: boolean;
    emailMagicLink?: boolean;
  };
  colors: {
    brand: string;
  };
  flow?: string;
  i18n?: Record<string, unknown>;
}

let cachedBaseConfig: Omit<OktaConfig, "features" | "flow"> | null = null;
let cachedOrigin: string | null = null;

export type AuthFlowType = "signin" | "register" | "resetPassword";

const getCurrentOrigin = (): string => {
  return typeof window !== "undefined" ? window.location.origin : "";
};

const validateEnvironmentVariables = (): {
  domain: string;
  clientId: string;
  redirectUri: string;
} => {
  const domain = process.env.NEXT_PUBLIC_OKTA_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_OKTA_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI;

  if (!domain) {
    throw new Error("NEXT_PUBLIC_OKTA_DOMAIN is not configured");
  }
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_OKTA_CLIENT_ID is not configured");
  }
  if (!redirectUri) {
    throw new Error("NEXT_PUBLIC_OKTA_REDIRECT_URI is not configured");
  }

  return { domain, clientId, redirectUri };
};

export const getBaseOktaConfig = (): Omit<OktaConfig, "features" | "flow"> => {
  const { domain, clientId } = validateEnvironmentVariables();
  const currentOrigin = getCurrentOrigin();

  if (cachedBaseConfig && cachedOrigin === currentOrigin) {
    return cachedBaseConfig as Omit<OktaConfig, "features" | "flow">;
  }

  const baseConfig: Omit<OktaConfig, "features" | "flow"> = {
    domain,
    clientId,
    issuer: `https://${domain}/oauth2/default`,
    scopes: ["openid", "profile", "email", "dxp.profile"],
    baseUrl: `https://${domain}`,
    // redirectUri is used for fallback scenarios with Interaction Code flow
    // When useInteractionCodeFlow is true, widget typically handles auth internally without redirects
    // However, redirectUri is still required for cases where redirects occur
    redirectUri: currentOrigin + "/authorization/verify",
    useInteractionCodeFlow: true, // Enables Okta Identity Engine Interaction Code flow for SPAs
    authParams: {
      issuer: `https://${domain}/oauth2/default`,
      responseType: ["code"],
      display: "page",
      scopes: ["openid", "profile", "email", "dxp.profile"],
      pkce: true, // REQUIRED: Enable PKCE (required for SPA applications)
    },
    colors: {
      brand: "#00287b", // Intralox primary blue
    },
  };

  cachedBaseConfig = baseConfig;
  cachedOrigin = currentOrigin;

  return baseConfig;
};

const getBaseFeaturesConfig = (): Partial<OktaConfig["features"]> => {
  return {
    rememberMe: false,
    multiOptionalFactorEnroll: true,
    selfServiceUnlock: true,
    smsRecovery: true,
    callRecovery: true,
    useInteractionCodeFlow: true,
  };
};

export const getOktaConfigForSignIn = (translateFn: (key: string) => string): OktaConfig => {
  const baseConfig = getBaseOktaConfig();
  const currentOrigin = getCurrentOrigin();
  return {
    ...baseConfig,
    redirectUri: currentOrigin + "/authorization/verify",
    features: {
      ...getBaseFeaturesConfig(),
      registration: false,
      resetPassword: false,
      emailMagicLink: true,
    } as OktaConfig["features"],
    flow: "login",
    i18n: getI18nConfigForSignIn(translateFn),
  };
};

export const getOktaConfigForRegister = (translateFn: (key: string) => string): OktaConfig => {
  const baseConfig = getBaseOktaConfig();

  return {
    ...baseConfig,
    features: {
      ...getBaseFeaturesConfig(),
      registration: true,
      resetPassword: false,
    } as OktaConfig["features"],
    flow: "signup",
    i18n: getI18nConfigForRegister(translateFn),
  };
};

export const getOktaConfigForResetPassword = (translateFn: (key: string) => string): OktaConfig => {
  const baseConfig = getBaseOktaConfig();
  const currentOrigin = getCurrentOrigin();
  return {
    ...baseConfig,
    redirectUri: currentOrigin + "/authorization/verify",
    features: {
      ...getBaseFeaturesConfig(),
      registration: true,
      resetPassword: true,
    } as OktaConfig["features"],
    flow: "resetPassword",
    i18n: getI18nConfigForResetPassword(translateFn),
  };
};

export const getOktaClientSecret = (): string => {
  const secret = process.env.OKTA_CLIENT_SECRET;
  if (!secret) {
    throw new Error("OKTA_CLIENT_SECRET is not configured");
  }
  return secret;
};

export const getOktaAuthConfig = (translateFn?: (key: string) => string) => {
  const defaultTranslateFn = (key: string) => key;
  const config = getOktaConfigForSignIn(translateFn || defaultTranslateFn);
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return {
    issuer: config.issuer,
    clientId: config.clientId,
    redirectUri: config.redirectUri || `${currentOrigin}/authorization/verify`,
    scopes: config.scopes,
    pkce: true,
    responseType: ["code"] as "code"[],
  };
};

export const isOktaConfigured = (): boolean => {
  const domain = process.env.NEXT_PUBLIC_OKTA_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_OKTA_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_OKTA_REDIRECT_URI;

  if (!domain || !clientId || !redirectUri) {
    return false;
  }

  return true;
};

const getBaseI18nConfig = (translateFn: (key: string) => string) => {
  return {};
};

export const getI18nConfigForSignIn = (translateFn: (key: string) => string) => {
  const baseConfig = getBaseI18nConfig(translateFn);
  return {
    en: {
      ...baseConfig,
      "primaryauth.username.placeholder": translateFn(I18N.SignInEmailLabel),
      "oform.next": translateFn(I18N.SignInSubmitText),
    },
  };
};

export const getI18nConfigForRegister = (translateFn: (key: string) => string) => {
  const baseConfig = getBaseI18nConfig(translateFn);
  return {
    en: {
      ...baseConfig,
    },
  };
};

export const getI18nConfigForResetPassword = (translateFn: (key: string) => string) => {
  const baseConfig = getBaseI18nConfig(translateFn);
  return {
    en: {
      ...baseConfig,
      "primaryauth.username.placeholder": translateFn(I18N.ResetPasswordEmailLabel),
      "oform.next": translateFn(I18N.ResetPasswordSubmitText),
    },
  };
};

export interface FieldPlaceholderMapping {
  selector: string;
  placeholderKey: string;
}

export const getPlaceholderMappingsForSignIn = (): FieldPlaceholderMapping[] => {
  return [
    {
      selector: 'input[name="identifier"]',
      placeholderKey: I18N.SignInEmailPlaceholder,
    },
    {
      selector:
        'input[name="password"], input[type="password"], input[name="credentials.passcode"]',
      placeholderKey: I18N.SignInPasswordPlaceholder,
    },
  ];
};

export const getPlaceholderMappingsForRegister = (): FieldPlaceholderMapping[] => {
  return [
    {
      selector: 'input[name="userProfile.email"]',
      placeholderKey: I18N.RegisterEmailPlaceholder,
    },
    {
      selector: 'input[name="email"]',
      placeholderKey: I18N.RegisterEmailPlaceholder,
    },
    {
      selector: 'input[type="email"]',
      placeholderKey: I18N.RegisterEmailPlaceholder,
    },
    {
      selector: 'input[name="password"], input[type="password"]',
      placeholderKey: I18N.RegisterPasswordPlaceholder,
    },
    {
      selector: 'input[name="firstName"], input[name*="firstName"]',
      placeholderKey: I18N.RegisterFirstNamePlaceholder,
    },
    {
      selector: 'input[name="lastName"], input[name*="lastName"]',
      placeholderKey: I18N.RegisterLastNamePlaceholder,
    },
    {
      selector: 'input[name="userProfile.companyRegistration"]',
      placeholderKey: I18N.RegisterCompanyPlaceholder,
    },
    {
      selector: 'input[name="userProfile.Industry"]',
      placeholderKey: I18N.RegisterIndustryPlaceholder,
    },
  ];
};

export const updateSignInFieldLabels = (translateFn: (key: string) => string) => {
  updateFormFieldLabel("credentials.passcode", translateFn(I18N.SignInPasswordLabel));

  const submitBtn = document.querySelector(
    `.mode-signin .o-form-button-bar .button`
  ) as HTMLSelectElement;

  if (submitBtn) {
    submitBtn.value = translateFn(I18N.SignInVerifyPasswordText);
  }
};

export const updateSignInRequiredValidationMessage = (
  translateFn: (key: string) => string
): void => {
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".o-form-input").forEach((el) => {
      const errorElement = el.querySelector(".okta-form-input-error");
      if (errorElement) {
        const errorControl = el.querySelector(".o-form-control");
        if (errorControl) {
          const text = errorElement.textContent || "";
          if (text === "This field cannot be left blank") {
            const dataSe = errorControl.getAttribute("data-se");
            const errorIconStr = `<span class="icon icon-16 error-16-small" role="img" aria-label="Error"></span>`;
            const defaultRequiredMsg = "is a required field";

            if (dataSe) {
              if (dataSe.indexOf("-identifier") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.SignInEmailLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-credentials.passcode") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.SignInPasswordLabel)} ${defaultRequiredMsg}`;
              }
            }
          }
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export const updateRegistrationRequiredValidationMessage = (
  translateFn: (key: string) => string
): void => {
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".o-form-input").forEach((el) => {
      const errorElement = el.querySelector(".okta-form-input-error");
      if (errorElement) {
        const errorControl = el.querySelector(".o-form-control");
        if (errorControl) {
          const text = errorElement.textContent || "";
          if (text === "This field cannot be left blank") {
            const dataSe = errorControl.getAttribute("data-se");
            const errorIconStr = `<span class="icon icon-16 error-16-small" role="img" aria-label="Error"></span>`;
            const defaultRequiredMsg = "is a required field";

            if (dataSe) {
              if (dataSe.indexOf("-userProfile.firstName") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterFirstNameLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-userProfile.lastName") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterLastNameLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-userProfile.email") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterEmailLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-userProfile.companyRegistration") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterCompanyLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-userProfile.jobRoleRegistration") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterJobRoleLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-userProfile.Industry") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterIndustryLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-userProfile.country") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterCountryLabel)} ${defaultRequiredMsg}`;
              }

              if (dataSe.indexOf("-credentials.passcode") > -1) {
                errorElement.innerHTML = `${errorIconStr} ${translateFn(I18N.RegisterPasswordLabel)} ${defaultRequiredMsg}`;
              }
            }
          }
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export const updateRegisterFieldLabels = (translateFn: (key: string) => string) => {
  updateFormFieldLabel("userProfile.email", translateFn(I18N.RegisterEmailLabel));
  updateFormFieldLabel("userProfile.firstName", translateFn(I18N.RegisterFirstNameLabel));
  updateFormFieldLabel("userProfile.lastName", translateFn(I18N.RegisterLastNameLabel));
  updateFormFieldLabel("userProfile.companyRegistration", translateFn(I18N.RegisterCompanyLabel));
  updateFormFieldLabel("userProfile.jobRoleRegistration", translateFn(I18N.RegisterJobRoleLabel));
  updateFormFieldLabel("userProfile.Industry", translateFn(I18N.RegisterIndustryLabel));
  updateFormFieldLabel("userProfile.country", translateFn(I18N.RegisterCountryLabel));

  console.log({
    "userProfile.email": translateFn(I18N.RegisterEmailLabel),
    "userProfile.firstName": translateFn(I18N.RegisterFirstNameLabel),
    "userProfile.lastName": translateFn(I18N.RegisterLastNameLabel),
    "userProfile.companyRegistration": translateFn(I18N.RegisterCompanyLabel),
    "userProfile.jobRoleRegistration": translateFn(I18N.RegisterJobRoleLabel),
    "userProfile.Industry": translateFn(I18N.RegisterIndustryLabel),
    "userProfile.country": translateFn(I18N.RegisterCountryLabel),
  });

  setTimeout(() => {
    updateSelectPlaceholder(
      "userProfile.jobRoleRegistration",
      translateFn(I18N.RegisterJobRolePlaceholder)
    );
    updateSelectPlaceholder("userProfile.Industry", translateFn(I18N.RegisterIndustryPlaceholder));
    updateSelectPlaceholder("userProfile.country", translateFn(I18N.RegisterCountryPlaceholder));
  }, 100);

  const submitBtn = document.querySelector(
    `.mode-register .o-form-button-bar .button`
  ) as HTMLSelectElement;

  if (submitBtn) {
    submitBtn.value = translateFn(I18N.RegisterSubmitText);
  }
};

export const getPlaceholderMappingsForResetPassword = (): FieldPlaceholderMapping[] => {
  return [
    {
      selector: 'input[name="identifier"]',
      placeholderKey: I18N.ResetPasswordEmailPlaceholder,
    },
  ];
};

function updateSelectPlaceholder(fieldName: string, newPlaceholder: string): void {
  const placeholderSpan = document.querySelector<HTMLSpanElement>(
    `[data-se="o-form-input-${fieldName}"] .chzn-default span`
  );

  if (placeholderSpan) {
    placeholderSpan.textContent = newPlaceholder;
  }
}

const updateFormFieldLabel = (fieldName: string, newLabel: string): void => {
  const fieldset = document.querySelector(`[data-se="o-form-fieldset-${fieldName}"]`);

  if (!fieldset) {
    console.warn(`Fieldset not found for field: ${fieldName}`);
    return;
  }

  const labelElement = fieldset.querySelector('[data-se="o-form-label"] label');

  if (!labelElement) {
    console.warn(`Label not found in fieldset: ${fieldName}`);
    return;
  }

  labelElement.textContent = newLabel;
};

export const updateOktaInputPlaceholders = (
  container: HTMLElement | null,
  fieldMappings: FieldPlaceholderMapping[],
  translateFn: (key: string) => string,
  options: {
    overwriteExisting?: boolean;
    fallbackToLabel?: boolean;
  } = {}
): void => {
  if (!container || typeof window === "undefined") {
    return;
  }

  const { overwriteExisting = false, fallbackToLabel = false } = options;

  fieldMappings.forEach(({ selector, placeholderKey }) => {
    try {
      const inputs = container.querySelectorAll(selector);
      const translatedPlaceholder = translateFn(placeholderKey);

      inputs.forEach((input: any) => {
        if (input && translatedPlaceholder && translatedPlaceholder !== placeholderKey) {
          if (overwriteExisting || !input.placeholder || input.placeholder.trim() === "") {
            input.placeholder = translatedPlaceholder;
          }
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Invalid selector for placeholder update: ${selector}`, error);
      }
    }
  });
};

export const getEmailFromResponse = (response: any) => {
  return (
    response?.user?.profile?.email ||
    response?.context?.user?.identifier ||
    response?.user?.identifier ||
    null
  );
};

export const getErrorMessageFromError = (
  error: any,
  translateFn?: (key: string) => string
): string => {
  if (!error) {
    return "";
  }

  if (error instanceof Error) {
    const message = error.message;

    if (message && !message.includes("[object") && message.trim() !== "") {
      return message;
    }
  }

  if (typeof error === "string") {
    if (error.includes("[object")) {
      return translateFn
        ? translateFn(I18N.WidgetFailedToLoad)
        : "Password reset failed. Please try again.";
    }
    return error;
  }

  if (error && typeof error === "object") {
    const { responseJSON } = error?.xhr ?? {};
    let errMsg = Array.isArray(responseJSON?.errorSummary)
      ? responseJSON?.errorSummary?.[0]
      : responseJSON?.errorSummary;

    if (errMsg) {
      return errMsg;
    }

    // errMsg = Array.isArray(responseJSON?.errorCauses)
    //   ? responseJSON?.errorCauses?.[0]?.errorSummary?.[0]
    //   : responseJSON?.errorCauses?.[0]?.errorSummary;

    const { errorCauses } = responseJSON;
    const errorSummary = errorCauses?.[0]?.errorSummary;

    errMsg = Array.isArray(errorCauses)
      ? Array.isArray(errorSummary)
        ? errorSummary?.[0]
        : errorSummary
      : errorSummary;
    if (errMsg) {
      return errMsg;
    }

    return translateFn
      ? translateFn(I18N.WidgetFailedToLoad)
      : "Password reset failed. Please try again.";
  }

  return translateFn
    ? translateFn(I18N.WidgetFailedToLoad)
    : "Password reset failed. Please try again.";
};
