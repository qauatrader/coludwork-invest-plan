import type { Request } from "express";

export function getAppBaseUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}
