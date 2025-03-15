export const prerender = false;
import { v4 as uuid } from "uuid";
import { db, User } from "astro:db";
import bcrypt from "bcryptjs";
import { eq } from "astro:db";

export async function POST({ request }: { request: Request }) {
  try {
    const { email, password } = await request.json();

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role (admin or authenticated)
    const isAdmin = email === import.meta.env.PUBLIC_ADMIN_EMAIL;

    const role = isAdmin ? "admin" : "authenticated";

    // Generate user ID and timestamps
    const id = uuid();
    const now = new Date().toISOString();

    // Create new user
    const newUser = {
      id,
      email,
      password: hashedPassword,
      role,
      created_at: now,
      updated_at: now,
    };

    await db.insert(User).values(newUser).run();

    // Create session
    const sessionId = uuid();

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;

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
