import { NextRequest, NextResponse } from "next/server";
import Knock from "@knocklabs/node";
import { jwtDecode } from "jwt-decode";

type TokenClaims = {
  sub?: string;
};

function getRecipientIdFromBearerToken(req: NextRequest): string | null {
  const authorizationHeader = req.headers.get("authorization");
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  try {
    const decodedPayload = jwtDecode<TokenClaims>(token);
    return decodedPayload.sub?.trim() || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const recipientId = getRecipientIdFromBearerToken(req);
    if (!recipientId) {
      return NextResponse.json({ error: "recipientId required in bearer token" }, { status: 400 });
    }

    const knock = new Knock({
      apiKey: process.env.KNOCK_API_KEY!,
    });

    const messages: any[] = [];
    for await (const message of knock.users.listMessages(recipientId)) {
      messages.push(message);
    }

    const notifications = messages.map((msg: any) => ({
      id: msg.id,
      timestamp: msg.inserted_at,
      isUnread: !msg.read_at,
      workflow: msg.workflow,
      recipient: msg.workflow,
      status: msg.status,
      notificationType: msg.channel?.name,
      sourceKey: msg?.source?.key,
      data: msg.data,
    }));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const recipientId = getRecipientIdFromBearerToken(req);
    if (!recipientId) {
      return NextResponse.json({ error: "recipientId required in bearer token" }, { status: 400 });
    }

    const body = await req.json();
    const { messageId, markAllAsRead } = body;

    const knock = new Knock({
      apiKey: process.env.KNOCK_API_KEY!,
    });

    if (markAllAsRead) {
      for await (const message of knock.users.listMessages(recipientId)) {
        if (!message.read_at) {
          await knock.messages.markAsRead(message.id);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Marked All messages as read`,
      });
    }

    if (messageId) {
      await knock.messages.markAsRead(messageId);
      return NextResponse.json({
        success: true,
        message: "Message marked as read",
        messageId,
      });
    }

    return NextResponse.json(
      { error: "Either messageId or markAllAsRead must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
