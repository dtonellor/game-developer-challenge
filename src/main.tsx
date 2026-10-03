import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

// Render the app IMMEDIATELY — do not block on MSW
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Start MSW in background — non-blocking
// API calls that happen before SW is ready will fall through (no mocking), 
// which is fine during the very brief startup window.
import('./mocks/browser')
  .then(({ worker }) =>
    worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      onUnhandledRequest: 'bypass',
    } as any)
  )
  .catch(() => {
    // Silently ignore if SW registration fails (e.g. in test environments)
  });
