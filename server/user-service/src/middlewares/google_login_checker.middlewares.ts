import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { InvalidDataError } from '../data/invalid_data.data';
import { GOOGLE_CLIENT_ID } from '../config/users.config';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
interface UserRequest extends Request {
  user: {
    email: string;
    name: string;
  };
}

export const validateGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      throw new InvalidDataError({ message: 'Google authentication failed' });
    }

    const { email, name } = payload;

    if (!email || !name) {
      throw new InvalidDataError({ message: 'Missing email or name from Google account' });
    }

    (req as UserRequest).user = { email, name };

    next();
  } catch (error) {
    next(new InvalidDataError({
      message: (error as Error).message || 'Google login failed',
    }));
  }
};
