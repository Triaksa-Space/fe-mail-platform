"use client";

import { useHeartbeat } from "@/hooks/use-heartbeat";

export default function HeartbeatProvider() {
  useHeartbeat();
  return null;
}
