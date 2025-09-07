import { pusherServer } from "./pusher";

export class PresenceManager {
  private static instance: PresenceManager;

  static getInstance(): PresenceManager {
    if (!PresenceManager.instance) {
      PresenceManager.instance = new PresenceManager();
    }
    return PresenceManager.instance;
  }

  // Generate authentication response for Pusher presence channels
  async authenticatePresenceChannel(socketId: string, channel: string, userId: string, userInfo: any) {
    try {
      const authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: userId,
        user_info: userInfo
      });
      return authResponse;
    } catch (error) {
      console.error("Error authorizing channel:", error);
      throw error;
    }
  }

  // Get current members from Pusher (this would typically be called from client-side)
  async getChannelMembers(channelName: string) {
    try {
      // Note: Pusher doesn't provide a direct server-side API to get channel members
      // This information is typically managed client-side through presence events
      // For server-side access, you'd need to maintain your own state or use Pusher's webhooks
      return [];
    } catch (error) {
      console.error("Error getting channel members:", error);
      return [];
    }
  }
}

export const presenceManager = PresenceManager.getInstance(); 