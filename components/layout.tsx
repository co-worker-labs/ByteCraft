import { CSSProperties, ReactNode, useEffect } from "react";
import Footer, { FooterPosition } from "./footer";
import Header, { HeaderPosition } from "./header";
import { Context, createContext, useContext, useState } from "react";
import styles from "./Layout.module.css";
import { useRouter } from "next/router";
import { pathTrim } from "../utils/path";

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
  aside = true,
  className,
  style,
  bodyClassName,
  bodyStyle,
}: {
  children: ReactNode;
  title?: string;
  headerPosition?: HeaderPosition;
  footerPosition?: FooterPosition;
  hidden?: boolean;
  aside?: boolean;
  className?: string;
  style?: CSSProperties;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
}) {
  const [isHidden, setIsHidden] = useState<boolean>(hidden || false);

  const footerPos = footerPosition || "none";
  const headerPos = headerPosition || "sticky";

  const router = useRouter();
  const path = pathTrim(router.asPath);

  const config = {
    reset: () => {
      setIsHidden(hidden || false);
    },
    isHidden: isHidden,
    hidden: (hidden: boolean) => {
      setIsHidden(hidden);
    },
  };

  useEffect(() => {
    window.addEventListener("scroll", (e) => {
      const el = document.getElementById("backtopbtn");
      if (el) {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
          if (el.hasAttribute("hidden")) {
            el.removeAttribute("hidden");
          }
        } else {
          if (!el.hasAttribute("hidden")) {
            el.setAttribute("hidden", "true");
          }
        }
      }
    });
  }, [path]);

  return (
    <LayoutContext.Provider value={config}>
      <div
        hidden={isHidden}
        className={` ${footerPos == "fixed" ? "pb-5" : ""} ${bodyClassName ? bodyClassName : ""}`}
        style={bodyStyle}
      >
        <Header position={headerPos} title={title} />
        <a
          href="#"
          className={`btn rounded-circle ${styles.backUpBtn} btn-dark`}
          id="backtopbtn"
          hidden
        >
          <i className="bi bi-arrow-bar-up fs-4"></i>
        </a>
        <main className={`${className ? className : ""}`} style={style}>
          {aside ? (
            <div className="row justify-content-center px-0 gx-0">
              <div className="col d-none d-lg-block">
                <div className="w-100 row justify-content-center ps-2 mt-2"></div>
              </div>
              <div className={`col col-lg-7`}>{children}</div>
              <div className="col d-none d-lg-block">
                <div className="w-100 row justify-content-center ps-2 mt-2"></div>
              </div>
            </div>
          ) : (
            <>{children}</>
          )}
        </main>
        <Footer position={footerPos} />
      </div>
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
