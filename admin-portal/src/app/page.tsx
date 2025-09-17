import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Admin Portal</h1>
      <Link href="/upload" className="text-blue-600 underline hover:text-blue-800">
        Go to File Upload
      </Link>
    </main>
  );
}