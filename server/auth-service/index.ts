import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./src/models/userModel";
import { connectDB } from "./src/db";
import authRoutes from "./src/routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.USER_PORT;

connectDB();
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/auth", authRoutes);

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: "Password Incorrect" });
    }

    const payload = {
      email,
      name: user.name,
    };

    jwt.sign(payload, "secret", { expiresIn: '24h' }, (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error signing token" });
      } else {
        return res.json({ token });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Auth-Service running on port ${PORT}`);
});
