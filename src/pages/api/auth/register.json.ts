import { registerUser } from "@lib/utils/dbUtils.ts";

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

    const userWithoutPassword = await registerUser(email, password, role);

    // Hash password with Argon2
    // const hashedPassword = await argon2.hash(password, {
    //   type: argon2.argon2id, // Use argon2id variant
    //   memoryCost: 1024 * 16, // 16MB memory cost
    //   timeCost: 3, // 3 iterations
    //   parallelism: 1, // 1 degree of parallelism
    // });
    //
    // // Generate user ID and timestamps
    // const id = uuid();
    // const now = new Date().toISOString();
    //
    // // Create new user
    // const newUser = {
    //   id,
    //   email,
    //   password: hashedPassword,
    //   role,
    //   created_at: now,
    //   updated_at: now,
    // };

    // await db.insert(User).values(newUser).run();

    // Create session
    const sessionId = uuid();

    // Return user info (excluding password)
    // const { password: _, ...userWithoutPassword } = newUser;

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
