import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TimerProps {
  endTime: Date;
  onTimeUp: () => void;
  examId: string;
}

export function Timer({ endTime, onTimeUp, examId }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    // Load saved time from localStorage
    const savedEndTime = localStorage.getItem(`exam_${examId}_endTime`);
    if (savedEndTime) {
      const savedEnd = new Date(savedEndTime);
      const calculatedTime = calculateTimeLeft();
      setTimeLeft(calculatedTime);
    } else {
      // Save end time to localStorage
      localStorage.setItem(`exam_${examId}_endTime`, endTime.toISOString());
      setTimeLeft(calculateTimeLeft());
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        localStorage.removeItem(`exam_${examId}_endTime`);
        onTimeUp();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeUp, examId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // 5 minutes

  return (
    <Card className={`${isLowTime ? 'border-red-500 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isLowTime ? 'text-red-500' : 'text-primary'}`} />
          <span className={`font-mono text-lg font-bold ${isLowTime ? 'text-red-500' : 'text-primary'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        {isLowTime && (
          <p className="text-sm text-red-600 mt-1">Time is running out!</p>
        )}
      </CardContent>
    </Card>
  );
}
