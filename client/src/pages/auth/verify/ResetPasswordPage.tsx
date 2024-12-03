import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToastContext } from "../../../hooks/useToastContext";
import { useI18nContext } from "../../../hooks/useI18nContext";
import { userFetcher } from "../../../api/user";

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

const ResetPasswordPage = () => {
  const { success, error } = useToastContext();
  const lang = useI18nContext().of("VerifySection", "SignUpForm");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    if (lang("reset-password") !== "reset-password") {
      setIsI18nReady(true);
    }
  }, [lang]);

  const handleResetPassword = async () => {
    if (!password || password !== confirmPassword) {
      error(lang("not-match"));
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

  if (!isI18nReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

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
