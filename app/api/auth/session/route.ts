export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|; )session=([^;]+)/);
  if (!match) return Response.json({ authenticated: false });
  try {
    const raw = decodeURIComponent(match[1]);
    const sessionData = JSON.parse(raw);
    return Response.json({ 
      authenticated: true, 
      fid: sessionData.fid,
      address: sessionData.address,
      displayName: sessionData.displayName,
      username: sessionData.username,
      avatar: sessionData.avatar
    });
  } catch {
    return Response.json({ authenticated: false });
  }
}
