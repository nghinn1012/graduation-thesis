import UserModel from "../db/models/User.models";
import { InvalidDataError } from "./invalid_data.data";


export const validateEmail = async (email?: string): Promise<void> => {
  if (email === undefined) {
    throw new InvalidDataError({
      message: "Email can not be undefined"
    });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new InvalidDataError({
      message: "Invalid email format"
    });
  }
}

export const validatePassword = (password?: string): void => {
  if (password === undefined) {
    throw new Error("Password cannot be undefined");
  }

  if (password.length < 8) {
    throw new Error("Invalid password format: Length must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error("Invalid password format: Must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    throw new Error("Invalid password format: Must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    throw new Error("Invalid password format: Must contain at least one digit");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    throw new Error("Invalid password format: Must contain at least one special character");
  }
};
