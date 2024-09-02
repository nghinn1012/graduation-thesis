import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userFetcher } from "../../../api/user";
import toast, { Toaster } from "react-hot-toast";
import { useAuthContext } from "../../../hooks/useAuthContext";

const LoginPage: React.FC = () => {
  const auth = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    userFetcher
      .login(formData)
      .then((response) => {
        const account = response;
        toast.success("Login successful");
        setTimeout(() => {
          navigate("/")
          auth.setAccount(account.user)
          auth.setToken(account?.token.toString() || "")
        }, 3000);

      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        {/* Left Side */}
        <Toaster />
        <div className="flex flex-col justify-center p-8 md:p-14">
          <span className="mb-3 text-4xl font-bold">Welcome back</span>
          <span className="font-light text-gray-400 mb-8">
            Welcome back! Please enter your details
          </span>
          <div className="py-4">
            <label htmlFor="email" className="mb-2 text-md">
              Email
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="py-4">
            <label htmlFor="password" className="mb-2 text-md">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="pass"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-between w-full py-4">
            <div className="mr-24">
              <input type="checkbox" name="ch" id="ch" className="mr-2" />
              <span className="text-md">Remember for 30 days</span>
            </div>
            <span className="font-bold text-md cursor-pointer">
              Forgot password
            </span>
          </div>
          <button className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300" onClick={handleSubmit}>
            Sign in
          </button>
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
        <div className="relative">
          <img
            src="background.webp"
            alt="Background"
            className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
