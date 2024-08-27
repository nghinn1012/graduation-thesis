import { Router } from 'express';
import { getUser, googleLoginController, loginController, refreshTokenController, registerController, verifyUser } from '../controllers/index.controllers';
import { validateRegistration, checkLoginBodyAndParams } from '../middlewares/index.middlewares';
import { followAndUnFollowUserController, searchUserByNameController, updateUserControler } from '../controllers/users.controllers';
import { authenticateUser, protectedRequest } from '../middlewares/check_authorization.middlewares';

const userRouter = Router();

userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);
userRouter.post('/refresh-token', refreshTokenController);
userRouter.post('/verifyUser', verifyUser);
userRouter.get('/getUser/:id', protectedRequest, getUser)
userRouter.get('/search', searchUserByNameController);
userRouter.patch('/update/:userId', authenticateUser, updateUserControler)
userRouter.post('/follow/:id', protectedRequest, followAndUnFollowUserController)
export default userRouter;
