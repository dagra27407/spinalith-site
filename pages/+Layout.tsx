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
      <SiteHeader />

      <main className="site-main">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}