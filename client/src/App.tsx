import { FunctionComponent } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"; // Correct import
import Register from "./auth/Register";
import Login from "./auth/Login";
import Home from "./pages/Home";
import { useAuth } from "./contexts/AuthContext";

interface AppProps {}

const App: FunctionComponent<AppProps> = () => {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <Register /> : <Navigate to="/home"/>} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home"/>} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Login/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
