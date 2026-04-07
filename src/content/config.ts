import { defineCollection, z } from "astro:content";

const nodes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    kind: z.enum(["project", "technology", "concept"]),
    connections: z.array(z.string()).default([]),
    color: z
      .enum(["red", "green", "yellow", "blue", "purple", "cyan"])
      .optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { nodes };
