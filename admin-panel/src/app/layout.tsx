import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GigHub Admin Panel",
  description: "Admin panel for managing service provider verifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
