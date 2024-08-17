import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./User";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.USER_PORT;

mongoose
  .connect("mongodb+srv://nghinn1012:Nghin1012@cluster0.8gwxcfk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log(`Auth-Service DB Connected`);
  })
  .catch((error) => {
    console.error("Error connecting to the database", error);
  });

app.use(express.json());

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

app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      name,
      password,
    });

    await newUser.save();
    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth-Service running on port ${PORT}`);
});
