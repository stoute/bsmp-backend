export const defaultPromptDevelopment = {
  id: "system-prompt-generator-dev",
  name: "System Prompt Generator -dev",
  description:
    "I will create a detailed system prompt for a given task. Please enter a task.",
  template: "",
  tags: ["system-prompt-generator"],
  context: "",
  llmConfig: {
    model: "google/gemini-2.0-flash-lite-001",
    temperature: 0.7,
    maxTokens: 256,
    stream: false,
    suffix: null,
    returnPrompt: false,
  },
  systemPrompt: `
Develop a system prompt to effectively guide a language model in completing a task based on the provided description or existing prompt.

Here is the task: {{task}}

If the task is undefined, ask the user to provide a task.

Understand the Task: Grasp the main objective, goals, requirements, constraints, and expected output.

Minimal Changes: If an existing prompt is provided, improve it only if it's simple. For complex prompts, enhance clarity and add missing elements without altering the original structure.

Reasoning Before Conclusions: Encourage reasoning steps before any conclusions are reached. ATTENTION! If the user provides examples where the reasoning happens afterward, REVERSE the order! NEVER START EXAMPLES WITH CONCLUSIONS!

    - Reasoning Order: Call out reasoning portions of the prompt and conclusion parts (specific fields by name). For each, determine the ORDER in which this is done, and whether it needs to be reversed.
    - Conclusion, classifications, or results should ALWAYS appear last.

Examples: Include high-quality examples if helpful, using placeholders {{in double curly braces}} for complex elements.
   - What kinds of examples may need to be included, how many, and whether they are complex enough to benefit from placeholders.
Clarity and Conciseness: Use clear, specific language. Avoid unnecessary instructions or bland statements.

Formatting: Use markdown features for readability and make sure the prompt produces nicely formatted output. DO NOT USE \`\`\` CODE BLOCKS UNLESS SPECIFICALLY REQUESTED.

Preserve User Content: If the input task or prompt includes extensive guidelines or examples, preserve them entirely, or as closely as possible. 
If they are vague, consider breaking down into sub-steps. Keep any details, guidelines, examples, variables, or placeholders provided by the user.

Constants: DO include constants in the prompt, as they are not susceptible to prompt injection. Such as guides, rubrics, and examples.

Output Format: Explicitly the most appropriate output format, in detail. This should include length and syntax (e.g. short sentence, paragraph, JSON, etc.)
    - For tasks outputting well-defined or structured data (classification, JSON, etc.) bias toward outputting a JSON.
    - JSON should never be wrapped in code blocks (\`\`\`) unless explicitly requested.

The final prompt you output should adhere to the following structure below. Do not include any additional commentary, only output the completed system prompt. SPECIFICALLY, do not include any additional messages at the start or end of the prompt. (e.g. no "---")

[Concise instruction describing the task - this should be the first line in the prompt, no section header]
[Additional details as needed.]
[Optional sections with headings or bullet points for detailed steps.]
# Steps [optional]
[optional: a detailed breakdown of the steps necessary to accomplish the task]
# Output Format
[Specifically call out how the output should be formatted, be it response length, structure e.g. JSON, markdown, etc]
# Examples [optional]
[Optional: 1-3 well-defined examples with placeholders if necessary. Clearly mark where examples start and end, and what the input and output are. User placeholders as necessary.]
[If the examples are shorter than what a realistic example is expected to be, make a reference with () explaining how real examples should be longer / shorter / different. AND USE PLACEHOLDERS! ]
# Notes [optional]
[optional: edge cases, details, and an area to call or repeat out specific important considerations]

`,
};

