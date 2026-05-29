import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string | undefined) {
  if (!host) return false;
  // Verificação básica de IPv4 e detecção de IPv6
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const isLocalhost = hostname && (LOCAL_HOSTS.has(hostname) || isIpAddress(hostname));
  const isSecure = isSecureRequest(req);

  // Em desenvolvimento local (HTTP), usar SameSite=Lax
  // Em produção (HTTPS), usar SameSite=None com Secure
  const sameSite = isLocalhost && !isSecure ? "lax" : "none";
  const secure = isSecure || !!isLocalhost; // Permitir cookies em localhost mesmo sem HTTPS

  return {
    httpOnly: true,
    path: "/",
    sameSite: sameSite as "lax" | "none",
    secure,
  };
}
