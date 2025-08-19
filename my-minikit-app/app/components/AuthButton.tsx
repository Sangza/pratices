"use client";

import { useState } from "react";

export default function AuthButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Single entry: redirect to server-side login. In Base App this still opens in-app.
      window.location.href = "/api/auth/login";
    } finally {
      // Let the redirect take over; keep state defensive for SSR safety
      setTimeout(() => setLoading(false), 1000);
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
