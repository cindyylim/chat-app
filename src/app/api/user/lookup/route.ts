import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import redis from "@/db/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get all users from Redis
    const userKeys = await redis.keys("user:*");
    if (!userKeys) {
      return NextResponse.json({ users: [] });
    }

    // Get all users in parallel
    const users = await Promise.all(
      userKeys.map(async (key) => {
        try {
          // Skip keys that contain 'conversations' as they're not user data
          if (key.includes('conversations')) {
            return null;
          }
          
          const user = await redis.hgetall(key);
          // Only return valid user objects
          if (user && typeof user === 'object' && 'id' in user && 'email' in user) {
            return user;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching user ${key}:`, err);
          return null;
        }
      })
    );

    // Filter users by email and exclude current user
    const matchingUsers = users
      .filter((user): user is Record<string, string> => 
        user !== null && typeof user === 'object' && 'id' in user && user.id !== currentUser.id
      )
      .filter(user => 
        user.email.toLowerCase().includes(email.toLowerCase())
      );

    return NextResponse.json({ users: matchingUsers });
  } catch (error) {
    console.error("Error looking up users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 