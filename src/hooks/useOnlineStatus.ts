import { useEffect } from "react";

export function useOnlineStatus(userId?: string) {
  useEffect(() => {
    if (!userId) return;
    const ping = () => fetch("/api/user/online", { method: "POST" });
    ping();
    const interval = setInterval(ping, 30000); // ping every 30s
    return () => clearInterval(interval);
  }, [userId]);
} 