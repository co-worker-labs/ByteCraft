"use client";

import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  Context,
  createContext,
  useContext,
  useState,
} from "react";
import Footer, { FooterPosition } from "./footer";
import Header, { HeaderPosition } from "./header";
import FloatingToolbar from "./floating-toolbar";
import { ArrowUp } from "lucide-react";
import { usePathname } from "../i18n/navigation";
import { pathTrim } from "../utils/path";
import { useFullscreen } from "../hooks/use-fullscreen";
import { useTranslations } from "next-intl";

interface LayoutSettings {
  reset: () => void;
  isHidden: boolean;
  hidden: (hidden: boolean) => void;
}

const LayoutContext: Context<LayoutSettings> = createContext<LayoutSettings>({
  reset: () => {},
  isHidden: false,
  hidden: () => {},
});

export default function Layout({
  children,
  title,
  headerPosition,
  footerPosition,
  hidden,
  className,
  style,
  bodyClassName,
  bodyStyle,
  hideToolsButton,
  categoryLabel,
  categorySlug,
}: {
  children: ReactNode;
  title?: string;
  headerPosition?: HeaderPosition;
  footerPosition?: FooterPosition;
  hidden?: boolean;
  className?: string;
  style?: CSSProperties;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  hideToolsButton?: boolean;
  categoryLabel?: string;
  categorySlug?: string;
}) {
  const [isHidden, setIsHidden] = useState<boolean>(hidden || false);
  const [showBackTop, setShowBackTop] = useState(false);
  const fullscreen = useFullscreen();
  const tc = useTranslations("common");

  const isInFullscreen = fullscreen.isFullscreen;

  const footerPos =
    isInFullscreen || footerPosition === "hidden" ? "hidden" : footerPosition || "none";
  const headerPos =
    isInFullscreen || headerPosition === "hidden" ? "hidden" : headerPosition || "sticky";

  const pathname = usePathname();
  const path = pathTrim(pathname);

  const config = {
    reset: () => {
      setIsHidden(hidden || false);
    },
    isHidden: isHidden,
    hidden: (hidden: boolean) => {
      setIsHidden(hidden);
    },
  };

  const handleScroll = useCallback(() => {
    setShowBackTop(window.scrollY > 400);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, path]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LayoutContext.Provider value={config}>
      <div
        hidden={isHidden}
        className={`min-h-screen flex flex-col ${footerPos === "fixed" ? "pb-5" : ""} ${bodyClassName || ""}`}
        style={bodyStyle}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-bg-elevated focus:text-fg-primary focus:border focus:border-accent-cyan focus:shadow-lg focus:outline-none"
        >
          {tc("skipToMain")}
        </a>
        <Header
          position={headerPos}
          title={title}
          hideToolsButton={hideToolsButton}
          categoryLabel={categoryLabel}
          categorySlug={categorySlug}
        />

        {isInFullscreen && <FloatingToolbar />}

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className={`fixed bottom-16 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-bg-surface text-fg-secondary shadow-card hover:text-accent-cyan hover:border-accent-cyan/40 transition-all duration-300 sm:right-8 sm:bottom-16 max-sm:right-4 max-sm:bottom-12 ${
            showBackTop
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          <ArrowUp size={18} />
        </button>

        <main
          id="main-content"
          className={`flex-1 ${isInFullscreen ? "w-full" : "mb-6"} ${className || ""}`}
          style={style}
        >
          {children}
        </main>

        <Footer position={footerPos} />
      </div>
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
