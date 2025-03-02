export const customFetchHandler = async (url: string, options: any) => {
  // Extract the endpoint from the URL
  // For example, from https://api.openai.com/v1/chat/completions, extract "chat/completions"
  // console.log("Custom Fetch Called");
  // console.log("URL:", url);
  // console.log("Options:", options);

  const urlObj = new URL(url);
  const endpoint = urlObj.pathname.split("/v1/")[1];

  // Forward to our proxy with the necessary data
  const response = await fetch("/api/ai-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      data: JSON.parse(options.body),
    }),
  });

  return response;
};
