import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { ThemeProvider } from "../libs/theme";
import { ToastProvider, useToastContext } from "../components/ui/toast";
import { registerToastFn } from "../libs/toast";
import { appWithTranslation } from "next-i18next/pages";

function ToastBridge() {
  const { addToast } = useToastContext();
  useEffect(() => {
    registerToastFn(addToast);
  }, [addToast]);
  return null;
}

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastBridge />
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(App);
