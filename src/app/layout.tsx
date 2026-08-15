import "./globals.css";

import { LocaleLayoutProps } from "@/types/children";
import ClientRoot from "@/components/ClientRoot";

export const metadata = {
  title: "Framecraft — Video Editor",
  description: "A professional browser-based video editing workspace.",
};

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
