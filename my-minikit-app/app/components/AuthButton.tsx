"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useChainId, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export default function AuthButton() {
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [display, setDisplay] = useState<string>("");

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/auth/session', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (j.authenticated) {
          setAuthed(true);
          const name = j.session?.displayName || j.session?.username || `fid:${j.session?.fid}`;
          setDisplay(name);
        }
      }
    })();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);

      if (!isConnected) {
        const preferred = connectors.find((c) => c.id === "injected") || connectors[0];
        if (!preferred) throw new Error("No wallet connector available");
        const result = await connectAsync({ connector: preferred });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _addr = result.accounts?.[0] as `0x${string}`;
      }

      const nonceResp = await fetch("/api/auth/siwe/nonce", { cache: "no-store" });
      if (!nonceResp.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceResp.json();

      const domain = window.location.host;
      const origin = window.location.origin;
      const msg = new SiweMessage({
        domain,
        address: (address as `0x${string}`) || (await (async () => {
          const r = await fetch('/api/auth/session', { cache: 'no-store' });
          const j = await r.json();
          return j.session?.address as `0x${string}`;
        })()),
        statement: "Sign in to Creator Growth Hub",
        uri: origin,
        version: "1",
        chainId,
        nonce,
      });
      const prepared = msg.prepareMessage();
      const signature = await signMessageAsync({ message: prepared });

      const verifyResp = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prepared, signature }),
      });
      if (!verifyResp.ok) {
        const j = await verifyResp.json().catch(() => ({}));
        throw new Error(j.error || "Verification failed");
      }

      const s = await fetch('/api/auth/session', { cache: 'no-store' });
      const j = await s.json();
      setAuthed(Boolean(j.authenticated));
      setDisplay(j.session?.displayName || j.session?.username || `fid:${j.session?.fid}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authed) {
    return (
      <div className="px-3 py-2 rounded-md bg-green-600 text-white text-sm font-medium" title="Signed in">
        {display || 'Signed in'}
      </div>
    );
  }

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
