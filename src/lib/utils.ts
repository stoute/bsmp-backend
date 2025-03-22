import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Links } from "@types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWindowLocationOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    result[snakeKey] = obj[key];
  }
  return result;
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function isRunningOnLocalhost(): boolean {
  if (typeof window === "undefined") {
    // If window is not available, we are not in a browser
    return false;
  }
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" || // Standard localhost
    hostname === "127.0.0.1" || // IPv4 loopback
    hostname === "[::1]" || // IPv6 loopback
    hostname.startsWith("127.") // Any 127.x.x.x IP range
  );
}

export function clearLocalStorage(reloadPage: boolean = false): void {
  if (typeof window !== "undefined") {
    localStorage.clear();
    if (reloadPage) {
      window.location.reload();
    }
    console.log("Local storage cleared successfully");
  }
}
