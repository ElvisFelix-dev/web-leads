import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
