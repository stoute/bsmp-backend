import type { IPromptTemplate } from "@types";

async function callAI(
  promptTemplate: IPromptTemplate,
  variables: Record<string, string>,
) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  // Add variables as headers
  Object.entries(variables).forEach(([key, value]) => {
    headers.append(key, value);
  });

  const response = await fetch("/api/ai", {
    method: "POST",
    headers,
    body: JSON.stringify(promptTemplate),
  });

  return await response.json();
}
