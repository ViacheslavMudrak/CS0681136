/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: {
    password?: string;
    confirmPassword?: string;
  };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): string | undefined {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  // Add more password strength requirements as needed
  // Example: require uppercase, lowercase, numbers, special characters
  return undefined;
}

/**
 * Validate password and confirm password match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return undefined;
}

/**
 * Validate complete password form
 */
export function validatePasswordForm(
  password: string,
  confirmPassword: string
): PasswordValidationResult {
  const errors: PasswordValidationResult["errors"] = {};

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  const confirmPasswordError = validatePasswordMatch(password, confirmPassword);
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
