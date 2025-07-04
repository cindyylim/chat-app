import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import redis from "@/db/db";

export async function POST() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await redis.set(`user:${user.id}:online`, 1, { ex: 60 }); // 60s TTL for node-redis v4+
  return NextResponse.json({ success: true });
} 