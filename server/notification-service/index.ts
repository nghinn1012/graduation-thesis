import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./src/db";
import { NOTIFICATION_PORT } from "./src/config";
import notiRouter from "./src/routes/notiRoutes";
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());

connectDB();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(notiRouter);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "nth03.1012@gmail.com",
    pass: "jmpg gmuc nhml cqar",
  },
});

async function main() {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
    to: "ngo.thao.huong@sun-asterisk.com",
    subject: "Hello ✔",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);

app.listen(NOTIFICATION_PORT, () => {
  console.log(`Notification-Service running on port ${NOTIFICATION_PORT}`);
});
