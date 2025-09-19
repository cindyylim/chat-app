"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import redis from "@/db/db";
import { Message } from "@/db/dummy";
import { pusherServer } from "@/lib/pusher";
import elastic from "@/lib/elasticsearch";

type sendMessageActionArgs = {
  content: string;
  receiverId: string;
  messageType: "text" | "image";
};
export async function sendMessageAction({
  content,
  messageType,
  receiverId,
}: sendMessageActionArgs) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { success: false, message: "User not authenticated" };
  }

  const senderId = user.id;
  const conversationId = `conversation:${[senderId, receiverId]
    .sort()
    .join(":")}`;

  const conversationExists = await redis.exists(conversationId);

  if (!conversationExists) {
    await redis.hset(conversationId, {
      participant1: senderId,
      participant2: receiverId,
    });
    await redis.sadd(`user:${senderId}:conversations`, conversationId);
    await redis.sadd(`user:${receiverId}:conversations`, conversationId);
  }
  const messageId = `message:${Date.now()}:${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const timestamp = Date.now();

  await redis.hset(messageId, {
    senderId,
    content,
    timestamp,
    messageType,
  });

    // Index in Elasticsearch
  await elastic.index({
    index: "messages",
    id: messageId,
    document: {
      content: content,
      senderId: senderId,
      conversationId: conversationId,
      timestamp: timestamp,
    },
  });
  await redis.zadd(`${conversationId}:messages`, {
    score: timestamp,
    member: JSON.stringify(messageId),
  });

  // Handle Pusher channel based on conversation type
  let channelName: string;
  if (receiverId.startsWith('group:')) {
    // Group chat - replace ':' with '_' for Pusher compatibility
    channelName = receiverId.replace(':', '_');
  } else {
    // One-on-one chat
    channelName = `${senderId}__${receiverId}`
      .split("__")
      .sort()
      .join("__");
  }

  await pusherServer?.trigger(channelName, "newMessage", {
    message: { senderId, content, timestamp, messageType },
  });
  return { success: true, conversationId, messageId };
}

export async function getMessages(
  selectedUserId: string,
  currentUserId: string
) {
  let conversationId: string;
  if (selectedUserId.startsWith('group:')) {
    // Group chat
    conversationId = selectedUserId;
  } else {
    // One-on-one chat
    conversationId = `conversation:${[currentUserId, selectedUserId]
      .sort()
      .join(":")}`;
  }

  const messageIds = await redis.zrange(`${conversationId}:messages`, 0, -1);
  if (messageIds.length === 0) {
    return [];
  }
  const pipeline = redis.pipeline();
  messageIds.forEach((messageId) => {
    pipeline.hgetall(messageId as string);
  });
  const messages = (await pipeline.exec()) as Message[];
  return messages;
}

export async function getUsersWithConversations() {
  const { getUser } = getKindeServerSession();
  const currentUser = await getUser();

  if (!currentUser) {
    return [];
  }

  // Get all conversations for the current user
  const conversationIds = await redis.smembers(`user:${currentUser.id}:conversations`);
  
  // Get all participants from these conversations
  const participants = new Set<string>();
  for (const conversationId of conversationIds) {
    const conversation = await redis.hgetall(conversationId);
    if (conversation && typeof conversation === 'object') {
      const participant1 = conversation.participant1 as string;
      const participant2 = conversation.participant2 as string;
      
      if (participant1 && participant1 !== currentUser.id) {
        participants.add(participant1);
      }
      if (participant2 && participant2 !== currentUser.id) {
        participants.add(participant2);
      }
    }
  }

  // Get user details for all participants
  const users = [];
  for (const participantId of participants) {
    const user = await redis.hgetall(`user:${participantId}`);
    if (user && typeof user === 'object') {
      users.push(user);
    }
  }

  return users;
}
