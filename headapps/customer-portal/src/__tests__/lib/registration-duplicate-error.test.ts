import { describe, it, expect } from "vitest";
import {
  getOktaRegistrationErrorMessage,
  isRegistrationDuplicateError,
} from "@/lib/registration-duplicate-error";

describe("getOktaRegistrationErrorMessage", () => {
  it("reads message from Error", () => {
    expect(getOktaRegistrationErrorMessage(new Error("login: already exists"))).toBe(
      "login: already exists"
    );
  });

  it("reads errorSummary from object", () => {
    expect(getOktaRegistrationErrorMessage({ errorSummary: "Email already exists" })).toBe(
      "Email already exists"
    );
  });
});

describe("isRegistrationDuplicateError", () => {
  it("returns true for common duplicate phrases", () => {
    expect(isRegistrationDuplicateError("Registration failed: Email already exists")).toBe(true);
    expect(isRegistrationDuplicateError("An object with this field already exists")).toBe(true);
    expect(isRegistrationDuplicateError("This login is invalid or already in use")).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isRegistrationDuplicateError("Network error")).toBe(false);
    expect(isRegistrationDuplicateError("Password requirements not met")).toBe(false);
  });

  it("uses raw object when message alone is ambiguous", () => {
    const raw = { errorSummary: "An object with this field already exists" };
    expect(isRegistrationDuplicateError("", raw)).toBe(true);
  });
});
