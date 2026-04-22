import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../libs/theme";
import { appWithTranslation } from "next-i18next/pages";

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
