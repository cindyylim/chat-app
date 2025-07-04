import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import redis from "@/db/db";

export async function GET() {
  const { getUser } = getKindeServerSession();
  const currentUser = await getUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversationIds = await redis.smembers(`user:${currentUser.id}:conversations`);
  const previews = [];

  for (const conversationId of conversationIds) {
    // Get the last message id (highest score) using zrange with rev
    const lastMessageIdArr = await redis.zrange(`${conversationId}:messages`, 0, 0, { rev: true });
    if (!Array.isArray(lastMessageIdArr) || lastMessageIdArr.length === 0) continue;
    const lastMessageId = String(lastMessageIdArr[0]);
    const lastMessage = await redis.hgetall(lastMessageId);

    // Get conversation participants or group info
    const conversation = await redis.hgetall(conversationId);
    previews.push({
      conversationId,
      lastMessage,
      conversation,
    });
  }

  return NextResponse.json({ previews });
} 