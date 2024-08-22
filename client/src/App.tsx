import React from 'react';
import './App.css';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const App: React.FC = () => {
  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;

      const response = await axios.post('http://localhost:7070/users/google-login', { idToken });

      console.log('Login Success:', response.data);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      onError={() => {
        console.log('Login Failed');
      }}
    />
  );
};

export default App;