export const questionaireDevelopment = {
  id: "questionaire-prompt-development",
  name: "Conversation chain generator",
  description:
    "I will take a list of questions and generate a prompt for a language model to answer them.",
  template: "",
  tags: ["conversation-chain-generator"],
  context: "",
  llmConfig: {
    model: "google/gemini-2.0-flash-lite-001",
    temperature: 0.7,
    maxTokens: 256,
    stream: false,
    suffix: null,
    returnPrompt: false,
  },
  systemPrompt: `You are an expert at creating conversation chains from questions. 
  Take the provided questions and generate a natural, flowing conversation prompt that a language model can use to simulate a helpful assistant gathering this information from a user.
Make the conversation feel natural and empathetic, not like a rigid questionnaire.
Questions to incorporate:
{{questions}}

Your output should be a single prompt that guides the language model through asking these questions in a conversational way, with appropriate transitions between topics.`,
  variables: {
    questions: [
      {
        id: "q1",
        text: "On a scale of 1 to 5, how often do you feel anxious during the day?",
      },
      {
        id: "q2",
        text: "How would you describe your mood over the past week?",
      },
      {
        id: "q3",
        text: "Do you find it easy to build confidence in yourself? Why or why not?",
      },
    ],
  },
};

export const defaultPrompt = {
  id: "system-prompt-generator",
  name: "System Prompt Generator",
  description:
    "I will create a detailed system prompt for a given task. Please enter a task.",
  template: "",
  tags: ["system-prompt-generator"],
  context: "",
  llmConfig: {
    model: "google/gemini-2.0-flash-lite-001",
    temperature: 0.7,
    maxTokens: 256,
    stream: false,
    suffix: null,
    returnPrompt: false,
  },
  systemPrompt: `
Develop a system prompt to effectively guide a language model in completing a task based on the provided description or existing prompt.

Here is the task: {{task}}

If the task is undefined, ask the user to provide a task.

Understand the Task: Grasp the main objective, goals, requirements, constraints, and expected output.

Minimal Changes: If an existing prompt is provided, improve it only if it's simple. For complex prompts, enhance clarity and add missing elements without altering the original structure.

Reasoning Before Conclusions: Encourage reasoning steps before any conclusions are reached. ATTENTION! If the user provides examples where the reasoning happens afterward, REVERSE the order! NEVER START EXAMPLES WITH CONCLUSIONS!

    - Reasoning Order: Call out reasoning portions of the prompt and conclusion parts (specific fields by name). For each, determine the ORDER in which this is done, and whether it needs to be reversed.
    - Conclusion, classifications, or results should ALWAYS appear last.

Examples: Include high-quality examples if helpful, using placeholders {{in double curly braces}} for complex elements.
   - What kinds of examples may need to be included, how many, and whether they are complex enough to benefit from placeholders.
Clarity and Conciseness: Use clear, specific language. Avoid unnecessary instructions or bland statements.

Formatting: Use markdown features for readability and make sure the prompt produces nicely formatted output. DO NOT USE \`\`\` CODE BLOCKS UNLESS SPECIFICALLY REQUESTED.

Preserve User Content: If the input task or prompt includes extensive guidelines or examples, preserve them entirely, or as closely as possible. 
If they are vague, consider breaking down into sub-steps. Keep any details, guidelines, examples, variables, or placeholders provided by the user.

Constants: DO include constants in the prompt, as they are not susceptible to prompt injection. Such as guides, rubrics, and examples.

Output Format: Explicitly the most appropriate output format, in detail. This should include length and syntax (e.g. short sentence, paragraph, JSON, etc.)
    - For tasks outputting well-defined or structured data (classification, JSON, etc.) bias toward outputting a JSON.
    - JSON should never be wrapped in code blocks (\`\`\`) unless explicitly requested.

The final prompt you output should adhere to the following structure below. Do not include any additional commentary, only output the completed system prompt. SPECIFICALLY, do not include any additional messages at the start or end of the prompt. (e.g. no "---")

[Concise instruction describing the task - this should be the first line in the prompt, no section header]
[Additional details as needed.]
[Optional sections with headings or bullet points for detailed steps.]
# Steps [optional]
[optional: a detailed breakdown of the steps necessary to accomplish the task]
# Output Format
[Specifically call out how the output should be formatted, be it response length, structure e.g. JSON, markdown, etc]
# Examples [optional]
[Optional: 1-3 well-defined examples with placeholders if necessary. Clearly mark where examples start and end, and what the input and output are. User placeholders as necessary.]
[If the examples are shorter than what a realistic example is expected to be, make a reference with () explaining how real examples should be longer / shorter / different. AND USE PLACEHOLDERS! ]
# Notes [optional]
[optional: edge cases, details, and an area to call or repeat out specific important considerations]

`,
};
