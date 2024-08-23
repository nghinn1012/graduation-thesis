import bcrypt from 'bcrypt';
import { SALT_NUM } from '../config/users.config';


export const hashText = (text: string): string | null => {
  let result: string | null = null;
  try {
    result = bcrypt.hashSync(text, SALT_NUM);
  } finally {
    return result;
  }
}

export const compareHash = (plainText: string, encryptedText: string): boolean | null => {
  let result: boolean | null = null;
  try {
    result = bcrypt.compareSync(plainText, encryptedText);
  } finally {
    return result;
  }
}
