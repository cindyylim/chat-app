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

    const allUsersKey = "all_users";
    
    try {
      // Try to get all users from a single key
      const allUsersData = await redis.get(allUsersKey);
      
      if (allUsersData) {
        const allUsers = JSON.parse(allUsersData as string);
        
        // Filter users by email and exclude current user
        const matchingUsers = allUsers
          .filter((user: any) => 
            user && 
            typeof user === 'object' && 
            'id' in user && 
            'email' in user && 
            user.id !== currentUser.id
          )
          .filter((user: any) => 
            user.email.toLowerCase().includes(email.toLowerCase())
          );

        if (matchingUsers.length > 0) {
          return NextResponse.json({ users: matchingUsers });
        }
      }
    } catch (error) {
      console.warn("Could not fetch users from all_users key:", error);
    }

    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 