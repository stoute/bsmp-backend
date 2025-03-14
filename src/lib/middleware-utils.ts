import { defineMiddleware } from "astro/middleware";

export const errorHandler = defineMiddleware(async (context, next) => {
  try {
    return await next();
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

export const logger = defineMiddleware(async (context, next) => {
  console.log(`Request: ${context.request.method} ${context.url.pathname}`);
  const response = await next();
  console.log(`Response: ${response.status}`);
  return response;
});

export const cors = defineMiddleware(async (context, next) => {
  // Define allowed origins
  const allowedOrigins = ["http://localhost:4321", "http://localhost:4322"];
  const origin = context.request.headers.get("Origin") || "";

  // Check if the request origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);

  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400"
      },
    });
  }

  const response = await next();

  // Set CORS headers on the response
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  return response;
});

export const securityHeaders = defineMiddleware(async (context, next) => {
  const response = await next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Content-Security-Policy", "default-src 'self'");
  return response;
});

export const auth = defineMiddleware(async (context, next) => {
  const authToken = context.request.headers.get("Authorization");
  const CLIENT_AUTH_TOKEN = process.env.CLIENT_AUTH_TOKEN;
  if (!authToken || authToken !== `Bearer ${CLIENT_AUTH_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return await next();
});

export const rateLimit = defineMiddleware(async (context, next) => {
  const clientIp = context.clientAddress || "unknown";
  //@ts-ignore
  const rateLimitMap = context.locals.rateLimit || new Map<string, number>();
  const requestCount = rateLimitMap.get(clientIp) || 0;
  const MAX_REQUESTS = 100; // Adjust as needed

  if (requestCount >= MAX_REQUESTS) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  rateLimitMap.set(clientIp, requestCount + 1);
  //@ts-ignore
  context.locals.rateLimit = rateLimitMap;
  return await next();
});

export const validation = defineMiddleware(async (context, next) => {
  if (
    context.url.pathname.startsWith("/api/") &&
    context.request.method === "POST"
  ) {
    try {
      const body = await context.request.json();
      if (!body.data) {
        return new Response(
          JSON.stringify({ error: "Missing required field: data" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return await next();
});

export async function redaction(context, next) {
  const response = await next();
  const html = await response.text();
  const redactedHtml = html.replaceAll("PRIVATE INFO", "REDACTED");
  return new Response(redactedHtml, {
    status: 200,
    headers: response.headers,
  });
}

// https://grok.com/share/bGVnYWN5_8199dbd4-732c-426f-ace8-509e0bf618d0
