import { sequence } from "astro:middleware";
import {
  errorHandler,
  logger,
  cors,
  securityHeaders,
  auth,
  rateLimit,
  validation,
  redaction,
} from "@lib/middleware-utils";
import { paraglideMiddleware } from "./paraglide/server.js";

// Create a wrapper for the Paraglide middleware to ensure it receives a proper Request object
const paraglideMiddlewareWrapper = async (context, next) => {
  // Ensure we have a valid request object with headers
  if (!context.request || !context.request.headers) {
    console.warn("Invalid request object passed to Paraglide middleware");
    return next();
  }

  try {
    return await paraglideMiddleware(context.request, ({ request, locale }) => {
      // Update the context with the locale information using the set method
      context.locals.paraglide = { locale };

      // Continue with the middleware chain
      return next();
    });
  } catch (error) {
    console.error("Paraglide middleware error:", error);
    return next();
  }
};

// Create a sequence that includes the Paraglide middleware
export const onRequest = sequence(
  errorHandler, // 1. Catch all errors
  // logger, // 2. Log request and response
  cors, // 3. Handle CORS (including OPTIONS requests)
  // securityHeaders, // 4. Set security headers on all responses
  // auth, // 5. Check authentication (commented out to avoid auth issues during development)
  // rateLimit, // 6. Enforce rate limits
  // validation, // 7. Validate request body for API routes
  // redaction, // 8. Redact sensitive information from responses
  paraglideMiddlewareWrapper, // 9. Handle i18n routing and locale detection
);

// https://grok.com/share/bGVnYWN5_8199dbd4-732c-426f-ace8-509e0bf618d0
