"use client";

import { useState } from "react";

export default function AuthButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Kick off SIWE nonce; client app can pick up from here (wallet connect UI)
      const r = await fetch('/api/auth/siwe/nonce', { cache: 'no-store' });
      if (!r.ok) {
        // fallback: show a simple redirect to Base App (user can open there)
        window.location.href = '/';
        return;
      }
      // In a full implementation, you would now open a wallet connect modal and sign the SIWE message.
      alert('Nonce issued. Connect wallet & sign SIWE in the next step.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="px-3 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
      aria-label="Sign in with Farcaster"
    >
      {loading ? "Signing in..." : "Sign in with Farcaster"}
    </button>
  );
}
