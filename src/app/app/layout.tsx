import "../styles/globals.css";
import React from "react";
import Link from "next/link"; // Import Link component

export const metadata = {
  title: "Buyer Leads",
  description: "Mini Buyer Lead Intake App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="header">
          <div className="container">
            <h1 className="title">
              <Link href="/">
                {/* Home button */}
                Home
              </Link>
            </h1>
            <nav>
              <Link href="/buyers">Leads</Link>
              <Link href="/buyers/new">New</Link>
              <Link href="/import-export">Import/Export</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
