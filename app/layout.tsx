import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Noto_Serif_JP, EB_Garamond } from "next/font/google";
import "./globals.css";

const shippori = Shippori_Mincho({
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const notoSerifJp = Noto_Serif_JP({
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
  display: "swap",
  preload: false,
});

const garamond = EB_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "わたしの定義 — 99の思考実験による自己同一性の鑑定",
  description:
    "記憶が、体が、意識が変わっても——それでもあなたは「あなた」でいられるか。99の思考実験に答えて、自分を何で定義しているかを見出す。",
  appleWebApp: {
    title: "わたしの定義",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141414",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shippori.variable} ${notoSerifJp.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
