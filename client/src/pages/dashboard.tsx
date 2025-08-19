import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { BookOpen, Clock, Trophy, LogOut, Plus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Result } from '@shared/schema';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: results, isLoading } = useQuery<Result[]>({
    queryKey: ['/api/results'],
  });

  const startExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/exams/start', { timeLimit: 30 });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Exam started',
        description: 'Good luck with your exam!',
      });
      setLocation(`/exam/${data.examId}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to start exam',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const handleStartExam = () => {
    startExamMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Exam Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start New Exam */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Start New Exam
                </CardTitle>
                <CardDescription>
                  Take a new exam with 10 randomly selected questions. You have 30 minutes to complete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>10 Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>30 Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>Multiple Choice</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleStartExam}
                    disabled={startExamMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {startExamMutation.isPending ? 'Starting...' : 'Start Exam'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Exams Taken:</span>
                      <span className="font-semibold">{results?.length || 0}</span>
                    </div>
                    {results && results.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Score:</span>
                          <span className="font-semibold">
                            {Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Best Score:</span>
                          <span className="font-semibold">
                            {Math.max(...results.map(r => r.percentage))}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Results */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>
                Your latest exam attempts and scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-3">
                  {results.slice(0, 5).map((result) => (
                    <div
                      key={result._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setLocation(`/results/${result.examId}`)}
                    >
                      <div>
                        <div className="font-medium">
                          Exam - {new Date(result.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.score}/{result.totalQuestions} questions correct
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${result.percentage >= 70 ? 'text-green-600' : result.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {result.percentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.timeTaken}min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No exam results yet</p>
                  <p className="text-sm">Start your first exam to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
