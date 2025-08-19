import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, CheckCircle, XCircle, Home } from 'lucide-react';
import { Result } from '@shared/schema';

export default function Results() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const resultId = params.resultId as string;

  const { data: result, isLoading, error } = useQuery<Result>({
    queryKey: ['/api/results', resultId],
    enabled: !!resultId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Result not found</h2>
            <p className="text-gray-600 mb-4">The exam result you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Exam Results</h1>
            </div>
            <Button variant="outline" onClick={() => setLocation('/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-8">
        {/* Score Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Score
            </CardTitle>
            <CardDescription>
              Exam completed on {new Date(result.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
                  {result.percentage}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
                <Badge variant={result.percentage >= 70 ? "default" : "destructive"} className="mt-2">
                  Grade: {getGrade(result.percentage)}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.score}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {result.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Clock className="h-5 w-5" />
                  {result.timeTaken}m
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>
              Review your answers and see the correct solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.answers.map((answer, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-lg">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{answer.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {answer.options.map((option, optionIndex) => {
                      const isUserAnswer = answer.userAnswer === optionIndex;
                      const isCorrectAnswer = answer.correctAnswer === optionIndex;
                      
                      let bgColor = '';
                      if (isCorrectAnswer) {
                        bgColor = 'bg-green-50 border-green-200';
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        bgColor = 'bg-red-50 border-red-200';
                      } else {
                        bgColor = 'bg-gray-50 border-gray-200';
                      }
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 border rounded-lg ${bgColor}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span>{option}</span>
                            {isUserAnswer && (
                              <Badge variant="outline">
                                Your Answer
                              </Badge>
                            )}
                            {isCorrectAnswer && (
                              <Badge variant="default">
                                Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {answer.userAnswer === null && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        This question was not answered.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button onClick={() => setLocation('/dashboard')}>
            Take Another Exam
          </Button>
        </div>
      </main>
    </div>
  );
}
