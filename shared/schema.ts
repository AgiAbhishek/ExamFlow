import { z } from "zod";

// User schemas
export const userSchema = z.object({
  _id: z.string(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  createdAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Question schemas
export const questionSchema = z.object({
  _id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  difficulty: z.enum(["easy", "medium", "hard"]),
  subject: z.string(),
  createdAt: z.date(),
});

export const insertQuestionSchema = questionSchema.omit({ _id: true, createdAt: true });

export type Question = z.infer<typeof questionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// Exam schemas
export const examSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  questions: z.array(z.string()), // Question IDs
  answers: z.array(z.number().nullable()), // User's answers (0-3 or null for unanswered)
  startTime: z.date(),
  endTime: z.date().nullable(),
  submittedAt: z.date().nullable(),
  score: z.number().nullable(),
  totalQuestions: z.number(),
  timeLimit: z.number(), // in minutes
  isCompleted: z.boolean().default(false),
});

export const insertExamSchema = examSchema.omit({ 
  _id: true, 
  submittedAt: true, 
  score: true, 
  isCompleted: true 
});

export const startExamSchema = z.object({
  timeLimit: z.number().default(30),
});

export const submitAnswerSchema = z.object({
  questionIndex: z.number().min(0),
  answer: z.number().min(0).max(3).nullable(),
});

export const submitExamSchema = z.object({
  examId: z.string(),
  answers: z.array(z.number().nullable()),
});

export type Exam = z.infer<typeof examSchema>;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type StartExamData = z.infer<typeof startExamSchema>;
export type SubmitAnswerData = z.infer<typeof submitAnswerSchema>;
export type SubmitExamData = z.infer<typeof submitExamSchema>;

// Result schemas
export const resultSchema = z.object({
  _id: z.string(),
  examId: z.string(),
  userId: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  percentage: z.number(),
  answers: z.array(z.object({
    questionId: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    userAnswer: z.number().nullable(),
    correctAnswer: z.number(),
    isCorrect: z.boolean(),
  })),
  timeTaken: z.number(), // in minutes
  createdAt: z.date(),
});

export type Result = z.infer<typeof resultSchema>;

// Auth response schema
export const authResponseUserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
});

export const authResponseSchema = z.object({
  user: authResponseUserSchema,
  token: z.string(),
});

export type AuthResponseUser = z.infer<typeof authResponseUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
