import { defineDb, defineTable, column } from "astro:db";

const PromptTemplate = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    description: column.text(),
    systemPrompt: column.text(),
    template: column.text({ optional: true }),
    variables: column.json(),
    created_at: column.text(),
    updated_at: column.text(),
  },
});

const ChatSession = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    messages: column.json(), // Array of Message objects
    metadata: column.json({
      default: {
        topic: "",
        model: "",
        template: null,
        templateId: null,
      },
    }),
    created_at: column.text(), // fixme: use column.date()
    updated_at: column.text(),
    // created_at: column.date({ default: () => new Date() }),
    // updated_at: column.date({ default: () => new Date() }),
  },
});

const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    likes: column.number({ default: 0 }),
    flagged: column.boolean({ default: false }),
    // published: column.date({ default: () => new Date() }),
    metadata: column.json({ default: {} }),
    authorId: column.number({
      references: () => Author.columns.id,
      default: 1,
    }),
  },
});

const Author = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { PromptTemplate, ChatSession, Comment, Author },
  // tables: { PromptTemplateTable, PromptTemplate, ChatSession, Comment, Author },
});
