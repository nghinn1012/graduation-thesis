export const userErrorTarget = {
  EMAIL: "email",
  METHOD: "method",
  PASSWORD: "password",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  TOKEN: "token",
  ACCOUNT: "account"
} as const;

export type UserErrorTarget = typeof userErrorTarget[keyof typeof userErrorTarget];

export const userErrorReason = {
  INVALID_METHOD: "invalid-method",
  EMPTY_EMAIL: "empty-email",
  INVALID_EMAIL_FORMAT: "invalid-email-format",
  EMPTY_PASSWORD: "empty-password",
  INVALID_PASSWORD_LENGTH: "invalid-password-length",
  INVALID_PASSWORD_CHARACTER_UPPER: "invalid-password-character-upper",
  INVALID_PASSWORD_CHARACTER_LOWER: "invalid-password-character-lower",
  INVALID_PASSWORD_CHARACTER_DIGIT: "invalid-password-character-digit",
  EMPTY_FIRST_NAME: "empty-first-name",
  EMPTY_LAST_NAME: "empty-last-name",
  NO_EMAIL_FOUND: "no-email-found",
  INCORRECT_PASSWORD: "incorrect-password",
  EMAIL_EXISTED: "email-existed",
  INVALID_TOKEN: "invalid-token",
  NO_ACCOUNT_FOUND: "no-account-found"
} as const;

export type UserErrorReason = typeof userErrorReason[keyof typeof userErrorReason];
