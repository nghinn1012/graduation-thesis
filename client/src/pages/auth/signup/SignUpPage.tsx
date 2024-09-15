import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userFetcher } from "../../../api/user";
import toast, { Toaster } from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthContext } from "../../../hooks/useAuthContext";
import ContentFooter from "../../../components/footer/ContentFooter";
import * as yup from "yup";
import { useI18nContext } from "../../../hooks/useI18nContext";
import { useFormik } from "formik";
import { useToastContext } from "../../../hooks/useToastContext";

const SignUpPage = () => {
  const auth = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const languageContext = useI18nContext();
  const lang = languageContext.of(SignUpPage);
  const { success, error } = useToastContext();

  const createSignUpSchema = (lang: any) => {
    return yup.object({
      name: yup.string().required("require-name"),
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
          success("Account created successfully. Please verify your email");
          setTimeout(() => navigate("/verify", { state: values }), 2000);
        })
        .catch((err) => {
          error(err);
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
        success("Account created successfully");
        setTimeout(() => {
          navigate("/"),
          auth.setAccount(response.user);
          auth.setToken(response.token.toString() || "")
        }, 2000);
      })
      .catch((error) => {
        error(error);
      });
    } catch (err) {
      error(err as string);
    }
  }
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
          <span className="mb-3 text-4xl font-bold">Create an account</span>
          <span className="font-light text-gray-400 mb-8">
            Please fill in the details to create your account
          </span>

          <form onSubmit={formik.handleSubmit}> {/* Thêm thẻ form */}
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="name" className="mb-2 text-md block">
                Name
              </label>
              <input
                type="text"
                className={`w-full p-2 border ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md placeholder:font-light placeholder:text-gray-500`}
                id="name"
                placeholder="Enter your name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.name && formik.errors.name ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.name}
                </div>
              ) : null}
            <div className="w-1/2">
              <label htmlFor="email" className="mb-2 text-md block">
                Email
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
                placeholder="Enter your email"
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
              Password
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
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.password}
                </div>
              ) : null}
          <div className="py-4">
            <label htmlFor="confirm-password" className="mb-2 text-md">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirm-password"
              placeholder="Enter your confirm password"
              className={`w-full p-2 border ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md placeholder:font-light placeholder:text-gray-500`}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.confirmPassword}
                </div>
              ) : null}
          <button className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300" type="submit">
            Sign up
          </button>
          </form>
          <button
            onClick={() => handleOAuth()}
            className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-black hover:text-white flex items-center justify-center"
          >
            <img
              src="google.svg"
              alt="Google Sign Up"
              className="w-6 h-6 inline mr-2"
            />
            Sign up with Google
          </button>
          <div className="text-center text-gray-400">
            Already have an account?
            <span className="font-bold text-black cursor-pointer">
              <Link to="/login">Sign in</Link>
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
    <ContentFooter/>
    </div>
  );
};

export default SignUpPage;
