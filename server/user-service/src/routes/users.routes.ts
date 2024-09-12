import { Router } from 'express';
import {
  followAndUnFollowUserController, getSuggestUserController, getUser, googleLoginController,
  loginController, refreshTokenController, registerController, searchUserByNameController,
  updateUserControler, verifyUser
} from '../controllers/index.controllers';
import { validateRegistration, checkLoginBodyAndParams, protectedRequest, authenticateUser } from '../middlewares/index.middlewares';
import { followAndUnFollowHashtagController, getAllUsersController } from '../controllers/users.controllers';

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
userRouter.get('/', protectedRequest, getAllUsersController);

// Follow routes
userRouter.post('/followUser/:id', protectedRequest, followAndUnFollowUserController)
userRouter.get('/suggest', protectedRequest, getSuggestUserController)
userRouter.post('/followHashtag/:id', protectedRequest, followAndUnFollowHashtagController)
export default userRouter;
