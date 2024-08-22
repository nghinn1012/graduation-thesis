import { Router } from "express";
import { googleOAuthController, loginController, registerController } from "../controllers/users.controllers";
import { validateRegistration } from "../middlewares/register_checker.middlewares";
import { checkLoginBodyAndParams } from "../middlewares/login_checker.middlewares";

const userRouter = Router();

userRouter.post("/register", validateRegistration, registerController);
userRouter.post("/login", checkLoginBodyAndParams, loginController);
userRouter.get('/oauth2/google', googleOAuthController);

export default userRouter;
