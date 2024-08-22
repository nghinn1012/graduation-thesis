import { Router } from 'express';
import { googleLoginController, loginController, registerController } from '../controllers/users.controllers';
import { validateRegistration, checkLoginBodyAndParams, validateGoogleToken } from '../middlewares/index.middlewares';

const userRouter = Router();

userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);

export default userRouter;
