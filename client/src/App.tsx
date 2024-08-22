import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './router'; // This should match the export from your router.tsx

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
