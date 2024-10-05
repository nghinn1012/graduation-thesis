import { InvalidDataError } from "./invalid_data_error";

export const toNotFoundError = (field: string): InvalidDataError => {
  return new InvalidDataError({
    message: `No ${field} found`,
    data: {
      target: field,
      reason: `no-${field}-found`
    }
  });
}

export const toInvalidFormatError = (field: string): InvalidDataError => {
  return new InvalidDataError({
    message: `Invalid ${field} format`,
    data: {
      target: field,
      reason: `invalid-${field}-format`
    }
  });
}

export const throwErrorIfNotFound = (field: string, value: any,): void => {
  if (!value) throw toNotFoundError(field);
}

type IFnChecker = (value: any) => boolean;

export const throwErrorIfInvalidFormat = (field: string, value: any, checkers: IFnChecker[]): void => {
  if (!checkers.every(checker => checker(value))) {
    throw toInvalidFormatError(field);
  }
}
