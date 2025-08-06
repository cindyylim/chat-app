import { useEffect, useState } from "react";

export function usePresence(currentUserId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    // Publish user online status when component mounts
    fetch("/api/presence/online", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });

    // Subscribe to presence updates
    const eventSource = new EventSource("/api/presence/subscribe");
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "presence_update") {
          setOnlineUsers(data.onlineUsers || []);
        }
      } catch (error) {
        console.error("Error parsing presence update:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    // Cleanup: publish offline status and close connection
    return () => {
      fetch("/api/presence/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      eventSource.close();
    };
  }, [currentUserId]);

  return onlineUsers;
} 