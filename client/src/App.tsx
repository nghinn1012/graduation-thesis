import { FunctionComponent } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"; // Correct import
import Register from "./auth/Register";
import Login from "./auth/Login";
import Profile from "./pages/Profile";
import { useAuth } from "./contexts/AuthContext";
import VerifyEmail from "./auth/Verify";
import Home from "./auth/Home";

interface AppProps {}

const App: FunctionComponent<AppProps> = () => {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/" element={!isAuthenticated ? <Register /> : <Navigate to="/profile"/>} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/profile"/>} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/"/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
