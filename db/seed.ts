import { db, PromptTemplate, Comment, Author, Test } from "astro:db";
import { v4 as uuidv4 } from "uuid";

export default async function () {
  const promptTemplates = [
    {
      id: uuidv4(),
      name: "Creative Writing Assistant",
      description: "Helps generate creative writing pieces.",
      systemPrompt:
        "You are a creative writing assistant that provides imaginative suggestions.",
      template: "Write a short story about {{character}} in a {{setting}}.",
      variables: ["character", "setting"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Code Debugger",
      description: "Assists with debugging code snippets.",
      systemPrompt: "You are an expert programmer that helps debug code.",
      template: "Analyze the following code for errors:\n\n{{codeSnippet}}",
      variables: ["codeSnippet"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Trivia Question Generator",
      description: "Generates trivia questions based on a given topic.",
      systemPrompt:
        "You are a trivia question generator specializing in various topics.",
      template: "Create a trivia question about {{topic}}.",
      variables: ["topic"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  await db.insert(PromptTemplate).values(promptTemplates);

  await db.insert(Author).values([
    { id: 1, name: "Kasim" },
    { id: 2, name: "Mina" },
  ]);
  await db.insert(Comment).values([
    { id: 1, authorId: 1, body: "Hope you like Astro DB!" },
    { id: 2, authorId: 2, body: "Enjoy!" },
  ]);
}
