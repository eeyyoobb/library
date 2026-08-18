import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// export const bookSchema = z.object({
//   title: z.string().trim().min(2).max(100),
//   description: z.string().trim().min(10).max(1000),
//   author: z.string().trim().min(2).max(100),
//   genre: z.string().trim().min(2).max(50),
//   rating: z.coerce.number().min(1).max(5),
//   totalCopies: z.coerce.number().int().positive().lte(10000),
//   coverUrl: z.string().nonempty(),
//   coverColor: z
//     .string()
//     .trim()
//     .regex(/^#[0-9A-F]{6}$/i),
//   fileUrl: z.string().nonempty(),
//   summary: z.string().trim().min(10),
// });

export const bookSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  author: z.string().min(1),
  genre: z.string().default("spiritual"),

  category: z.string().min(1),
  subcategory: z.string().default(""),

  language: z.string().min(1),

  translated: z.boolean(),
  translator: z.string().optional(),

  rating: z.coerce.number().min(0).max(5),

  keywords: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),

  audience: z.string().default("general"),
  tradition: z.string().default("christian"),

  coverColor: z.string().default(""),
  summary: z.string().default(""),
});
