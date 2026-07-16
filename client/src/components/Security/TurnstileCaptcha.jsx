import { Turnstile } from "react-turnstile";

export default function TurnstileCaptcha({ setToken }) {
  return (
    <Turnstile
      sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
      onSuccess={(token) => setToken(token)}
      onExpire={() => setToken("")}
      onError={() => setToken("")}
    />
  );
}
