import Header from "@/shared/widgets/header";
import "./global.css";
import { Poppins, Roboto } from "next/font/google";
import Providers from "./providers";

export const metadata = {
  title: "Welcome to E-Shop",
  description: "Your one-stop shop for everything!",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable} font-sans`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
