import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useToastContext } from "../../../hooks/useToastContext";
import { useI18nContext } from "../../../hooks/useI18nContext";
import { userFetcher } from "../../../api/user";

const ResetPasswordPage = () => {
  const { success, error } = useToastContext();
  const lang = useI18nContext().of("VerifySection", "SignUpForm");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!password || password !== confirmPassword) {
      error(lang("passwords-not-match"));
      return;
    }
    try {
      if (!token) {
        throw new Error("Invalid token");
      }
      await userFetcher.updatePassword(password, confirmPassword, token);
      success(lang("password-reset-success"));
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      error((err as Error).message || lang("password-reset-failed"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{lang("reset-password")}</h2>
        <p className="text-gray-500 mb-6">{lang("new-password-desc")}</p>
        <input
          type="password"
          placeholder={lang("new-password-placeholder")}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder={lang("confirm-password-placeholder")}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={handleResetPassword}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          {lang("reset-password")}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
