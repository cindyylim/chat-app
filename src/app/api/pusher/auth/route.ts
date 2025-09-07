import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { presenceManager } from "@/lib/presence";

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both JSON and form-encoded data from Pusher
    let socket_id: string;
    let channel_name: string;
    
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const body = await req.json();
      socket_id = body.socket_id;
      channel_name = body.channel_name;
    } else {
      // Handle form-encoded data
      const formData = await req.formData();
      socket_id = formData.get('socket_id') as string;
      channel_name = formData.get('channel_name') as string;
    }

    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
    }

    // Only allow presence channels
    if (!channel_name.startsWith('presence-')) {
      return NextResponse.json({ error: "Only presence channels are allowed" }, { status: 403 });
    }

    // Authenticate the presence channel
    const authResponse = await presenceManager.authenticatePresenceChannel(
      socket_id,
      channel_name,
      user.id,
      {
        name: user.given_name || user.family_name || user.email || 'Anonymous',
        email: user.email,
        avatar: user.picture
      }
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Error authenticating Pusher channel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
