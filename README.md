# Exam Taking Application

A full-stack exam-taking application with JWT authentication, timed MCQ exams, and automatic scoring using React frontend and Express backend with MongoDB.

## Features

- **Authentication**: User registration & login with JWT tokens
- **Exam System**: Random MCQ selection with 10 questions per exam
- **Timer**: 30-minute countdown with auto-submit functionality
- **Navigation**: Previous/Next question navigation with progress tracking
- **Real-time Saving**: Answers saved automatically as you progress
- **Results**: Comprehensive score breakdown with detailed question analysis
- **Persistence**: Timer and progress maintained across page refreshes

## Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas for request/response validation

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Prerequisites

Make sure you have the following installed on your MacBook M4 Air:

1. **Node.js** (v18 or higher)
   ```bash
   # Check if you have Node.js installed
   node --version
   
   # If not installed, download from https://nodejs.org/
   # Or install via Homebrew:
   brew install node
   ```

2. **Git**
   ```bash
   # Check if you have Git installed
   git --version
   
   # If not installed:
   xcode-select --install
   ```

## Setup Instructions

### 1. Clone the Repository

```bash
# Clone the project
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Create the environment file
touch .env
```

Add the following environment variables to `.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://rrrahulraj4839:canwZkG3qTH5zaxk@cluster1.d2ejgkh.mongodb.net/My-exam?retryWrites=true&w=majority&appName=Cluster1

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Node Environment
NODE_ENV=development
```

**Important**: For production, generate a secure JWT secret:
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start the Application

```bash
# Start the development server
npm run dev
```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend application** on `http://localhost:5173`

The application will automatically:
- Connect to MongoDB
- Seed sample questions if the database is empty
- Open your default browser to the application

### 5. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## Usage Guide

### 1. Registration
- Click "Sign up" on the login page
- Enter username, email, and password
- You'll be automatically logged in after successful registration

### 2. Taking an Exam
- Click "Start Exam" from the dashboard
- Answer 10 randomly selected questions
- Use Previous/Next buttons to navigate
- Timer shows remaining time (30 minutes total)
- Click "Submit Exam" when finished, or it auto-submits when time expires

### 3. Viewing Results
- Results show immediately after exam submission
- See your score, percentage, and grade
- Review each question with correct answers highlighted
- Access past results from the dashboard

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── auth.ts           # JWT authentication
│   ├── mongodb.ts        # Database connection
│   ├── storage.ts        # Database operations
│   └── routes.ts         # API routes
├── shared/               # Shared TypeScript schemas
└── components.json       # shadcn/ui configuration
```

## API Documentation

### Authentication Endpoints

**POST** `/api/auth/register`
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "string",
  "password": "string"
}
```

**GET** `/api/auth/me` (Protected)
- Returns current user information

### Exam Endpoints

**POST** `/api/exams/start` (Protected)
```json
{
  "timeLimit": 30
}
```

**GET** `/api/exams/:examId` (Protected)
- Returns exam details and questions

**PUT** `/api/exams/:examId/answer` (Protected)
```json
{
  "questionIndex": 0,
  "answer": 2
}
```

**POST** `/api/exams/:examId/submit` (Protected)
- Submits exam and calculates score

### Results Endpoints

**GET** `/api/results/:resultId` (Protected)
- Returns detailed exam results

**GET** `/api/results` (Protected)
- Returns user's exam history

## Sample Questions

The application includes 15 sample questions across various subjects:
- Geography, Science, Mathematics
- Literature, History, Chemistry
- Physics, Biology, Computer Science
- Art, Economics

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Or change port in package.json
   ```

2. **MongoDB Connection Issues**
   - Verify your MongoDB URI is correct
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure network connectivity

3. **Dependencies Issues**
   ```bash
   # Clear npm cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Environment Variables**
   - Ensure `.env` file is in the root directory
   - Check that all required variables are set
   - Restart the server after changing `.env`

### Development Tips

1. **Hot Reloading**: Both frontend and backend support hot reloading
2. **Console Logs**: Check browser console and terminal for errors
3. **Database**: Use MongoDB Compass to inspect your database
4. **API Testing**: Use tools like Postman to test API endpoints

## Production Deployment

For production deployment:

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Use a production MongoDB cluster
   - Generate a secure JWT secret
   - Set NODE_ENV=production

3. **Security Considerations**
   - Enable CORS restrictions
   - Use HTTPS in production
   - Implement rate limiting
   - Add input sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

---

**Need Help?** 
- Check the console for error messages
- Ensure all dependencies are installed
- Verify your MongoDB connection
- Make sure ports 5000 and 5173 are available