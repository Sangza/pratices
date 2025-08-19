import { randomBytes } from "crypto";

export async function GET() {
  try {
    // Generate a random 32-byte nonce
    const nonce = randomBytes(32).toString('hex');
    
    // Set the nonce in a cookie for verification
    const response = Response.json({ nonce });
    response.headers.append(
      'Set-Cookie', 
      `siwe_nonce=${encodeURIComponent(nonce)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`
    );
    
    return response;
  } catch (error) {
    console.error("Error generating nonce:", error);
    return Response.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}
