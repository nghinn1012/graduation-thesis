import { renderHtmlFromTemplate, sendMail } from "../utlis/mailer";
import { NODE_MAILER_SENDER } from "../config/notification.config";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const mailTemplates = {
  ACTIVE_ACCOUNT_MANNUAL: "active-account-mannual.ejs",
  RESET_PASSWORD: "reset-password.ejs"
} as const;


export interface MannualAccountInfo {
  token: string;
  email: string;
}

export interface UpdateProfileInfo {
  _id: string;
  type: string;
}

export const sendActiveMannualAccount = async (info: MannualAccountInfo): Promise<SMTPTransport.SentMessageInfo | null> => {
  let result: SMTPTransport.SentMessageInfo | null = null;
  try {
    const { email, token } = info;
    const html = await renderHtmlFromTemplate(mailTemplates.ACTIVE_ACCOUNT_MANNUAL, {
      email: email,
      activeUrl: "http://localhost:3000/verify?token=" + token
    });
    result = await sendMail({
      from: NODE_MAILER_SENDER,
      to: info.email,
      subject: `Xác thực tài khoản`,
      html: html
    });
  } catch (error) {
    console.log("Send mannual account failed", error);
  } finally {
    return result;
  }
}

export const sendForgotPassword = async (email: string, token: string): Promise<SMTPTransport.SentMessageInfo | null> => {
  let result: SMTPTransport.SentMessageInfo | null = null;
  try {
    const html = await renderHtmlFromTemplate(mailTemplates.RESET_PASSWORD, {
      email: email,
      resetUrl: "http://localhost:3000/reset-password?token=" + token
    });
    result = await sendMail({
      from: NODE_MAILER_SENDER,
      to: email,
      subject: `Thay đổi mật khẩu`,
      html: html
    });
  } catch (error) {
    console.log("Send forgot password failed", error);
  } finally {
    return result;
  }
}
