function randomString(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function GET() {
  const nonce = randomString(24);
  const res = Response.json({ nonce });
  res.headers.append('Set-Cookie', `siwe_nonce=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  return res;
}
