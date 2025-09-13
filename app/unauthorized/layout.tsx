import { Jost } from "next/font/google";

import "@/app/globals.css";

const jost = Jost({ subsets: ["latin"] });

export default function UnAuthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.className}>
      <body>{children}</body>
    </html>
  );
}
