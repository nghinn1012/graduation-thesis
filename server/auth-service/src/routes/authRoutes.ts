import express from "express";
import { registerAccount } from "../controllers/userController";

const router = express.Router();

router.post("/register", registerAccount);

export default router;
