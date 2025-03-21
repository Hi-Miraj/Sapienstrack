
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import CircularTimer from './CircularTimer';
import { 
  addStudyTime, 
  updateGoalMinutes, 
  setLastStudyDate, 
  getLastStudyDate, 
  getGoals,
  incrementStreak, 
  addSession
} from '@/utils/storageUtils';
import { toast } from 'sonner';
import { formatTime } from '@/utils/timerUtils';

interface StudyTimerProps {
  selectedSubject: string | null;
  onSessionComplete: () => void;
}

const timerOptions = [
  { time: 5, label: '5 min' },
  { time: 15, label: '15 min' },
  { time: 25, label: '25 min' },
  { time: 45, label: '45 min' },
  { time: 60, label: '1 hour' },
];

const StudyTimer: React.FC<StudyTimerProps> = ({ selectedSubject, onSessionComplete }) => {
  const [timeInMinutes, setTimeInMinutes] = useState(25);
  const [selectedTime, setSelectedTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when time changes
  useEffect(() => {
    resetTimer();
  }, [timeInMinutes]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      completeTimer();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Start/pause timer
  const toggleTimer = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject first");
      return;
    }
    
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeLeft(timeInMinutes * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  // Complete timer
  const completeTimer = () => {
    if (!selectedSubject) return;
    
    setIsRunning(false);
    setIsCompleted(true);
    
    // Update study time
    addStudyTime(timeInMinutes);
    
    // Update goals for this subject
    const goals = getGoals();
    const subjectGoals = goals.filter(goal => goal.subjectId === selectedSubject);
    
    subjectGoals.forEach(goal => {
      updateGoalMinutes(goal.id, timeInMinutes);
    });
    
    // Add study session
    addSession({
      subjectId: selectedSubject,
      date: Date.now(),
      durationMinutes: timeInMinutes
    });
    
    // Check streak logic
    const lastStudyDate = getLastStudyDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStudyDate) {
      const lastDate = new Date(lastStudyDate);
      if (lastDate.toDateString() === yesterday.toDateString() || 
          lastDate.toDateString() === today.toDateString()) {
        incrementStreak();
      }
    } else {
      incrementStreak();
    }
    
    // Set last study date
    setLastStudyDate(Date.now());
    
    // Call the session complete callback
    onSessionComplete();
    
    // Show success toast
    toast.success(`${timeInMinutes} minutes study session completed!`);
  };

  // Set custom timer
  const setCustomTimer = (minutes: number) => {
    setTimeInMinutes(minutes);
    setSelectedTime(minutes);
    resetTimer();
  };

  return (
    <div>
      <div className="glass-card p-4 rounded-md text-center relative overflow-hidden animate-fade-in">
        {/* Warning when no subject selected */}
        {!selectedSubject && !isRunning && (
          <div className="absolute inset-0 bg-study-card-hover/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-white flex flex-col items-center p-6">
              <AlertCircle size={40} className="text-amber-500 mb-2" />
              <p className="mb-1 font-medium">No subject selected</p>
              <p className="text-sm text-white/70">Please select a subject to start timer</p>
            </div>
          </div>
        )}
        
        {/* Timer circle */}
        <div className="mb-4 flex justify-center">
          <CircularTimer 
            radius={120} 
            progress={(timeInMinutes * 60 - timeLeft) / (timeInMinutes * 60) * 100}
            timeLeft={formatTime(timeLeft)}
            isCompleted={isCompleted}
          />
        </div>
        
        {/* Timer controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={toggleTimer}
            className="w-12 h-12 rounded-full bg-study-blue text-white flex items-center justify-center 
              hover:bg-opacity-90 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-transition"
            aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center 
              hover:bg-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none focus-transition"
            aria-label="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>
        </div>
        
        {/* Timer options */}
        <div className="flex flex-wrap justify-center gap-2">
          {timerOptions.map((option) => (
            <button
              key={option.time}
              onClick={() => setCustomTimer(option.time)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                selectedTime === option.time
                  ? 'bg-study-blue text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } focus-transition`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
