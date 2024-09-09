import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import VerifyPage from "./pages/auth/verify/VerifyPage";
import AppContextProviders from "./context/AppContextProvider";
import IsNotAuthenticated from "./common/auth/IsNotAuthenticated";
import IsAuthenticated from "./common/auth/IsAuthenticated";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/config";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import React from "react";
import PostDetail from "./pages/post/PostDetail";
import AppMainCenter from "./context/MainContext";
import I18nContextProvider from "./context/I18nContext";
export function App() {
  return (
    <I18nContextProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContextProviders>
        <Routes>
          <Route
            path="/*"
            element={
              <IsAuthenticated>
                <div className="flex max-w-7xl mx-auto">
                  <Sidebar />
                  <AppMainCenter/>
                  <RightPanel />
                </div>
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
      </GoogleOAuthProvider>
    </I18nContextProvider>
  );
}
