import { Router } from 'express';
import { googleLoginController, loginController, refreshTokenController, registerController, verifyUser } from '../controllers/users.controllers';
import { validateRegistration, checkLoginBodyAndParams } from '../middlewares/index.middlewares';

const userRouter = Router();

userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);
userRouter.post('/refresh-token', refreshTokenController);
userRouter.post('/verifyUser', verifyUser);
export default userRouter;
