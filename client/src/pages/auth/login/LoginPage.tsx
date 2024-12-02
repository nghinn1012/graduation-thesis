import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userFetcher } from "../../../api/user";
import toast, { Toaster } from "react-hot-toast";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useFormik } from "formik";
import * as yup from "yup";
import { useI18nContext } from "../../../hooks/useI18nContext";
import ContentFooter from "../../../components/footer/ContentFooter";
import { useToastContext } from "../../../hooks/useToastContext";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const LoginPage = () => {
  const auth = useAuthContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of("LoginPage");
  const { success, error } = useToastContext();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(
        "http://localhost:7070/users/google-login",
        {
          idToken: credentialResponse.credential,
        }
      );

      if (response.data) {
        success("Google login successful");
        auth.setAccount(response.data.user);
        auth.setToken(response.data.token || "");
      }
    } catch (err) {
      error((err as Error).message || "Google login failed");
    }
  };

  const handleGoogleError = () => {
    error("Google login failed. Please try again.");
  };

  const createLoginSchema = (lang: any) => {
    return yup.object({
      email: yup
        .string()
        .required(lang("require-email"))
        .email(lang("invalid-email")),
      password: yup
        .string()
        .required(lang("require-password"))
        .matches(/[a-z]/, lang("at-least-one-lower-case"))
        .matches(/[A-Z]/, lang("at-least-one-upper-case"))
        .matches(/[0-9]/, lang("at-least-one-digit"))
        .matches(/[!@#$%^&*(),.?":{}|<>]/, lang("at-least-one-special"))
        .matches(/^\S*$/, lang("no-white-space"))
        .min(8, lang("invalid-length-password")),
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: createLoginSchema(lang),
    onSubmit: (values) => {
      userFetcher
        .login(values)
        .then((response) => {
          const account = response;
          success("Login successful");
          auth.setAccount(account.user);
          auth.setToken(account?.token.toString() || "");
        })
        .catch((e) => {
          error(e);
        });
    },
  });

  useEffect(() => {
    formik.setFormikState((prev) => ({
      ...prev,
      validationSchema: createLoginSchema(lang),
    }));
    formik.validateForm();
  }, [languageContext.language]);

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center min-h-[91vh] bg-gray-100">
        <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
          {/* Left Side */}
          <Toaster />
          <div className="flex flex-col justify-center p-8 md:p-14 flex-1">
            <span className="mb-3 text-4xl font-bold">
              {lang("welcome-back")}
            </span>
            <span className="font-light text-gray-400 mb-8">
              {lang("welcome-back-desc")}
            </span>
            <form onSubmit={formik.handleSubmit}>
              <div className="py-4">
                <label htmlFor="email" className="mb-2 text-md">
                  {lang("email")}
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md placeholder:font-light placeholder:text-gray-500`}
                  name="email"
                  id="email"
                  placeholder={lang("email-placeholder")}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>
              <div className="py-4">
                <label htmlFor="password" className="mb-2 text-md">
                  {lang("password")}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={`w-full p-2 border ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md placeholder:font-light placeholder:text-gray-500`}
                  placeholder={lang("password-placeholder")}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.password}
                  </div>
                ) : null}
              </div>
              <div className="flex justify-between w-full py-4">
                <div className="mr-24">
                  <input
                    type="checkbox"
                    name="remember"
                    id="remember"
                    className="mr-2"
                  />
                  <span className="text-md">{lang("remember-me")}</span>
                </div>
                <span
                  className="font-bold text-md cursor-pointer text-black"
                  onClick={() => navigate("/forgot-password")}
                >
                  {lang("forgot-password")}
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300"
              >
                {lang("login-now")}
              </button>
            </form>
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-full mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white">
                    {lang("or-continue-with")}
                  </span>
                </div>
              </div>
              <div>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_black"
                  shape="rectangular"
                  text="signin_with"
                  size="large"
                />
              </div>
            </div>
            <div className="text-center text-gray-400">
              {lang("not-account-yet")}
              <span className="font-bold text-black cursor-pointer">
                <Link to="/signup">{lang("signup")}</Link>
              </span>
            </div>
          </div>
          {/* Right Side */}
          <div className="relative hidden md:block w-[400px]">
            <img
              src="background.webp"
              alt="Background"
              className="w-full h-full rounded-r-2xl object-cover"
            />
          </div>
        </div>
      </div>
      <ContentFooter />
    </div>
  );
};

export default LoginPage;
