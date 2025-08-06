import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { presenceManager } from "@/lib/presence";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    await presenceManager.userOffline(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing offline status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 