// src/pages/api/ai.js

export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  try {
    const requestData: any = await request.json();

    let apiKey: string = import.meta.env.OPENAI_API_KEY;
    apiKey = import.meta.env.OPEN_ROUTER_API_KEY;

    let url: string = "https://api.openai.com/v1/chat/completions";
    url = "https://openrouter.ai/api/v1/chat/completions";

    // Make the actual API call with your secret key
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: requestData.data.model || "gpt-4o-mini",
        messages: requestData.data.messages,
        // Include other parameters as needed
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
