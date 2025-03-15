export const prerender = false;

export async function POST() {
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": `session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
      },
    }
  );
}