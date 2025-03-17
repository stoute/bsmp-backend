/**
 * Handles proxying requests to AI services through our internal API
 * to protect API keys and provide consistent error handling
 */
export const proxyFetchHandler = async (url: string, options: any) => {
  const urlObj = new URL(url);
  const endpoint = urlObj.pathname.split("/v1/")[1];

  const response: Response = await fetch(
    // appState.get().apiBaseUrl + "/ai-proxy",
    "/api/ai-proxy",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        data: JSON.parse(options.body),
      }),
    },
  );

  return response;
};
