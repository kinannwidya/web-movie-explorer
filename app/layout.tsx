import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
  title: "Viemo",
  description: "Stream your favorite movies and series",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} bg-[#0A0A0A] text-white min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
