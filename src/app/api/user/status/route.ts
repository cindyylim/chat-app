import { NextResponse } from "next/server";
import redis from "@/db/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ online: false });
  const online = await redis.get(`user:${userId}:online`);
  return NextResponse.json({ online: !!online });
} 