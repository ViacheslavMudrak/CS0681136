export type ApiErrorResponse = {
  errorSummary?: string;
  xhr?: {
    responseJSON?: {
      errorCauses?: {
        errorKey?: string[];
        errorSummary?: string[];
        property?: string;
      }[];
      errorIntent?: string;
      errorSummary?: string;
      errorSummaryKeys?: string[];
    };
  };
};
export function isRegistrationDuplicateError(raw?: ApiErrorResponse): boolean {
  const duplicateCause = raw?.xhr?.responseJSON?.errorCauses?.find((cause: any) => {
    return cause.errorKey?.includes("registration.error.notUniqueWithinOrg");
  });
  return !!duplicateCause;
}
