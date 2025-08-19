import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { targetFid, targetUsername, message } = await request.json();
    
    if (!targetFid || !targetUsername) {
      return Response.json(
        { error: "Missing target FID or username" },
        { status: 400 }
      );
    }

    // Generate a Warpcast composer deep link for collaboration invitation
    const deepLink = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      `Hey @${targetUsername}! 👋\n\n${message || "I'd love to collaborate on something together. Let's connect!"}\n\n#CreatorCollab #Farcaster`
    )}`;

    return Response.json({
      success: true,
      deepLink,
      message: "Collaboration invitation link generated successfully"
    });
  } catch (error) {
    console.error("Error generating collab invite:", error);
    return Response.json(
      { error: "Failed to generate invitation link" },
      { status: 500 }
    );
  }
}
