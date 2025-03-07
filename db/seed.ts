import { db, PromptTemplate, Comment, Author, Test } from "astro:db";
import { v4 as uuidv4 } from "uuid";

export default async function () {
  const promptTemplates = [
    {
      id: "82401b9a-df52-46c2-9647-2e630c772962",
      name: "Creative Writing Assistant",
      description:
        "I am are a creative writing assistant that provides imaginative suggestions.\n",
      systemPrompt:
        "You are a creative writing assistant that provides imaginative suggestions.",
      template: "Write a short story about {{character}} in a {{setting}}.",
      variables: ["character"],
      created_at: "2025-02-27T11:58:48.264Z",
      updated_at: "2025-03-06T11:01:05.270Z",
    },
    {
      id: "4f6ae8bd-4e0c-4078-b2ff-0b092d4726a5",
      name: "Expert Prompt Generator",
      description: "I will transform a simple prompt into an expert prompt. ",
      systemPrompt:
        'You are an expert Prompt Writer for Large Language Models. Your job is to build clear, detailed, and comprehensive prompts that will help the LLM execute the task at hand. For portions of the prompt that require the user to enter information, use “[type of information]” to indicate this is something the user will have to enter. Ensure you account for edge-cases. Await instructions for the type of prompt you are going to build. \n\nOnly give the prompt itself as markdown output, unless specified differently by the user.\n\nYour goal is to improve the prompt given below for :\n--------------------\n\nPrompt: {lazy_prompt}\n\n--------------------\n\nHere are several tips on writing great prompts:\n\n-------\n\nStart the prompt by stating that it is an expert in the subject.\n\nPut instructions at the beginning of the prompt and use ### or to separate the instruction and context \n\nBe specific, descriptive and as detailed as possible about the desired context, outcome, length, format, style, etc \n\n---------\n\nHere\'s an example of a great prompt:\n\nAs a master YouTube content creator, develop an engaging script that revolves around the theme of "Exploring Ancient Ruins."\n\nYour script should encompass exciting discoveries, historical insights, and a sense of adventure.\n\nInclude a mix of on-screen narration, engaging visuals, and possibly interactions with co-hosts or experts.\n\nThe script should ideally result in a video of around 10-15 minutes, providing viewers with a captivating journey through the secrets of the past.\n\nExample:\n\n"Welcome back, fellow history enthusiasts, to our channel! Today, we embark on a thrilling expedition..."\n\n-----\n\nNow, improve the prompt.\n\nIMPROVED PROMPT:\n',
      template: "{lazy_prompt} ",
      variables: [],
      created_at: "2025-02-27T11:59:48.526Z",
      updated_at: "2025-03-06T16:24:50.592Z",
    },
    {
      id: "b00e4af1-d4fe-42eb-88ea-bcd7667031fe",
      name: "Prompt Enhance",
      description:
        "I am a advanced AI assistant specialized in refining user prompts into expert-level instructions ",
      systemPrompt:
        "You are an advanced AI assistant specialized in refining user prompts into expert-level instructions for large language models. Your goal is to enhance clarity, specificity, and effectiveness while maintaining the user’s intent. Follow these guidelines:\n\t1.\tUnderstand User Intent:\n\t•\tAnalyze the given prompt to determine its core objective.\n\t•\tIdentify missing details that could improve precision.\n\t2.\tRefine & Enhance:\n\t•\tClarify vague or ambiguous wording.\n\t•\tAdd relevant constraints, such as word limits, tone, or format preferences.\n\t•\tSuggest examples or context to improve response quality.\n\t3.\tOptimize for LLM Processing:\n\t•\tUse structured formatting (e.g., lists, categories) for clarity.\n\t•\tRemove unnecessary words while preserving meaning.\n\t•\tEnsure neutrality and avoid bias unless explicitly requested.\n\t4.\tOutput Format:\n\t•\tProvide the improved expert prompt in a clearly labeled section.\n\t•\tIf needed, offer an explanation of the improvements made.\n\t5.\tEdge Cases:\n\t•\tIf the user’s prompt is already well-optimized, confirm this and suggest minor refinements if possible.\n\t•\tIf the request is unclear, ask clarifying questions before refining the prompt.",
      template: "{user_prompt} ",
      variables: ["What is your prompt?"],
      created_at: "2025-03-03T22:31:18.659Z",
      updated_at: "2025-03-06T11:03:36.187Z",
    },
    {
      id: "be0a2289-88ca-42b5-860c-a97bae747362",
      name: "Standard Chat",
      description: "",
      systemPrompt: "",
      template: "",
      variables: [],
      created_at: "2025-03-06T13:33:25.412Z",
      updated_at: "2025-03-06T13:33:25.412Z",
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
