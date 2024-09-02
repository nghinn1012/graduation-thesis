import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import VerifyPage from "./pages/auth/verify/VerifyPage";
import AppContextProviders from "./context/AppContextProvider";
export function App() {
	return (
		<AppContextProviders>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path="/verify" element={<VerifyPage />} />
			</Routes>
		</AppContextProviders>
	);
}
