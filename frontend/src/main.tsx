import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { WebSocketProvider } from './hooks/useWebSocket';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <WebSocketProvider>
          <AppRouter />
        </WebSocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);