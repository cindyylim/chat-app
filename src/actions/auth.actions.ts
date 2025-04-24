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
      
      const userData = {
        id: user.id,
        email: user.email || "",
        name: user.given_name && user.family_name 
          ? `${user.given_name} ${user.family_name}`
          : user.email || "Anonymous",
        image: user.picture || "",
      };

      // Always update the user data in Redis
      await redis.hset(userId, userData);

      // If this is a new user, add them to the users set
      if (!existingUser || Object.keys(existingUser).length === 0) {
        console.log("New user created in Redis:", userData);
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
