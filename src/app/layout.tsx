import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "Privy React Not Defined Repro",
  description: "Minimal reproduction of React is not defined error with @privy-io/react-auth on Next.js 16 + React 19",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
