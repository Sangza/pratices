"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useChainId, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { SiweMessage } from "siwe";

interface Session {
  authenticated: boolean;
  fid?: string;
  username?: string;
  displayName?: string;
  avatar?: string;
}

export default function AuthButton() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId() || 8453; // Base chain ID fallback

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const sessionData = await res.json();
        setSession(sessionData);
      }
    } catch (error) {
      console.error("Failed to check session:", error);
    }
  };

  const handleSignIn = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    try {
      setLoading(true);
      const nonceRes = await fetch("/api/auth/siwe/nonce");
      const { nonce } = await nonceRes.json();
      
      // Create proper SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: address as `0x${string}`,
        statement: "Sign in to Creator Growth Hub",
        uri: window.location.origin,
        version: "1",
        chainId: chainId,
        nonce: nonce,
        issuedAt: new Date().toISOString(),
      });
      
      const message = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ message });
      
      const verifyRes = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (verifyRes.ok) {
        const sessionData: Session = await verifyRes.json();
        setSession(sessionData);
        window.location.reload();
      } else {
        const error = await verifyRes.json();
        console.error("Verification failed:", error);
        alert(`Verification failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      alert(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (session?.authenticated) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Signed in as {session.displayName || session.username || `FID ${session.fid}`}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            FID: {session.fid}
          </div>
        </div>
        {session.avatar && (
          <img 
            src={session.avatar} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full"
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Signing..." : isConnected ? "Sign in with Ethereum" : "Connect Wallet"}
    </button>
  );
}
