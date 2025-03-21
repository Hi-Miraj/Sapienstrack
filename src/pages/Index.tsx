
import React, { useState, useEffect } from 'react';
import { Settings, Flame, Linkedin, Github, Instagram, Youtube, Twitter } from 'lucide-react';
import { Toaster } from 'sonner';
import { formatTimeHours, formatTime } from '@/utils/timerUtils';
import { getTotalStudyTime, getStreak } from '@/utils/storageUtils';
import { useIsMobile } from '@/hooks/use-mobile';

// Components
import StudyTimer from '@/components/StudyTimer';
import SubjectSelection from '@/components/SubjectSelection';
import StudyGoals from '@/components/StudyGoals';
import FocusControls from '@/components/FocusControls';
import StudyStats from '@/components/StudyStats';

const Index = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [streak, setStreak] = useState(0);
  const [refreshGoals, setRefreshGoals] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const isMobile = useIsMobile();

  // Load total study time and streak on mount
  useEffect(() => {
    setTotalStudyTime(getTotalStudyTime());
    setStreak(getStreak());
  }, []);

  // Session complete handler
  const handleSessionComplete = () => {
    // Update total study time
    setTotalStudyTime(getTotalStudyTime());
    // Update streak
    setStreak(getStreak());
    // Refresh goals
    setRefreshGoals(true);
  };

  return (
    <div className={`min-h-screen bg-study-darker text-white p-4 ${isMobile ? 'w-full' : 'max-w-4xl mx-auto'}`}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Sapiens
        </h1>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <Settings size={20} className="text-white/70" />
        </button>
      </div>
      
      {/* Motivational quote */}
      <p className="text-white/60 text-xs italic mb-4">
        "Every minute spent learning is an investment in your future."
      </p>
      
      {/* Layout for desktop/mobile */}
      <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-2 gap-6'}`}>
        {/* Left Column - Timer and Controls */}
        <div className="flex flex-col">
          {/* Total study time */}
          <div className="glass-card rounded-md px-4 py-3 mb-6 flex justify-center items-center animate-fade-in">
            <span className="text-white/70 mr-2">Total Study Time:</span>
            <span className="text-white font-medium">{formatTimeHours(totalStudyTime * 60)}</span>
            
            {/* Study streak */}
            {streak > 0 && (
              <div className="ml-auto flex items-center text-amber-400">
                <Flame size={16} className="mr-1" />
                <span className="text-sm font-medium">{streak} Day Streak!</span>
              </div>
            )}
          </div>
          
          {/* Timer Section */}
          <div className="mb-6">
            <StudyTimer 
              selectedSubject={selectedSubject} 
              onSessionComplete={handleSessionComplete}
            />
          </div>
          
          {/* Controls */}
          <div className="mb-6">
            <FocusControls onViewStats={() => setShowStats(!showStats)} />
          </div>
          
          {/* Subject Selection (only on mobile) */}
          {isMobile && (
            <div className="mb-6">
              <SubjectSelection
                selectedSubject={selectedSubject}
                onSelectSubject={(subjectId) => setSelectedSubject(subjectId)}
              />
            </div>
          )}
        </div>
        
        {/* Right Column - Stats, Goals, and Subject Selection */}
        <div className="flex flex-col">
          {/* Stats panel (conditionally rendered) */}
          <StudyStats visible={showStats} />
          
          {/* Subject Selection (only on desktop) */}
          {!isMobile && (
            <div className="mb-6">
              <SubjectSelection
                selectedSubject={selectedSubject}
                onSelectSubject={(subjectId) => setSelectedSubject(subjectId)}
              />
            </div>
          )}
          
          {/* Study Goals */}
          <div className="mb-4">
            <StudyGoals 
              onRefreshNeeded={refreshGoals}
              onRefreshComplete={() => setRefreshGoals(false)}
            />
          </div>
        </div>
      </div>
      
      {/* Enhanced footer with social links */}
      <footer className="mt-8 pt-4 border-t border-white/10">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Sapiens
            </h2>
            <p className="text-white/40 text-xs text-center mt-1">Elevate your learning journey</p>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center items-center space-x-6 mb-4">
            <a 
              href="https://www.linkedin.com/in/mirajshafek/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a 
              href="https://github.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://www.instagram.com/miraj_shafek/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-pink-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.youtube.com/@Hi-Miraj" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-red-500 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
            <a 
              href="https://x.com/MirajShafek" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
          </div>
          
          {/* Copyright */}
          <span className="text-white/40 text-xs">© {new Date().getFullYear()} Sapiens</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
