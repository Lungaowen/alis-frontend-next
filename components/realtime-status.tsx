"use client";

import { useEffect, useState } from "react";
import WifiTethering from "@mui/icons-material/WifiTethering";
import { connectRealtime, type RealtimeMessage } from "@/lib/realtime";

export function RealtimeStatus({ onMessage }: { onMessage?: (message: RealtimeMessage) => void }) {
  const [connected, setConnected] = useState(false);
  useEffect(() => connectRealtime((message) => onMessage?.(message), setConnected), [onMessage]);
  return (
    <span className={"realtime-badge" + (connected ? " is-connected" : "")} aria-label={connected ? "Live connection active" : "Live connection offline"}>
      <span className="realtime-dot" /><WifiTethering sx={{ fontSize: 14 }} />{connected ? "Live" : "Offline"}
    </span>
  );
}
