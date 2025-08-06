import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import redis from "@/db/db";

export async function GET(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Subscribe to Redis pub/sub
        const subscriber = redis.duplicate();
        
        subscriber.subscribe("presence", (message) => {
          try {
            const data = JSON.parse(message);
            const sseData = `data: ${JSON.stringify({
              type: "presence_update",
              onlineUsers: getOnlineUsers(data)
            })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          } catch (error) {
            console.error("Error processing presence message:", error);
          }
        });

        // Handle client disconnect
        req.signal.addEventListener("abort", () => {
          subscriber.unsubscribe();
          subscriber.quit();
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in presence subscription:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// Helper function to get current online users
async function getOnlineUsers(presenceData: any) {
  // This is a simplified version - you might want to maintain a separate set of online users
  // For now, we'll return the current user if they're coming online
  if (presenceData.type === "online") {
    return [presenceData.userId];
  }
  return [];
} 