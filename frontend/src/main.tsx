import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from '@material-tailwind/react';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider> {}
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);