# Deployment Guide

## Environment Variables

Set these in your Vercel project settings:

### Required
- `NEYNAR_API_KEY` - Your Neynar API key for Farcaster data
- `NEXT_PUBLIC_URL` - Your deployed app URL (e.g., https://your-app.vercel.app)

### Optional
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Base App MiniKit API key for enhanced features
- `DATABASE_URL` - PostgreSQL connection string (for future database features)
- `REDIS_URL` - Redis connection string (for caching and webhooks)

## Quick Setup

1. **Get Neynar API Key**
   - Go to [Neynar](https://neynar.com/)
   - Sign up and get your API key
   - Add to Vercel as `NEYNAR_API_KEY`

2. **Set App URL**
   - After deploying, set `NEXT_PUBLIC_URL` to your exact Vercel URL
   - This ensures cookies work properly for authentication

3. **Deploy to Vercel**
   - Connect your GitHub repo
   - Vercel will auto-detect Next.js
   - Build should complete successfully

## Features Status

✅ **Working**
- SIWE authentication (web)
- Live Farcaster data via Neynar
- Collaboration recommendations
- Engagement leaderboard
- Social graph analytics
- Collab invitation deep links

🔄 **In Progress**
- Base App Quick Auth integration
- Real-time webhooks
- Advanced caching

📋 **Future**
- Database persistence
- Payment integrations
- NFT badges

## Testing

1. **Web Authentication**
   - Click "Connect Wallet" 
   - Sign message with MetaMask/Coinbase Wallet
   - Should show "Signed in as [username]"

2. **Live Data**
   - After signing in, all tabs should show real Farcaster data
   - Collab Finder: Real recommendations with scores
   - Leaderboard: Top fans with engagement metrics
   - Analytics: Charts and insights from your profile

3. **Collab Invites**
   - Click "Invite to Collab" on any recommendation
   - Should open Warpcast composer with pre-filled message

## Troubleshooting

- **"Sign in not working"**: Check `NEXT_PUBLIC_URL` matches your domain exactly
- **"No data showing"**: Verify `NEYNAR_API_KEY` is set correctly
- **Build errors**: All type errors and linting issues have been resolved
- **Base App issues**: Use web SIWE flow for now (works inside Base App webview)
