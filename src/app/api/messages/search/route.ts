import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import redis from "@/db/db";

export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession();
        const currentUser = await getUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: "Search query is required" }, { status: 400 });
        }

        // Get all conversations for the current user
        const userConversationsKey = `user:${currentUser.id}:conversations`;
        let conversationIds: string[] = [];
        
        try {
            const conversationsData = await redis.smembers(userConversationsKey);
            if (conversationsData) {
                conversationIds = conversationsData;
            }
        } catch (error) {
            console.warn("Could not fetch user conversations:", error);
        }
        
        const searchResults = [];

        // Search through each conversation
        for (const conversationId of conversationIds) {
            const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1);
            
            for (const messageId of messageIds) {
                const message = await redis.hgetall(messageId as string);
                if (message && message.content && typeof message.content === 'string' && message.content.toLowerCase().includes(query.toLowerCase())) {
                    searchResults.push({
                        ...message,
                        conversationId,
                        messageId
                    });
                }
            }
        }

        return NextResponse.json({ messages: searchResults });
    } catch (error) {
        console.error("Error searching messages:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 