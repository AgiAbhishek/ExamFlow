import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Timer } from '@/components/timer';
import { QuestionCard } from '@/components/question-card';
import { apiRequest } from '@/lib/queryClient';
import { BookOpen, Send } from 'lucide-react';

interface ExamData {
  examId: string;
  questions: Array<{
    _id: string;
    question: string;
    options: string[];
  }>;
  answers: (number | null)[];
  timeLimit: number;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

export default function Exam() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const examId = params.examId as string;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  const { data: exam, isLoading, error } = useQuery<ExamData>({
    queryKey: ['/api/exams', examId],
    enabled: !!examId,
    refetchInterval: false,
  });

  const saveAnswerMutation = useMutation({
    mutationFn: async ({ questionIndex, answer }: { questionIndex: number; answer: number | null }) => {
      await apiRequest('PUT', `/api/exams/${examId}/answer`, { questionIndex, answer });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save answer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const submitExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/exams/${examId}/submit`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      // Clear timer from localStorage
      localStorage.removeItem(`exam_${examId}_endTime`);
      
      toast({
        title: 'Exam submitted successfully',
        description: 'Your exam has been graded. Redirecting to results...',
      });
      setLocation(`/results/${data.resultId}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit exam',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle answer selection
  const handleAnswerSelect = (answer: number | null) => {
    if (!exam) return;

    saveAnswerMutation.mutate({ questionIndex: currentQuestion, answer });
    
    // Update local state immediately for better UX
    queryClient.setQueryData(['/api/exams', examId], (oldData: ExamData | undefined) => {
      if (!oldData) return oldData;
      const newAnswers = [...oldData.answers];
      newAnswers[currentQuestion] = answer;
      return { ...oldData, answers: newAnswers };
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestion < exam!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowSubmitDialog(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Timer handlers
  const handleTimeUp = () => {
    setIsAutoSubmitting(true);
    toast({
      title: 'Time\'s up!',
      description: 'Your exam is being submitted automatically.',
      variant: 'destructive',
    });
    submitExamMutation.mutate();
  };

  const handleSubmit = () => {
    setShowSubmitDialog(false);
    submitExamMutation.mutate();
  };

  // Load saved question index from localStorage
  useEffect(() => {
    if (exam) {
      const savedQuestion = localStorage.getItem(`exam_${examId}_currentQuestion`);
      if (savedQuestion) {
        setCurrentQuestion(parseInt(savedQuestion));
      }
    }
  }, [exam, examId]);

  // Save current question to localStorage
  useEffect(() => {
    if (exam) {
      localStorage.setItem(`exam_${examId}_currentQuestion`, currentQuestion.toString());
    }
  }, [currentQuestion, examId, exam]);

  // Clean up localStorage on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem(`exam_${examId}_currentQuestion`);
    };
  }, [examId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-16 w-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Exam not found</h2>
            <p className="text-gray-600 mb-4">The exam you're looking for doesn't exist or has expired.</p>
            <Button onClick={() => setLocation('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (exam.isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Exam Completed</h2>
            <p className="text-gray-600 mb-4">This exam has already been submitted.</p>
            <Button onClick={() => setLocation('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Exam in Progress</h1>
            </div>
            <Timer
              endTime={new Date(exam.endTime)}
              onTimeUp={handleTimeUp}
              examId={examId}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitExamMutation.isPending || isAutoSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Answered: {exam.answers.filter(a => a !== null).length} / {exam.questions.length}
          </div>
        </div>

        <QuestionCard
          question={exam.questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          totalQuestions={exam.questions.length}
          selectedAnswer={exam.answers[currentQuestion]}
          onAnswerSelect={handleAnswerSelect}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={true}
          canGoPrevious={currentQuestion > 0}
        />

        {/* Question Navigation */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Question Navigation</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {exam.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestion === index ? "default" : exam.answers[index] !== null ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? This action cannot be undone.
              <br /><br />
              You have answered {exam.answers.filter(a => a !== null).length} out of {exam.questions.length} questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitExamMutation.isPending}
            >
              {submitExamMutation.isPending ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
