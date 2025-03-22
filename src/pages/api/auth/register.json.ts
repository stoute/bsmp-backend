import { registerUser } from "@lib/utils/dbUtils.ts";

export const prerender = false;
import { v4 as uuid } from "uuid";
import { db, User } from "astro:db";
import argon2 from "argon2";
import { eq } from "astro:db";

export async function POST({ request }: { request: Request }) {
  try {
    // Read the request body once and store it
    const requestBody = await request.json();
    const { email, password } = requestBody;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .get();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: "Email already in use" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Determine role (admin or authenticated)
    const isAdmin = email === import.meta.env.PUBLIC_ADMIN_EMAIL;
    const role = isAdmin ? "admin" : "authenticated";

    // Register the user and get user data without password
    const userWithoutPassword = await registerUser(email, password, role);

    // Create session
    const sessionId = uuid();

    return new Response(
      JSON.stringify({
        success: true,
        user: userWithoutPassword,
        sessionId,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred during registration",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
