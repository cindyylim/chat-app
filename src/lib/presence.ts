import redis from "@/db/db";

export class PresenceManager {
  private static instance: PresenceManager;
  private onlineUsers: Set<string> = new Set();

  static getInstance(): PresenceManager {
    if (!PresenceManager.instance) {
      PresenceManager.instance = new PresenceManager();
    }
    return PresenceManager.instance;
  }

  async userOnline(userId: string): Promise<void> {
    this.onlineUsers.add(userId);
    await redis.sadd("online_users", userId);
    await redis.publish("presence", JSON.stringify({
      type: "online",
      userId,
      onlineUsers: Array.from(this.onlineUsers)
    }));
  }

  async userOffline(userId: string): Promise<void> {
    this.onlineUsers.delete(userId);
    await redis.srem("online_users", userId);
    await redis.publish("presence", JSON.stringify({
      type: "offline",
      userId,
      onlineUsers: Array.from(this.onlineUsers)
    }));
  }

  async getOnlineUsers(): Promise<string[]> {
    const users = await redis.smembers("online_users");
    this.onlineUsers = new Set(users);
    return users;
  }

  async initialize(): Promise<void> {
    const users = await this.getOnlineUsers();
    this.onlineUsers = new Set(users);
  }
}

export const presenceManager = PresenceManager.getInstance(); 