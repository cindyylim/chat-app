import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import redis from "@/db/db";
import { Group } from "@/db/dummy";

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, members } = await request.json();
    if (!name || !members || !Array.isArray(members)) {
      return NextResponse.json({ error: "Invalid group data" }, { status: 400 });
    }

    const groupId = `group:${Date.now()}`;
    const group: Group = {
      id: groupId,
      name,
      creatorId: currentUser.id,
      members: [...members, currentUser.id],
      createdAt: Date.now(),
    };

    await redis.hset(groupId, group);
    return NextResponse.json({ group });
  } catch (error) {
    console.error("Group creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupKeys = await redis.keys("group:*");
    const groups: Group[] = [];

    for (const key of groupKeys) {
      const group = await redis.hgetall(key);
      if (group && group.members?.includes(currentUser.id)) {
        groups.push(group as Group);
      }
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 