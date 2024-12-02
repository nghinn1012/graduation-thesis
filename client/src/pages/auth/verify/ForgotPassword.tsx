import { useState } from "react";
import { useToastContext } from "../../../hooks/useToastContext";
import { useI18nContext } from "../../../hooks/useI18nContext";
import axios from "axios";
import { userFetcher } from "../../../api/user";

const ForgotPasswordPage = () => {
  const { success, error } = useToastContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of("VerifySection");
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        error(lang("require-email"));
        return;
      }
      await userFetcher.resetPassword(email);
      success(lang("reset-link-sent"));
    } catch (err) {
      error((err as Error).message || lang("reset-link-failed"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{lang("forgot-password")}</h2>
        <p className="text-gray-500 mb-6">{lang("enter-email-desc")}</p>
        <input
          type="email"
          placeholder={lang("email-placeholder")}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleForgotPassword}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          {lang("send-reset-link")}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
