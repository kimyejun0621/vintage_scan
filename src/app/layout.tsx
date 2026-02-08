import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script"; // ⭐ 이거 추가

export const metadata: Metadata = {
  title: "Vintage Sniper v2",
  description: "AI Vintage Authenticator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* ⭐ 포트원 라이브러리 로드 (결제창 띄우는 역할) */}
        <Script 
          src="https://cdn.iamport.kr/v1/iamport.js"
          strategy="beforeInteractive" 
        />
        {children}
      </body>
    </html>
  );
}