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

    await redis.hset(groupId, group as unknown as Record<string, unknown>);
    
    // Add the group to each member's groups list
    for (const memberId of group.members) {
      try {
        const userGroupsKey = `user:${memberId}:groups`;
        const existingGroupsData = await redis.get(userGroupsKey);
        
        let groupIds: string[] = [];
        if (existingGroupsData) {
          try {
            groupIds = JSON.parse(existingGroupsData as string);
          } catch (parseError) {
            // If parsing fails, start with empty array
            groupIds = [];
          }
        }
        
        // Add the new group ID if it's not already there
        if (!groupIds.includes(groupId)) {
          groupIds.push(groupId);
          await redis.set(userGroupsKey, JSON.stringify(groupIds));
        }
      } catch (updateError) {
        // If updating fails due to permissions, we'll continue without it
        console.warn(`Could not add group to user ${memberId} groups list:`, updateError);
      }
    }
    
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

    // Since Redis has permission restrictions, we'll use a simple approach:
    // Store groups in a JSON string under a user-specific key
    const userGroupsKey = `user:${currentUser.id}:groups`;
    
    try {
      // Try to get the user's groups from a simple string value
      const groupsData = await redis.get(userGroupsKey);
      
      if (groupsData) {
        const groupIds = JSON.parse(groupsData as string);
        const groups: Group[] = [];

        for (const groupId of groupIds) {
          try {
            const group = await redis.hgetall(groupId);
            if (group && group.id) {
              groups.push(group as unknown as Group);
            }
          } catch (groupError) {
            // If a group doesn't exist, skip it
            console.warn(`Group ${groupId} not found, skipping`);
          }
        }

        return NextResponse.json({ groups });
      } else {
        // No groups found for this user
        return NextResponse.json({ groups: [] });
      }
    } catch (parseError) {
      // If there's an error parsing or getting data, return empty groups
      console.log("No groups found for user or data is invalid");
      return NextResponse.json({ groups: [] });
    }
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 