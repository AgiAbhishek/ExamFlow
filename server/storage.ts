import { ObjectId } from 'mongodb';
import { User, InsertUser, Question, InsertQuestion, Exam, InsertExam, Result } from '@shared/schema';
import { mongodb } from './mongodb';
import { hashPassword } from './auth';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;

  // Question operations
  getRandomQuestions(count: number): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | null>;
  getQuestionsByIds(ids: string[]): Promise<Question[]>;

  // Exam operations
  createExam(exam: InsertExam): Promise<Exam>;
  getExam(id: string): Promise<Exam | null>;
  updateExamAnswers(examId: string, answers: (number | null)[]): Promise<void>;
  submitExam(examId: string, submittedAt: Date): Promise<void>;

  // Result operations
  createResult(result: Omit<Result, '_id' | 'createdAt'>): Promise<Result>;
  getResultByExamId(examId: string): Promise<Result | null>;
  getUserResults(userId: string): Promise<Result[]>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | null> {
    try {
      const user = await mongodb.users().findOne({ _id: new ObjectId(id) } as any);
      return user ? { ...user, _id: user._id.toString() } : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await mongodb.users().findOne({ email });
      return user ? { ...user, _id: user._id.toString() } : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const hashedPassword = await hashPassword(userData.password);
      const user = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
      };

      const result = await mongodb.users().insertOne(user as any);
      return {
        ...user,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getRandomQuestions(count: number): Promise<Question[]> {
    try {
      const questions = await mongodb.questions().aggregate([
        { $sample: { size: count } }
      ]).toArray();

      return questions.map(q => ({ ...q, _id: q._id.toString() })) as Question[];
    } catch (error) {
      console.error('Error getting random questions:', error);
      return [];
    }
  }

  async getQuestionById(id: string): Promise<Question | null> {
    try {
      const question = await mongodb.questions().findOne({ _id: new ObjectId(id) } as any);
      return question ? { ...question, _id: question._id.toString() } : null;
    } catch (error) {
      console.error('Error getting question:', error);
      return null;
    }
  }

  async getQuestionsByIds(ids: string[]): Promise<Question[]> {
    try {
      const objectIds = ids.map(id => new ObjectId(id));
      const questions = await mongodb.questions().find({ 
        _id: { $in: objectIds } 
      } as any).toArray();

      return questions.map(q => ({ ...q, _id: q._id.toString() }));
    } catch (error) {
      console.error('Error getting questions by IDs:', error);
      return [];
    }
  }

  async createExam(examData: InsertExam): Promise<Exam> {
    try {
      const exam = {
        ...examData,
        submittedAt: null,
        score: null,
        isCompleted: false,
      };

      const result = await mongodb.exams().insertOne(exam as any);
      return {
        ...exam,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  async getExam(id: string): Promise<Exam | null> {
    try {
      const exam = await mongodb.exams().findOne({ _id: new ObjectId(id) } as any);
      return exam ? { ...exam, _id: exam._id.toString() } : null;
    } catch (error) {
      console.error('Error getting exam:', error);
      return null;
    }
  }

  async updateExamAnswers(examId: string, answers: (number | null)[]): Promise<void> {
    try {
      await mongodb.exams().updateOne(
        { _id: new ObjectId(examId) } as any,
        { $set: { answers } }
      );
    } catch (error) {
      console.error('Error updating exam answers:', error);
      throw error;
    }
  }

  async submitExam(examId: string, submittedAt: Date): Promise<void> {
    try {
      await mongodb.exams().updateOne(
        { _id: new ObjectId(examId) } as any,
        { 
          $set: { 
            submittedAt,
            isCompleted: true,
            endTime: submittedAt
          }
        }
      );
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  }

  async createResult(resultData: Omit<Result, '_id' | 'createdAt'>): Promise<Result> {
    try {
      const result = {
        ...resultData,
        createdAt: new Date(),
      };

      const insertResult = await mongodb.results().insertOne(result as any);
      return {
        ...result,
        _id: insertResult.insertedId.toString(),
      };
    } catch (error) {
      console.error('Error creating result:', error);
      throw error;
    }
  }

  async getResultById(resultId: string): Promise<Result | null> {
    try {
      const { ObjectId } = await import('mongodb');
      const result = await mongodb.results().findOne({ _id: new ObjectId(resultId) } as any);
      return result ? { ...result, _id: result._id.toString() } : null;
    } catch (error) {
      console.error('Error getting result:', error);
      return null;
    }
  }

  async getResultByExamId(examId: string): Promise<Result | null> {
    try {
      const result = await mongodb.results().findOne({ examId });
      return result ? { ...result, _id: result._id.toString() } : null;
    } catch (error) {
      console.error('Error getting result:', error);
      return null;
    }
  }

  async getUserResults(userId: string): Promise<Result[]> {
    try {
      const results = await mongodb.results().find({ userId }).sort({ createdAt: -1 }).toArray();
      return results.map(r => ({ ...r, _id: r._id.toString() }));
    } catch (error) {
      console.error('Error getting user results:', error);
      return [];
    }
  }
}

export const storage = new MongoStorage();
