"use client";

import { useState } from "react";
import { useAccount, useConnect, useChainId, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export default function AuthButton() {
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const handleSignIn = async () => {
    try {
      setLoading(true);

      // 1) Ensure wallet connected
      let userAddress = address;
      if (!isConnected) {
        const preferred = connectors.find((c) => c.id === "injected") || connectors[0];
        if (!preferred) throw new Error("No wallet connector available");
        const result = await connectAsync({ connector: preferred });
        userAddress = result.accounts?.[0] as `0x${string}`;
      }
      if (!userAddress) throw new Error("Wallet not connected");

      // 2) Get nonce from server
      const nonceResp = await fetch("/api/auth/siwe/nonce", { cache: "no-store" });
      if (!nonceResp.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceResp.json();

      // 3) Build SIWE message
      const domain = window.location.host;
      const origin = window.location.origin;
      const message = new SiweMessage({
        domain,
        address: userAddress,
        statement: "Sign in to Creator Growth Hub",
        uri: origin,
        version: "1",
        chainId,
        nonce,
      });
      const prepared = message.prepareMessage();

      // 4) Sign message
      const signature = await signMessageAsync({ message: prepared });

      // 5) Verify on server
      const verifyResp = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prepared, signature }),
      });
      if (!verifyResp.ok) {
        const j = await verifyResp.json().catch(() => ({}));
        throw new Error(j.error || "Verification failed");
      }

      // 6) Reload to pick up session
      window.location.reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      alert(msg);
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
