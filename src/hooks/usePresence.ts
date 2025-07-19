import { useEffect, useRef, useState } from "react";

export function usePresence(currentUserId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUserId) return;

    const ws = new WebSocket("ws://localhost:4001");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", userId: currentUserId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "presence" && Array.isArray(data.onlineUsers)) {
          setOnlineUsers(data.onlineUsers);
        }
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [currentUserId]);

  return onlineUsers;
} 