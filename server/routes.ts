import type { Express } from "express";
import { createServer, type Server } from "http";
import { mongodb } from "./mongodb";
import { storage } from "./storage";
import { generateToken, comparePassword, authenticateToken, AuthRequest } from "./auth";
import { 
  insertUserSchema, 
  loginSchema, 
  startExamSchema,
  submitAnswerSchema,
  submitExamSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await mongodb.connect();

  // Seed some sample questions if collection is empty
  await seedQuestions();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      const token = generateToken(user);

      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken(user);

      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Protected routes
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // Exam routes
  app.post("/api/exams/start", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { timeLimit } = startExamSchema.parse(req.body);
      
      // Get random questions
      const questions = await storage.getRandomQuestions(10);
      if (questions.length === 0) {
        return res.status(400).json({ message: "No questions available" });
      }

      const questionIds = questions.map(q => q._id);
      const answers = new Array(questions.length).fill(null);

      const exam = await storage.createExam({
        userId: req.user!._id,
        questions: questionIds,
        answers,
        startTime: new Date(),
        endTime: new Date(Date.now() + timeLimit * 60 * 1000),
        totalQuestions: questions.length,
        timeLimit,
      });

      res.json({
        examId: exam._id,
        questions: questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
        })),
        timeLimit,
        startTime: exam.startTime,
        endTime: exam.endTime,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to start exam" });
    }
  });

  app.get("/api/exams/:examId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const exam = await storage.getExam(req.params.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      if (exam.userId !== req.user!._id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const questions = await storage.getQuestionsByIds(exam.questions);

      res.json({
        examId: exam._id,
        questions: questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
        })),
        answers: exam.answers,
        timeLimit: exam.timeLimit,
        startTime: exam.startTime,
        endTime: exam.endTime,
        isCompleted: exam.isCompleted,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get exam" });
    }
  });

  app.put("/api/exams/:examId/answer", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { questionIndex, answer } = submitAnswerSchema.parse(req.body);
      
      const exam = await storage.getExam(req.params.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      if (exam.userId !== req.user!._id) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (exam.isCompleted) {
        return res.status(400).json({ message: "Exam already completed" });
      }

      const newAnswers = [...exam.answers];
      newAnswers[questionIndex] = answer;

      await storage.updateExamAnswers(exam._id, newAnswers);

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to save answer" });
    }
  });

  app.post("/api/exams/:examId/submit", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const exam = await storage.getExam(req.params.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      if (exam.userId !== req.user!._id) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (exam.isCompleted) {
        return res.status(400).json({ message: "Exam already completed" });
      }

      const submittedAt = new Date();
      await storage.submitExam(exam._id, submittedAt);

      // Calculate score
      const questions = await storage.getQuestionsByIds(exam.questions);
      let score = 0;
      const answerDetails = [];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = exam.answers[i];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) score++;

        answerDetails.push({
          questionId: question._id,
          question: question.question,
          options: question.options,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
        });
      }

      const percentage = Math.round((score / questions.length) * 100);
      const timeTaken = Math.round((submittedAt.getTime() - exam.startTime.getTime()) / (1000 * 60));

      // Save result
      const result = await storage.createResult({
        examId: exam._id,
        userId: req.user!._id,
        score,
        totalQuestions: questions.length,
        percentage,
        answers: answerDetails,
        timeTaken,
      });

      res.json({ resultId: result._id });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to submit exam" });
    }
  });

  // Results routes
  app.get("/api/results/:resultId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const result = await storage.getResultById(req.params.resultId);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      if (result.userId !== req.user!._id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get result" });
    }
  });

  app.get("/api/results", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const results = await storage.getUserResults(req.user!._id);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function seedQuestions() {
  try {
    const count = await mongodb.questions().countDocuments();
    if (count > 0) return;

    const sampleQuestions = [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        difficulty: "easy" as const,
        subject: "Geography",
        createdAt: new Date(),
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        difficulty: "easy",
        subject: "Science",
        createdAt: new Date(),
      },
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        difficulty: "easy",
        subject: "Mathematics",
        createdAt: new Date(),
      },
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        difficulty: "medium",
        subject: "Literature",
        createdAt: new Date(),
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        difficulty: "easy",
        subject: "Geography",
        createdAt: new Date(),
      },
      {
        question: "Which programming language is known for its use in web development?",
        options: ["Python", "JavaScript", "C++", "Java"],
        correctAnswer: 1,
        difficulty: "medium",
        subject: "Computer Science",
        createdAt: new Date(),
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctAnswer: 2,
        difficulty: "medium",
        subject: "Chemistry",
        createdAt: new Date(),
      },
      {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correctAnswer: 1,
        difficulty: "medium",
        subject: "History",
        createdAt: new Date(),
      },
      {
        question: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 2,
        difficulty: "easy",
        subject: "Mathematics",
        createdAt: new Date(),
      },
      {
        question: "Which organ in the human body produces insulin?",
        options: ["Liver", "Kidney", "Pancreas", "Heart"],
        correctAnswer: 2,
        difficulty: "medium",
        subject: "Biology",
        createdAt: new Date(),
      },
      {
        question: "What is the smallest unit of matter?",
        options: ["Molecule", "Atom", "Electron", "Proton"],
        correctAnswer: 1,
        difficulty: "medium",
        subject: "Physics",
        createdAt: new Date(),
      },
      {
        question: "Which continent is the Sahara Desert located on?",
        options: ["Asia", "Australia", "Africa", "South America"],
        correctAnswer: 2,
        difficulty: "easy",
        subject: "Geography",
        createdAt: new Date(),
      },
      {
        question: "What does 'HTML' stand for?",
        options: ["High Tech Modern Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
        correctAnswer: 1,
        difficulty: "medium",
        subject: "Computer Science",
        createdAt: new Date(),
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correctAnswer: 2,
        difficulty: "medium",
        subject: "Art",
        createdAt: new Date(),
      },
      {
        question: "What is the currency of Japan?",
        options: ["Yuan", "Won", "Yen", "Rupiah"],
        correctAnswer: 2,
        difficulty: "easy",
        subject: "Economics",
        createdAt: new Date(),
      }
    ];

    await mongodb.questions().insertMany(sampleQuestions as any);
    console.log('Sample questions seeded successfully');
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
}
