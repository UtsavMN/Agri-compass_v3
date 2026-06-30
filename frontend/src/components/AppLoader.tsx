import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const AppLoader = ({ children }: { children: React.ReactNode }) => {
  const [backendReady, setBackendReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);

    const checkBackend = async () => {
      const maxAttempts = 30; // 30 seconds max
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
          if (res.ok) { setBackendReady(true); clearInterval(timer); return; }
        } catch {}
        await new Promise(r => setTimeout(r, 1000));
      }
      setTimedOut(true);
      clearInterval(timer);
    };

    checkBackend();
    return () => clearInterval(timer);
  }, []);

  if (backendReady) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
      <div className="text-4xl mb-6 animate-pulse">🌾</div>
      <h1 className="text-[#C9A84C] font-serif text-xl mb-2">Agri Compass</h1>

      {timedOut ? (
        <>
          <p className="text-[#F5F0E8]/40 text-sm text-center mb-4">
            Server is taking longer than usual. Please check your connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-lg text-sm">
            Retry
          </button>
        </>
      ) : (
        <>
          <p className="text-[#F5F0E8]/40 text-sm text-center mb-4">
            {elapsed < 5
              ? "Starting up..."
              : elapsed < 15
              ? "Waking up the server..."
              : "Almost ready, please wait..."}
          </p>
          <div className="w-48 h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C9A84C] rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((elapsed / 30) * 100, 95)}%` }}
            />
          </div>
          <p className="text-[#F5F0E8]/20 text-xs mt-3">{elapsed}s</p>
        </>
      )}
    </div>
  );
};
