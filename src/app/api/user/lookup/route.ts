import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import redis from "@/db/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: "User lookup API is working" });
}

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

    // First, check if the user exists in Redis
    const userKeys = await redis.keys("user:*");
    const redisUsers = await Promise.all(
      (userKeys || []).map(async (key) => {
        try {
          if (key.includes('conversations') || key.endsWith(':online')) {
            return null;
          }
          const user = await redis.hgetall(key);
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

    // Filter Redis users by email and exclude current user
    const matchingRedisUsers = (redisUsers || [])
      .filter((user): user is Record<string, string> => 
        user !== null && typeof user === 'object' && 'id' in user && user.id !== currentUser.id
      )
      .filter(user => 
        user.email.toLowerCase().includes(email.toLowerCase())
      );

    // If we found users in Redis, return them
    if ((matchingRedisUsers || []).length > 0) {
      return NextResponse.json({ users: matchingRedisUsers });
    }

    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 