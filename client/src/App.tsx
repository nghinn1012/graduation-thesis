import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import VerifyPage from "./pages/auth/verify/VerifyPage";
import AppContextProviders from "./context/AppContextProvider";
import IsNotAuthenticated from "./common/auth/IsNotAuthenticated";
import IsAuthenticated from "./common/auth/IsAuthenticated";
export function App() {
	return (
		<AppContextProviders>
        <Routes>
          <Route
            path="/"
            element={
              <IsAuthenticated>
								<HomePage />
              </IsAuthenticated>
            }
          />
          <Route
            path="/login"
            element={
              <IsNotAuthenticated>
                <LoginPage />
              </IsNotAuthenticated>
            }
          />

          <Route
            path="/signup"
            element={
              <IsNotAuthenticated>
                <SignUpPage />
              </IsNotAuthenticated>
            }
          />

          <Route path="/verify/*" element={<VerifyPage />} />
        </Routes>
		</AppContextProviders>
	);
}
