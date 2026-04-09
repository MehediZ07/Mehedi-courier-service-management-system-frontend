import SmoothScrollProvider from "@/providers/SmoothScrollProvider";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
