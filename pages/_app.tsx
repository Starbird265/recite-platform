import '../styles/globals.css'
import '../styles/pixel-theme.css'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="pixel-bg"></div>
      <div className="min-h-screen">
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'pixel-toast',
            style: {
              border: '2px solid #6366f1',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(8px)',
              background: 'rgba(255, 255, 255, 0.95)'
            }
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default MyApp