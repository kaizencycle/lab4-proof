"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ForestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
