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

export async function getEnvironmentVariable(name: string, defaultValue: string = "NONE"): Promise<string> {
  // When running in Astro
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    console.log(`Using Astro env loader for ${name}`);
    console.log(import.meta.env);
    return import.meta.env[name] || defaultValue;
  }

  // When running directly with Node.js
  if (typeof process !== 'undefined') {
    try {
      // Try to load from Astro's .env files using Vite
      const viteModule = await import('vite');
      const pathModule = await import('path');
      const { loadEnv } = viteModule;
      const path = pathModule.default;

      // Find project root
      const projectRoot = path.resolve(process.cwd());

      // Load environment variables from Astro's .env files
      const env = loadEnv('', projectRoot, '');
      if (env[name]) return env[name];

      console.log(`Using Vite env loader for ${name}`);
    } catch (e) {
      console.warn("Could not load Vite env, falling back to dotenv");

      try {
        // Try to load from .env file using dotenv
        const dotenvModule = await import('dotenv');
        dotenvModule.config();
        if (process.env[name]) return process.env[name];
      } catch (dotenvError) {
        console.warn("Could not load dotenv, falling back to process.env");
      }
    }

    // Fallback to process.env
    return process.env[name] || defaultValue;
  }

  console.warn(`Unknown environment, could not retrieve ${name}`);
  return defaultValue;
}
