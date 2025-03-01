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

export const onRequest = sequence(
  errorHandler, // 1. Catch all errors
  // logger, // 2. Log request and response
  cors, // 3. Handle CORS (including OPTIONS requests)
  // securityHeaders, // 4. Set security headers on all responses
  // auth, // 5. Check authentication
  rateLimit, // 6. Enforce rate limits
  validation, // 7. Validate request body for API routes
  // redaction, // 8. Redact sensitive information from responses
);

// https://grok.com/share/bGVnYWN5_8199dbd4-732c-426f-ace8-509e0bf618d0
