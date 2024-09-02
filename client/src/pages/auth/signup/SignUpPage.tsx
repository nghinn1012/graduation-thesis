import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userFetcher } from "../../../api/user";

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    userFetcher
      .manualRegister(formData)
      .then(() => navigate("/verify", { state: formData }))
      .catch((error) => {
        const target = error?.data?.target;
        const reason = error?.data?.reason;
        if (target === "email" && reason === "email-existed") {
          console.log("Email existed");
        }
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        {/* Left Side */}
        <div className="flex flex-col justify-center p-8 md:p-14">
          <span className="mb-3 text-4xl font-bold">Create an account</span>
          <span className="font-light text-gray-400 mb-8">
            Please fill in the details to create your account
          </span>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="name" className="mb-2 text-md block">
                Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                name="name"
                id="name"
                placeholder="Enter your name"
                onChange={handleInputChange}
                value={formData.name}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="email" className="mb-2 text-md block">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                name="email"
                id="email"
                placeholder="Enter your email"
                onChange={handleInputChange}
                value={formData.email}
              />
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
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              placeholder="Create a password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </div>
          <div className="py-4">
            <label htmlFor="confirm-password" className="mb-2 text-md">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirm-password"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              placeholder="Confirm your password"
              onChange={handleInputChange}
              value={formData.confirmPassword}
            />
          </div>
          <button className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300" type="submit" onClick={handleSubmit}>
            Sign up
          </button>
          <button className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-black hover:text-white">
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
  );
};

export default SignUpPage;
