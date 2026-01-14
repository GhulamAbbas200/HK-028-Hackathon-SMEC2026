import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("QRFriends Error: Root element '#root' not found in DOM.");
    return;
  }

  try {
    console.log("QRFriends: Attempting to mount React root...");
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("QRFriends: Application mounted successfully.");
  } catch (err) {
    console.error("QRFriends Critical Error:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif; background: #fff; height: 100vh;">
        <h2 style="color: #4F46E5;">Oops! Initialization Failed</h2>
        <p style="color: #64748B;">The application could not start correctly.</p>
        <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: left; overflow: auto; margin-top: 20px; font-size: 12px; color: #ef4444;">${err instanceof Error ? err.message : String(err)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #4F46E5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Try Refreshing</button>
      </div>
    `;
  }
};

// Handle mounting based on document readiness
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountApp();
} else {
  document.addEventListener('DOMContentLoaded', mountApp);
}
