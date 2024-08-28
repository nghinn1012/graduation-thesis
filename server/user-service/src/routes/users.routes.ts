import { Router } from 'express';
import {
  followAndUnFollowUserController, getSuggestUserController, getUser, googleLoginController,
  loginController, refreshTokenController, registerController, searchUserByNameController,
  updateUserControler, verifyUser
} from '../controllers/index.controllers';
import { validateRegistration, checkLoginBodyAndParams } from '../middlewares/index.middlewares';
import { authenticateUser, protectedRequest } from '../middlewares/check_authorization.middlewares';

const userRouter = Router();

// Auth routes
userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);
userRouter.post('/refresh-token', refreshTokenController);
userRouter.post('/verifyUser', verifyUser);

// User routes
userRouter.get('/getUser/:id', protectedRequest, getUser)
userRouter.get('/search', searchUserByNameController);
userRouter.patch('/update/:id', authenticateUser, updateUserControler)
userRouter.post('/follow/:id', protectedRequest, followAndUnFollowUserController)
userRouter.get('/suggest', protectedRequest, getSuggestUserController)
export default userRouter;
