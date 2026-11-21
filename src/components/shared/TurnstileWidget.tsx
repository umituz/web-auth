import { useEffect, useRef, useState } from "react";

export interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
}

interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 100;

let turnstileLoader: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;
  if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }
  turnstileLoader = new Promise<TurnstileApi>((resolve, reject) => {
    const startedAt = Date.now();
    const poll = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        turnstileLoader = null;
        reject(new Error("turnstile_load_timeout"));
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    poll();
  });
  return turnstileLoader;
}

export const TurnstileWidget = ({ siteKey, onToken }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);

  onTokenRef.current = onToken;

  useEffect(() => {
    let disposed = false;
    loadTurnstile()
      .then((api) => {
        if (disposed || !containerRef.current) return;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      onTokenRef.current(null);
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (failed) return null;
  return <div ref={containerRef} className="uauth-turnstile" />;
};
