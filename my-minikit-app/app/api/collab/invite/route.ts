export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { toUsername?: string; toFid?: number; text?: string } | null;
  const baseUrl = process.env.NEXT_PUBLIC_URL || '';
  const to = body?.toUsername ? `@${body.toUsername}` : (body?.toFid ? `fid:${body.toFid}` : 'a creator');
  const message = body?.text || `Let's collaborate ${to}! Check out our match in Creator Growth Hub: ${baseUrl}`;
  // Warpcast composer deep link with prefilled text
  const composer = new URL('https://warpcast.com/~/compose');
  composer.searchParams.set('text', message);
  return Response.json({ url: composer.toString() });
}
