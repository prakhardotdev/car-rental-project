import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f1a38',
                color: '#eee9e0',
                border: '1px solid rgba(200,162,50,0.3)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#c8a232', secondary: '#0f1a38' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#0f1a38' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
