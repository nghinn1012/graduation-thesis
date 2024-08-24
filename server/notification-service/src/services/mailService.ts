import { renderHtmlFromTemplate, sendMail } from "../utlis/mailer";
import { NODE_MAILER_SENDER } from "../config/notification.config";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const mailTemplates = {
  ACTIVE_ACCOUNT_MANNUAL: "active-account-mannual.ejs"
} as const;


export interface MannualAccountInfo {
  token: string;
  email: string;
}

export const sendActiveMannualAccount = async (info: MannualAccountInfo): Promise<SMTPTransport.SentMessageInfo | null> => {
  let result: SMTPTransport.SentMessageInfo | null = null;
  try {
    const html = await renderHtmlFromTemplate(mailTemplates.ACTIVE_ACCOUNT_MANNUAL, info);
    result = await sendMail({
      from: NODE_MAILER_SENDER,
      to: info.email,
      subject: `Verify your account`,
      html: html
    });
  } catch (error) {
    console.log("Send mannual account failed", error);
  } finally {
    return result;
  }
}
