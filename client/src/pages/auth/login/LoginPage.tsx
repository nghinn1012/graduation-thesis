import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userFetcher } from '../../../api/user';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useI18nContext } from '../../../hooks/useI18nContext';
import ContentFooter from '../../../components/footer/ContentFooter';
import React from 'react';

const LoginPage = () => {
  const auth = useAuthContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of(LoginPage);

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
      email: '',
      password: '',
    },
    validationSchema: createLoginSchema(lang),
    onSubmit: (values) => {
      userFetcher
        .login(values)
        .then((response) => {
          const account = response;
          toast.success('Login successful');
          auth.setAccount(account.user);
          auth.setToken(account?.token.toString() || '');
        })
        .catch((error) => {
          toast.error(error);
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
          <span className="mb-3 text-4xl font-bold">Welcome back</span>
          <span className="font-light text-gray-400 mb-8">
            Welcome back! Please enter your details
          </span>
          <form onSubmit={formik.handleSubmit}>
            <div className="py-4">
              <label htmlFor="email" className="mb-2 text-md">
                {lang("l-email")}
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
            <div className="py-4">
              <label htmlFor="password" className="mb-2 text-md">
                {lang("l-password")}
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
                <span className="text-md">Remember for 30 days</span>
              </div>
              <span className="font-bold text-md cursor-pointer text-white">
                Forgot password
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300"
            >
              Sign in
            </button>
          </form>
          <button className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-black hover:text-white">
            <img
              src="google.svg"
              alt="Google Sign In"
              className="w-6 h-6 inline mr-2"
            />
            Sign in with Google
          </button>
          <div className="text-center text-gray-400">
            Don&apos;t have an account?
            <span className="font-bold text-black cursor-pointer">
              <Link to="/signup">Sign up for free</Link>
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
