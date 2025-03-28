import { defineDb, defineTable, column } from "astro:db";

const PromptTemplate = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    description: column.text(),
    systemPrompt: column.text(),
    template: column.text({ optional: true }),
    context: column.text({ optional: true }),
    variables: column.json({ optional: true }),
    tags: column.json({ optional: true }),
    llmConfig: column.json({
      optional: true,
      default: JSON.stringify({}),
    }),
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
        topic: null,
        model: null,
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

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    password: column.text(), // Will store hashed passwords
    role: column.text({ default: "authenticated" }), // "authenticated", "moderator", "admin"
    created_at: column.text(),
    updated_at: column.text(),
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
  tables: { PromptTemplate, ChatSession, Comment, Author, User },
});
