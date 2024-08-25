import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./App.css"
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
    {/* <GoogleOAuthProvider clientId='703442721289-hup7m1n49sjm9dmd9tn97jqojdum3pol.apps.googleusercontent.com'> */}
      <App />
    {/* </GoogleOAuthProvider> */}
    </AuthProvider>
  </React.StrictMode>
);
