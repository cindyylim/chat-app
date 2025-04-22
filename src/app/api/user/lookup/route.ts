import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import redis from "@/db/db";

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Search for user by email in Redis
    const userKeys = await redis.keys("user:*");
    if (!userKeys || !Array.isArray(userKeys)) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    for (const key of userKeys) {
      try {
        const userData = await redis.hgetall(key);
        if (!userData || typeof userData !== 'object') {
          continue;
        }
        if (userData.email === email) {
          return NextResponse.json({ user: userData });
        }
      } catch (err) {
        console.error(`Error fetching user data for key ${key}:`, err);
        continue;
      }
    }

    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("User lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 