"use client";
import { usePathname } from "next/navigation";
import RetroNavBar from "./RetroNavBar";
import { useHealthStatus } from "@/hooks/useHealthStatus";

export default function RetroNavBarWrapper() {
  const pathname = usePathname();
  const { healthData, loading } = useHealthStatus();

  return (
    <RetroNavBar
      activePath={pathname}
      oaaLearning={healthData.oaaLearning}
      labStatus={healthData.labStatus}
    />
  );
}