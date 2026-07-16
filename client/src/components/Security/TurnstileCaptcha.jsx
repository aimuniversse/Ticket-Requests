import { useEffect } from "react";
import { Turnstile } from "react-turnstile";

export default function TurnstileCaptcha({ setToken }) {
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopment) {
      setToken("local-development-token");
    }
  }, [isDevelopment, setToken]);

  if (isDevelopment) {
    return <small>Security verification is disabled in local development.</small>;
  }

  return (
    <Turnstile
      sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
      onSuccess={(token) => setToken(token)}
      onExpire={() => setToken("")}
      onError={() => setToken("")}
    />
  );
}
