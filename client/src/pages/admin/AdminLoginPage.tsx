import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { AccountInfo, userFetcher } from "../../api/user";
import { useAuthContext } from "../../hooks/useAuthContext";
import { IAccountInfo } from "../../data/interface_data/account_info";
import { useI18nContext } from "../../hooks/useI18nContext";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuthContext();
  const language = useI18nContext();
  const lang = language.of("LoginPage", "AdminSection");

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      setError("Invalid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await userFetcher.login({
        email: formData.email,
        password: formData.password,
        role: "admin",
      }) as unknown as IAccountInfo;

      if (!response) {
        throw new Error(response || "Login failed");
      } else {
        const account = response;
        auth.setAccount(account.user as unknown as IAccountInfo);
        auth.setToken(account?.token.toString() || "");

        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError((err as Error).message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center justify-center">
            {lang("admin-login")}
          </h2>

          {error && (
            <div className="alert alert-error">
              <FiAlertCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{lang("email")}</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={lang("email-placeholder")}
                  className="input input-bordered w-full pr-10"
                />
                <FiMail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{lang("password")}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={lang("password-placeholder")}
                  className="input input-bordered w-full pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {lang("loading")}...
                </>
              ) : (
                lang("signin")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
