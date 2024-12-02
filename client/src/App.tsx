import { Routes, Route, useLocation } from "react-router-dom";
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
import AppMainCenter from "./context/MainContext";
import ForgotPasswordPage from "./pages/auth/verify/ForgotPassword";
import ResetPasswordPage from "./pages/auth/verify/ResetPasswordPage";
export function App() {
  const location = useLocation();
  return (
    <AppContextProviders>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Routes>
          <Route
            path="/*"
            element={
              <IsAuthenticated>
                <div className="flex max-w-7xl mx-auto">
                  <Sidebar />
                  <AppMainCenter/>
                  {location.pathname !== '/posts/explore' && <RightPanel />}
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </GoogleOAuthProvider>
    </AppContextProviders>
  );
}
