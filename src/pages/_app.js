// src/pages/_app.js

import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";

const Footer = dynamic(() => import("../components/Footer"), { ssr: false });

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
        <div className="flex flex-col min-h-screen bg-light-gradient dark:bg-dark-gradient transition-colors duration-500">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;