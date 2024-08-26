import { Router } from 'express';
import { getUser, googleLoginController, loginController, refreshTokenController, registerController, verifyUser } from '../controllers/index.controllers';
import { validateRegistration, checkLoginBodyAndParams } from '../middlewares/index.middlewares';
import { searchUserByNameController, updateUserControler } from '../controllers/users.controllers';
import { authenticateUser } from '../middlewares/check_authorization.middlewares';

const userRouter = Router();

userRouter.post('/register', validateRegistration, registerController);
userRouter.post('/login', checkLoginBodyAndParams, loginController);
userRouter.post('/google-login', googleLoginController);
userRouter.post('/refresh-token', refreshTokenController);
userRouter.post('/verifyUser', verifyUser);
userRouter.get('/getUser/:id', getUser)
userRouter.get('/search', searchUserByNameController);
userRouter.patch('/update/:userId', authenticateUser, updateUserControler)
export default userRouter;
