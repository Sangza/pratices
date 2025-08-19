export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|; )session=([^;]+)/);
  if (!match) return Response.json({ authenticated: false });
  try {
    const raw = decodeURIComponent(match[1]);
    const session = JSON.parse(raw);
    return Response.json({ authenticated: true, session });
  } catch {
    return Response.json({ authenticated: false });
  }
}
