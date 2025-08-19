"use client";

import { useState } from "react";

export default function AuthButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      // Try Farcaster Mini App Quick Auth if available
      if (typeof window !== "undefined") {
        try {
          const sdk = await import("@farcaster/miniapp-sdk");
          if (sdk && typeof sdk.getAuthToken === "function") {
            const jwt = await sdk.getAuthToken();
            const resp = await fetch("/api/auth/verify", {
              method: "POST",
              headers: { Authorization: `Bearer ${jwt}` },
            });
            if (resp.ok) {
              // Reload to reflect authenticated state
              window.location.reload();
              return;
            }
          }
        } catch {
          // no-op; fallback to OAuth
        }
      }
      // Fallback to OAuth on the open web
      window.location.href = "/api/auth/login";
    } finally {
      setLoading(false);
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
