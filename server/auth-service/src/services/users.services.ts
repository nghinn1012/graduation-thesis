import bcrypt from 'bcrypt';
import UserModel from '../db/models/schemas/User.schema';
import { validateEmail } from '../data/validation.data';
import { validatePassword } from '../data/validation.data';
import { InvalidDataError } from '../data/invalid_data.data';

export const registerService = async (name: string, email: string, password: string) => {
  try {
    await validateEmail(email);
    await validatePassword(password);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword
    });

    return newUser;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message
    });
  }
};
