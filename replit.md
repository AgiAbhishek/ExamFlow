# Exam Taking Application

## Project Overview
A full-stack exam-taking application with JWT authentication, timed MCQ exams, and automatic scoring using React frontend and FastAPI backend with MongoDB.

## Project Architecture
### Backend (FastAPI + MongoDB)
- **Framework**: FastAPI with Python
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens
- **ORM**: Motor (async MongoDB driver) + Pydantic models

### Frontend (React)
- **Framework**: React.js with TypeScript
- **State Management**: React hooks + Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI**: Tailwind CSS + shadcn/ui

### Database Models
- **Users**: id, username, email, password_hash, created_at
- **Questions**: id, question_text, options, correct_answer, difficulty
- **Exams**: id, user_id, questions, start_time, end_time, submitted_at
- **Results**: id, exam_id, user_id, score, total_questions, answers

## Features
- User registration & login with JWT authentication
- Start Exam interface with random MCQs
- Navigation between questions (Next/Previous)
- 30-minute countdown timer with auto-submit
- Submit exam with backend score calculation
- Result display page
- Timer persistence across page refreshes

## User Preferences
- Production-ready code with best practices
- Clear modular structure
- Comprehensive API documentation
- Complete setup instructions

## Recent Changes
- Initial project setup and architecture planning (2025-08-19)