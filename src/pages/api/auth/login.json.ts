export const prerender = false;
import { v4 as uuid } from "uuid";
import { db, User } from "astro:db";
import argon2 from "argon2";
import { eq } from "astro:db";

export async function POST({ request }: { request: Request }) {
  try {
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

    // Find user by email
    const user = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .get();

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No user with found with this email",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Verify password using Argon2
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid password" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create session token
    const sessionId = uuid();

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return new Response(
      JSON.stringify({
        success: true,
        user: userWithoutPassword,
        sessionId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred during login",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
