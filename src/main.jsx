import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
