export const isExternalUser = (userEmail?: string) => {
  if (!userEmail) {
    return false;
  }

  return userEmail.includes("@icreon.com") || userEmail.includes("@mailinator.com");
};
