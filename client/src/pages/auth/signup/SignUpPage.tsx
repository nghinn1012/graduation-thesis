import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userFetcher } from "../../../api/user";
import toast, { Toaster } from "react-hot-toast";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useAuthContext } from "../../../hooks/useAuthContext";
import ContentFooter from "../../../components/footer/ContentFooter";
import * as yup from "yup";
import { useI18nContext } from "../../../hooks/useI18nContext";
import { useFormik } from "formik";
import { useToastContext } from "../../../hooks/useToastContext";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const SignUpPage = () => {
  const auth = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const languageContext = useI18nContext();
  const lang = languageContext.of("SignUpForm", "LoginPage");
  const { success, error } = useToastContext();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(
        "http://localhost:7070/users/google-login",
        {
          idToken: credentialResponse.credential,
        }
      );

      if (response.data) {
        success(lang("google-login-success"));
        auth.setAccount(response.data.user);
        auth.setToken(response.data.token || "");
      }
    } catch (err) {
      error(lang("google-login-fail", (err as Error).message));
    }
  };

  const handleGoogleError = () => {
    error(lang("google-login-fail"));
  };

  const createSignUpSchema = (lang: any) => {
    return yup.object({
      name: yup.string().required(lang("require-name")),
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
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], lang("not-match"))
        .required(lang("confirm-pass-require")),
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: createSignUpSchema(lang),
    onSubmit: (values) => {
      userFetcher
        .manualRegister(values)
        .then(() => {
          success(lang("account-created"));
          setTimeout(() => navigate("/verify", { state: values }), 2000);
        })
        .catch((err) => {
          error(lang("error-create-account"), err.message);
          console.log(err);
        });
    },
  });
  const handleSuccess = (tokenResponse: any) => {
    console.log(tokenResponse);
    try {
      userFetcher
        .loginWithGoogle(tokenResponse.credential)
        .then((response) => {
          console.log(response);
          success(lang("created-success"));
          setTimeout(() => {
            navigate("/"), auth.setAccount(response.user);
            auth.setToken(response.token.toString() || "");
          }, 2000);
        })
        .catch((error) => {
          error(lang("created-fail"), error.message);
        });
    } catch (err) {
      error(err as string);
    }
  };
  const handleOAuth = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: () => console.log("Login Failed"),
  });

  useEffect(() => {
    formik.setFormikState((prev) => ({
      ...prev,
      validationSchema: createSignUpSchema(lang),
    }));
    formik.validateForm();
  }, [languageContext.language]);

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center min-h-[91vh] bg-gray-100">
        <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
          {/* Left Side */}
          <Toaster />
          <div className="flex flex-col justify-center p-8 md:p-14">
            <span className="mb-3 text-4xl font-bold">
              {lang("create-an-account")}
            </span>
            <span className="font-light text-gray-400 mb-8">
              {lang("create-account-desc")}
            </span>

            <form onSubmit={formik.handleSubmit}>
              {" "}
              {/* Thêm thẻ form */}
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="name" className="mb-2 text-md block">
                    {lang("name")}
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2 border ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md placeholder:font-light placeholder:text-gray-500`}
                    id="name"
                    placeholder={lang("name-placeholder")}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-500 text-sm">
                      {formik.errors.name}
                    </div>
                  ) : null}
                </div>

                <div className="w-1/2">
                  <label htmlFor="email" className="mb-2 text-md block">
                    {lang("email")}
                  </label>
                  <input
                    type="email"
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
              </div>
              <div className="py-4">
                <label htmlFor="password" className="mb-2 text-md">
                  {lang("password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
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
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.password}
                  </div>
                ) : null}
              </div>
              {/* Confirm Password field with visibility toggle */}
              <div className="py-4">
                <label htmlFor="confirm-password" className="mb-2 text-md">
                  {lang("confirm-password")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirm-password"
                    placeholder={lang("confirm-password-placeholder")}
                    className={`w-full p-2 border ${
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md placeholder:font-light placeholder:text-gray-500`}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                formik.errors.confirmPassword ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.confirmPassword}
                  </div>
                ) : null}
              </div>
              <button
                className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300"
                type="submit"
                disabled={!formik.isValid}
              >
                {lang("signup")}
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
              {lang("already-have-account")}{" "}
              <span className="font-bold text-black cursor-pointer">
                <Link to="/login">{lang("signin")}</Link>
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div className="relative">
            <img
              src="background.webp"
              alt="Background"
              className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
            />
          </div>
        </div>
      </div>
      <ContentFooter />
    </div>
  );
};

export default SignUpPage;
