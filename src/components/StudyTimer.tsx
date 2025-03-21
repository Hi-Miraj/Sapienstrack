import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatTime, getProgressPercentage } from '@/utils/timerUtils';
import CircularTimer from '@/components/CircularTimer';
import { Play, Pause, RefreshCw, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { addSession, getSubjectById } from '@/utils/storageUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StudyTimerProps {
  selectedSubject: string | null;
  onSessionComplete: () => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({
  selectedSubject,
  onSessionComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [customFocusTime, setCustomFocusTime] = useState(25);
  const [customShortBreak, setCustomShortBreak] = useState(5);
  const [customLongBreak, setCustomLongBreak] = useState(15);
  const [customCycles, setCustomCycles] = useState(4);
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  
  // Track accumulated time for incomplete sessions
  const accumulatedTimeRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // Reset timer when changing duration
  const resetTimer = useCallback((minutes: number) => {
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
    setElapsedTime(0);
    setIsActive(false);
    setIsPaused(false);
    
    // Save any accumulated time before resetting
    saveAccumulatedTime();
    accumulatedTimeRef.current = 0;
  }, [selectedSubject]);

  // Calculate progress for the circular timer
  const progress = getProgressPercentage(elapsedTime, totalTime);

  // Save accumulated time as a session
  const saveAccumulatedTime = () => {
    if (accumulatedTimeRef.current > 0 && selectedSubject) {
      // Only save if we've accumulated at least 1 minute
      if (accumulatedTimeRef.current >= 60) {
        const minutesToSave = Math.floor(accumulatedTimeRef.current / 60);
        addSession(selectedSubject, minutesToSave);
        toast.success(`Saved ${minutesToSave} minutes of study time`);
        onSessionComplete();
      }
      accumulatedTimeRef.current = 0;
    }
  };

  // Timer functionality
  useEffect(() => {
    let interval: number | null = null;

    if (isActive && !isPaused) {
      // Set start time when the timer becomes active
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer complete
            clearInterval(interval!);
            setIsActive(false);
            
            // Calculate actual elapsed time since timer started
            if (startTimeRef.current) {
              const actualElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
              accumulatedTimeRef.current += actualElapsedSeconds;
              startTimeRef.current = null;
            }
            
            if (selectedSubject && timerMode === 'focus') {
              // Record the completed session
              const durationMinutes = Math.ceil(totalTime / 60);
              addSession(selectedSubject, durationMinutes);
              
              // Notify the user
              toast.success(`Great job! You completed ${durationMinutes} minutes of study.`);
              
              // Notify parent component
              onSessionComplete();
              
              // Transition to break based on current cycle
              if (currentCycle % customCycles === 0) {
                handleTimerModeChange('longBreak');
              } else {
                handleTimerModeChange('shortBreak');
              }
              
              // Increment cycle count if we're in focus mode
              setCurrentCycle(prev => prev + 1);
              
              // Auto-start break if enabled
              if (autoStartBreaks) {
                setTimeout(() => {
                  setIsActive(true);
                  setIsPaused(false);
                }, 500);
              }
            } else if (timerMode !== 'focus') {
              // Break is complete
              toast.success("Break time complete!");
              
              // Go back to focus mode
              handleTimerModeChange('focus');
              
              // Auto-start next pomodoro if enabled
              if (autoStartPomodoros) {
                setTimeout(() => {
                  setIsActive(true);
                  setIsPaused(false);
                }, 500);
              }
            } else {
              toast.error("No subject selected. Session was not saved.");
            }
            
            return 0;
          }
          
          // Update elapsed time for progress tracking
          setElapsedTime(totalTime - prevTime + 1);
          
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
      
      // If we're pausing, record the elapsed time so far
      if (isPaused && startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        accumulatedTimeRef.current += elapsedSeconds;
        startTimeRef.current = null;
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      
      // Save accumulated time when component unmounts
      saveAccumulatedTime();
    };
  }, [isActive, isPaused, totalTime, selectedSubject, onSessionComplete, timerMode, customCycles, autoStartBreaks, autoStartPomodoros]);

  // Start or pause timer
  const toggleTimer = () => {
    if (timerMode === 'focus' && !selectedSubject) {
      toast.warning("Please select a subject first");
      return;
    }

    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      // We'll set startTimeRef when the timer actually starts in the effect
    } else {
      setIsPaused(!isPaused);
    }
  };

  // Set different timer durations
  const setTimerDuration = (minutes: number) => {
    resetTimer(minutes);
  };

  // Handle timer mode changes (focus, short break, long break)
  const handleTimerModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    // Save accumulated time before switching modes
    saveAccumulatedTime();
    
    setTimerMode(mode);
    
    if (mode === 'focus') {
      setTimerDuration(customFocusTime);
    } else if (mode === 'shortBreak') {
      setTimerDuration(customShortBreak);
    } else if (mode === 'longBreak') {
      setTimerDuration(customLongBreak);
    }
  };

  // Save custom timer settings
  const saveCustomTimerSettings = () => {
    setShowSettingsModal(false);
    toast.success("Timer settings updated");
  };

  // Get selected subject name for display
  const getSelectedSubjectName = useCallback(() => {
    if (!selectedSubject) return '';
    const subject = getSubjectById(selectedSubject);
    return subject?.name || '';
  }, [selectedSubject]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Timer type selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleTimerModeChange('focus')}
          className={`px-3 py-1 rounded-full text-xs md:text-sm ${
            timerMode === 'focus'
              ? 'bg-study-blue text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          } transition-all duration-300`}
        >
          Focus
        </button>
        <button
          onClick={() => handleTimerModeChange('shortBreak')}
          className={`px-3 py-1 rounded-full text-xs md:text-sm ${
            timerMode === 'shortBreak'
              ? 'bg-teal-500 text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          } transition-all duration-300`}
        >
          Short Break
        </button>
        <button
          onClick={() => handleTimerModeChange('longBreak')}
          className={`px-3 py-1 rounded-full text-xs md:text-sm ${
            timerMode === 'longBreak'
              ? 'bg-indigo-500 text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          } transition-all duration-300`}
        >
          Long Break
        </button>
      </div>

      {/* Timer Circle */}
      <div className="relative text-study-blue">
        <CircularTimer 
          progress={progress} 
          color={
            timerMode === 'focus' 
              ? '#3B82F6' 
              : timerMode === 'shortBreak' 
                ? '#10B981' 
                : '#6366F1'
          }
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-extralight animate-fade-in tracking-tight text-white">
            {formatTime(timeLeft)}
          </div>
          
          {/* Show current mode */}
          <div className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/80">
            {timerMode === 'focus' ? 
              (selectedSubject ? `Studying ${getSelectedSubjectName()}` : 'Focus Time') : 
              timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'
            }
          </div>
          
          {/* Show active indicator when timer is running */}
          {isActive && !isPaused && (
            <div className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full
              ${timerMode === 'focus' 
                ? 'bg-study-blue/20 text-study-blue' 
                : timerMode === 'shortBreak' 
                  ? 'bg-teal-500/20 text-teal-500' 
                  : 'bg-indigo-500/20 text-indigo-500'
              } animate-pulse-soft`}>
              {timerMode === 'focus' 
                ? `Cycle ${currentCycle}` 
                : 'Taking a break'
              }
            </div>
          )}
          
          {/* Controls when paused or inactive */}
          {(!isActive || isPaused) && (
            <div className="mt-4 flex space-x-4">
              <button
                onClick={toggleTimer}
                className={`p-3 rounded-full 
                  ${timerMode === 'focus' 
                    ? 'bg-study-blue/10 text-study-blue hover:bg-study-blue/20' 
                    : timerMode === 'shortBreak' 
                      ? 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20' 
                      : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
                  } transition-all duration-300`}
              >
                <Play size={24} />
              </button>
              
              <button
                onClick={() => {
                  if (timerMode === 'focus') {
                    resetTimer(customFocusTime);
                  } else if (timerMode === 'shortBreak') {
                    resetTimer(customShortBreak);
                  } else {
                    resetTimer(customLongBreak);
                  }
                }}
                className="p-3 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          )}
          
          {/* Pause button when active */}
          {isActive && !isPaused && (
            <div className="mt-4">
              <button
                onClick={toggleTimer}
                className="p-3 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                <Pause size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timer duration options */}
      <div className="flex space-x-3">
        <button
          onClick={() => setTimerDuration(15)}
          className={`px-3 py-1 rounded-full text-sm ${
            totalTime === 15 * 60 && timerMode === 'focus'
              ? 'bg-study-blue text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          } transition-all duration-300`}
        >
          15:00
        </button>
        <button
          onClick={() => setTimerDuration(25)}
          className={`px-3 py-1 rounded-full text-sm ${
            totalTime === 25 * 60 && timerMode === 'focus'
              ? 'bg-study-blue text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          } transition-all duration-300`}
        >
          25:00
        </button>
        <button
          onClick={() => setTimerDuration(45)}
          className={`px-3 py-1 rounded-full text-sm ${
            totalTime === 45 * 60 && timerMode === 'focus'
              ? 'bg-study-blue text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
          } transition-all duration-300`}
        >
          45:00
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="px-3 py-1 rounded-full text-sm bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
        >
          <Settings2 size={14} className="inline mr-1" />
          Custom
        </button>
      </div>

      {/* Custom Timer Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="glass-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Pomodoro Timer Settings</DialogTitle>
            <DialogDescription>
              Customize your study sessions and breaks
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="durations" className="mt-2">
            <TabsList className="bg-white/5 text-white/70">
              <TabsTrigger value="durations">Durations</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="durations" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Focus Time (minutes)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customFocusTime]}
                    min={1}
                    max={120}
                    step={1}
                    onValueChange={(value) => setCustomFocusTime(value[0])}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    min="1"
                    max="120"
                    value={customFocusTime}
                    onChange={(e) => setCustomFocusTime(Number(e.target.value))}
                    className="w-16 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Short Break (minutes)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customShortBreak]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => setCustomShortBreak(value[0])}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    min="1"
                    max="30"
                    value={customShortBreak}
                    onChange={(e) => setCustomShortBreak(Number(e.target.value))}
                    className="w-16 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Long Break (minutes)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[customLongBreak]}
                    min={5}
                    max={60}
                    step={1}
                    onValueChange={(value) => setCustomLongBreak(value[0])}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    min="5"
                    max="60"
                    value={customLongBreak}
                    onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                    className="w-16 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="automation" className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Cycles before Long Break</Label>
                <div className="flex items-center space-x-4">
                  <Input 
                    type="number" 
                    min="1"
                    max="10"
                    value={customCycles}
                    onChange={(e) => setCustomCycles(Number(e.target.value))}
                    className="w-16 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Auto-start Breaks</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={autoStartBreaks ? "default" : "outline"}
                    onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                    className={autoStartBreaks ? "bg-study-blue" : "bg-white/5 border-white/10"}
                  >
                    {autoStartBreaks ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Auto-start Pomodoros</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={autoStartPomodoros ? "default" : "outline"}
                    onClick={() => setAutoStartPomodoros(!autoStartPomodoros)}
                    className={autoStartPomodoros ? "bg-study-blue" : "bg-white/5 border-white/10"}
                  >
                    {autoStartPomodoros ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Current Cycle</Label>
                <div className="flex items-center space-x-4">
                  <Input 
                    type="number" 
                    min="1"
                    value={currentCycle}
                    onChange={(e) => setCurrentCycle(Number(e.target.value))}
                    className="w-16 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Reset Cycle Count</Label>
                <Button
                  variant="outline"
                  onClick={() => setCurrentCycle(1)}
                  className="bg-white/5 border-white/10"
                >
                  Reset
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSettingsModal(false)}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                // Apply settings depending on current mode
                if (timerMode === 'focus') {
                  setTimerDuration(customFocusTime);
                } else if (timerMode === 'shortBreak') {
                  setTimerDuration(customShortBreak);
                } else {
                  setTimerDuration(customLongBreak);
                }
                saveCustomTimerSettings();
              }}
              className="bg-study-blue hover:bg-study-blue/90"
            >
              Apply & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyTimer;
