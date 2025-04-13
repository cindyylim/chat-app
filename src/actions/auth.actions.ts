"use server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import redis from "@/db/db";

export async function checkAuthStatus() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
	if (!user) return { success: false };

    if (user) {
      const userId = `user:${user.id}`;
      const existingUser = await redis.hgetall(userId);
      
      if (!existingUser || Object.keys(existingUser).length === 0) {
        const imgIsNull = user.picture?.includes("gravatar");
        const image = imgIsNull ? "" : user.picture || "";
        const userData = {
          id: user.id || "",
          email: user.email || "",
          name: `${user.given_name || ""} ${user.family_name || ""}`.trim() || "Anonymous",
          image: image
        };
        await redis.hset(userId, userData);
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
