import "./globals.css";
import Sidebar from "./components/Sidebar";
import { UserProvider } from "./context/UserContext";
import { getCurrentUser } from "./auth/nextjs/currentUser";
export const metadata = {
  title: "Feonix Admin Portal",
  description: "Admin dashboard for file management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser({ withFullUser: true });
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <UserProvider user={user}>
          <Sidebar />
          <main className="flex-1">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
