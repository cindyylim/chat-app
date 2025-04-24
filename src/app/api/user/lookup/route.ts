import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import redis from "@/db/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: "User lookup API is working" });
}

export async function POST(req: Request) {
  try {
    console.log("Received lookup request");
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();

    if (!currentUser) {
      console.log("No current user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    console.log("Looking up email:", email);

    if (!email) {
      console.log("No email provided");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // First, check if the user exists in Redis
    console.log("Checking Redis for users");
    try {
      const userKeys = await redis.keys("user:*");
      console.log("Found Redis keys:", userKeys);

      const redisUsers = await Promise.all(
        userKeys.map(async (key) => {
          try {
            if (key.includes('conversations')) {
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
      const matchingRedisUsers = redisUsers
        .filter((user): user is Record<string, string> => 
          user !== null && typeof user === 'object' && 'id' in user && user.id !== currentUser.id
        )
        .filter(user => 
          user.email.toLowerCase().includes(email.toLowerCase())
        );

      console.log("Matching Redis users:", matchingRedisUsers);

      // If we found users in Redis, return them
      if (matchingRedisUsers.length > 0) {
        console.log("Returning matching Redis users");
        return NextResponse.json({ users: matchingRedisUsers });
      }
    } catch (redisError) {
      console.error("Redis error:", redisError);
      return NextResponse.json(
        { error: "Error accessing user database" },
        { status: 500 }
      );
    }

    // If no users found in Redis, check if the email matches the current user
    if (currentUser.email && currentUser.email.toLowerCase() === email.toLowerCase()) {
      console.log("Email matches current user");
      return NextResponse.json({ users: [] });
    }

    // If no users found, return empty array
    console.log("No users found");
    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error("Error in user lookup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 