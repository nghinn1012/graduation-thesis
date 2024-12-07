import { Router } from 'express';
import {
  followAndUnFollowUserController, getSuggestUserController, getUser, googleLoginController,
  loginController, refreshTokenController, registerController,
  searchAndFilterUserController,
  updateUserControler, verifyUser
} from '../controllers/index.controllers';
import { validateRegistration, checkLoginBodyAndParams, protectedRequest, authenticateUser } from '../middlewares/index.middlewares';
import { banndedOrUnbanndedUserController, getAllUsersController, getFollowersController, getFollowingController } from '../controllers/users.controllers';
import { resendEmailVerifyController, resetPasswordController, updatePasswordController } from '../controllers/auth.controllers';

const userRouter = Router();

// Auth routes
userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);
userRouter.post('/refresh-token', refreshTokenController);
userRouter.post('/verifyUser', verifyUser);
userRouter.post('/resend-verify', resendEmailVerifyController);
userRouter.post("/reset-password", resetPasswordController);
userRouter.post("/update-password", protectedRequest, updatePasswordController);

// User routes
userRouter.get('/getUser/:id', protectedRequest, getUser)
userRouter.get('/search', protectedRequest, searchAndFilterUserController);
userRouter.patch('/update/:id', authenticateUser, updateUserControler)
userRouter.get('/', protectedRequest, getAllUsersController);

// Follow routes
userRouter.post('/followUser/:id', protectedRequest, followAndUnFollowUserController)
userRouter.get('/suggest', protectedRequest, getSuggestUserController)
userRouter.get('/followers/:id', protectedRequest, getFollowersController)
userRouter.get('/following/:id', protectedRequest, getFollowingController)
userRouter.post('/banned/:id', protectedRequest, banndedOrUnbanndedUserController)
export default userRouter;
