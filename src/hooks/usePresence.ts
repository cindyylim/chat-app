import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";

interface PresenceMember {
  id: string;
  info: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export function usePresence(currentUserId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceMember[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    // Add a small delay to ensure user is fully authenticated
    const timer = setTimeout(() => {
      try {
        // Subscribe to presence channel
        const presenceChannel = pusherClient.subscribe('presence-chat');
        
        // Handle successful subscription - get initial members
        presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
          console.log('Presence subscription succeeded:', members);
          const memberList: PresenceMember[] = [];
          members.each((member: any) => {
            memberList.push({
              id: member.id,
              info: member.info
            });
          });
          setOnlineUsers(memberList);
        });

        // Handle new member joining
        presenceChannel.bind('pusher:member_added', (member: any) => {
          console.log('Member added:', member);
          setOnlineUsers(prev => {
            // Check if member already exists to avoid duplicates
            const exists = prev.some(m => m.id === member.id);
            if (exists) return prev;
            
            return [...prev, {
              id: member.id,
              info: member.info
            }];
          });
        });

        // Handle member leaving
        presenceChannel.bind('pusher:member_removed', (member: any) => {
          console.log('Member removed:', member);
          setOnlineUsers(prev => prev.filter(m => m.id !== member.id));
        });

        // Handle connection errors
        presenceChannel.bind('pusher:subscription_error', (error: any) => {
          console.error('Pusher subscription error:', error);
        });

        // Handle authentication errors
        presenceChannel.bind('pusher:auth_error', (error: any) => {
          console.error('Pusher auth error:', error);
          // Fallback: try to subscribe again after a delay
          setTimeout(() => {
            try {
              pusherClient.unsubscribe('presence-chat');
              pusherClient.subscribe('presence-chat');
            } catch (retryError) {
              console.error('Retry subscription failed:', retryError);
            }
          }, 2000);
        });

      } catch (error) {
        console.error('Error subscribing to presence channel:', error);
      }
    }, 1000); // 1 second delay

    // Cleanup: unsubscribe when component unmounts
    return () => {
      clearTimeout(timer);
      pusherClient.unsubscribe('presence-chat');
    };
  }, [currentUserId]);

  return onlineUsers;
} 