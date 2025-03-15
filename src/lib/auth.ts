import { db, User } from "astro:db";
import { eq } from "astro:db";

export async function getUserFromSession(request: Request) {
  const cookies = request.headers.get("cookie");
  if (!cookies) return null;
  
  const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session='));
  if (!sessionCookie) return null;
  
  const sessionId = sessionCookie.split('=')[1];
  if (!sessionId) return null;
  
  // In a real app, you would validate the session against a sessions table
  // For now, we'll just return a dummy user based on the session
  // This is just a placeholder - implement proper session validation in production
  
  // For demonstration purposes only
  // In a real app, you would query your sessions table and get the associated user
  return { id: "session-user", role: "authenticated" };
}

export function isAdmin(user: any) {
  return user?.role === "admin";
}

export function isModerator(user: any) {
  return user?.role === "moderator" || isAdmin(user);
}

export function isAuthenticated(user: any) {
  return !!user;
}