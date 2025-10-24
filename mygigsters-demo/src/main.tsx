import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './components/Toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>
)