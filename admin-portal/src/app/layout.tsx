import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Feonix Admin Portal',
  description: 'Admin dashboard for file management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}