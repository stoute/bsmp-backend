import { type AppState, openRouterModels } from "@lib/appStore";

export async function getOpenRouterModels() {
  // Check if Open Router models should be updated
  const openRouter = openRouterModels.get();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const lastUpdated = openRouter?.updated ? new Date(openRouter.updated) : null;
  if (!lastUpdated || lastUpdated < oneHourAgo) {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": window.location.href, // Required for OpenRouter API
        "X-Title": "bsmp", // Optional, but recommended
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Open Router models: ${response.statusText}`,
      );
    }
    const data = await response.json();
    if (data && Array.isArray(data.data)) {
      openRouterModels.set({
        updated: new Date().toISOString(),
        models: data.data,
      });
      console.log("Updated Open Router models:", data.data);
      return data.data;
    } else {
      console.warn(
        "Received unexpected data structure from OpenRouter API:",
        data,
      );
    }
  }
}
