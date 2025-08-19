import { MongoClient, Db, Collection } from 'mongodb';
import { User, Question, Exam, Result } from '@shared/schema';
import dotenv from "dotenv";
dotenv.config();

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('My-exam');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  users(): Collection<User> {
    return this.getDb().collection<User>('users');
  }

  questions(): Collection<Question> {
    return this.getDb().collection<Question>('questions');
  }

  exams(): Collection<Exam> {
    return this.getDb().collection<Exam>('exams');
  }

  results(): Collection<Result> {
    return this.getDb().collection<Result>('results');
  }
}

export const mongodb = new MongoDB();
