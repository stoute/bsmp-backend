import { sequence } from "astro:middleware";

async function validation(context, next) {
  // console.log(context.runtimeMode:);
  const response = await next();
  const html = await response.text();
  const redactedHtml = html.replaceAll("PRIVATE INFO", "REDACTED");
  return new Response(redactedHtml, {
    status: 200,
    headers: response.headers,
  });
}

async function auth(context, next) {
  // console.log("auth request");
  const response = await next();
  // console.log("auth response");
  return response;
}

export const onRequest = sequence(validation, auth);

// import { isLoggedIn } from "~/auth.js"
// export function onRequest (context, next) {
//     if (!isLoggedIn(context)) {
//         // If the user is not logged in, update the Request to render the `/login` route and
//         // add header to indicate where the user should be sent after a successful login.
//         // Re-execute middleware.
//         return context.rewrite(new Request("/login", {
//             headers: {
//                 "x-redirect-to": context.url.pathname
//             }
//         }));
//     }
//
//     return next();
// };
