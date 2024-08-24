import { Router } from 'express';
import { getUser, googleLoginController, loginController, refreshTokenController, registerController, verifyUser } from '../controllers/users.controllers';
import { validateRegistration, checkLoginBodyAndParams } from '../middlewares/index.middlewares';

const userRouter = Router();

userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);
userRouter.post('/refresh-token', refreshTokenController);
userRouter.post('/verifyUser', verifyUser);
userRouter.get('/getUser/:id', getUser)
export default userRouter;
