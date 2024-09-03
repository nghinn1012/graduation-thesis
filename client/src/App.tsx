import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import VerifyPage from "./pages/auth/verify/VerifyPage";
import AppContextProviders from "./context/AppContextProvider";
import IsNotAuthenticated from "./common/auth/IsNotAuthenticated";
import IsAuthenticated from "./common/auth/IsAuthenticated";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/config";
export function App() {
	return (
		<AppContextProviders>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
      </GoogleOAuthProvider>
		</AppContextProviders>
	);
}
