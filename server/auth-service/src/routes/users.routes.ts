import { Router } from "express";
import { registerController } from "../controllers/users.controllers";

const userRouter = Router();

userRouter.use("/posts", (req, res) => {
  res.json({
    id: 1,
    name: "Nghinn"
  });
});

userRouter.post("/register", registerController);

export default userRouter;
