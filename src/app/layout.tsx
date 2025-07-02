
import '../index.css'; // Keep global styles for now
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../components/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
