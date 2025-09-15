import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function parseCookies(cookieHeader: string | null | undefined) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = decodeURIComponent(pair.slice(idx + 1).trim());
    cookies[key] = val;
  });
  return cookies;
}

export function getUserIdFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  if (cookies["user-id"]) return cookies["user-id"];
  // fallback to header
  const header = req.headers.get("x-user-id");
  if (header) return header;
  return null;
}

export function getIpFromReq(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}
