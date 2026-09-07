import type { ReactNode } from "react";

import { SiteFooter } from "../src/components/site/SiteFooter";
import { SiteHeader } from "../src/components/site/SiteHeader";

import "../src/styles/tokens.css";
import "../src/styles/index.css";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content" className="site-main">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}