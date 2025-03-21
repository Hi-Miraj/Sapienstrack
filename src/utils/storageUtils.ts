// Types for our data structures
export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface StudyGoal {
  id: string;
  subjectId: string;
  targetHours: number;
  weeklyTarget: boolean;
  completedMinutes: number;
  createdAt: number; // timestamp
}

export interface StudySession {
  id: string;
  subjectId: string;
  durationMinutes: number;
  date: number; // timestamp
}

// Default subjects
export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'physics', name: 'Physics', color: 'study-physics' },
  { id: 'chemistry', name: 'Chemistry', color: 'study-chemistry' },
  { id: 'biology', name: 'Biology', color: 'study-biology' },
  { id: 'math', name: 'Math', color: 'study-math' },
];

// Local Storage Keys
const SUBJECTS_KEY = 'study-tracker-subjects';
const GOALS_KEY = 'study-tracker-goals';
const SESSIONS_KEY = 'study-tracker-sessions';
const TOTAL_STUDY_TIME_KEY = 'study-tracker-total-time';
const STREAK_KEY = 'study-tracker-streak';
const LAST_STUDY_DAY_KEY = 'study-tracker-last-day';

// Initialize subjects if not exists
export const initializeSubjects = (): Subject[] => {
  const savedSubjects = localStorage.getItem(SUBJECTS_KEY);
  if (!savedSubjects) {
    saveSubjects(DEFAULT_SUBJECTS);
    return DEFAULT_SUBJECTS;
  }
  return JSON.parse(savedSubjects);
};

// Get/Save Subjects
export const getSubjects = (): Subject[] => {
  const subjects = localStorage.getItem(SUBJECTS_KEY);
  return subjects ? JSON.parse(subjects) : initializeSubjects();
};

export const saveSubjects = (subjects: Subject[]): void => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

export const addSubject = (subject: Omit<Subject, 'id'>): Subject => {
  const newSubject = {
    ...subject,
    id: generateSubjectId(subject.name),
  };
  
  const subjects = getSubjects();
  saveSubjects([...subjects, newSubject]);
  return newSubject;
};

// Generate a clean subject ID from name
const generateSubjectId = (name: string): string => {
  // Create a clean, URL-friendly ID from the subject name
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with dashes
    .replace(/-+/g, '-')        // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '')      // Remove leading/trailing dashes
    .substring(0, 30)           // Limit length
    + '-' + Date.now().toString().slice(-4); // Add timestamp suffix for uniqueness
};

// Update an existing subject
export const updateSubject = (subject: Subject): Subject => {
  const subjects = getSubjects();
  const updatedSubjects = subjects.map(s => 
    s.id === subject.id ? subject : s
  );
  
  saveSubjects(updatedSubjects);
  return subject;
};

// Get/Save Goals
export const getGoals = (): StudyGoal[] => {
  const goals = localStorage.getItem(GOALS_KEY);
  return goals ? JSON.parse(goals) : [];
};

export const saveGoals = (goals: StudyGoal[]): void => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const addGoal = (goal: Omit<StudyGoal, 'id' | 'createdAt' | 'completedMinutes'>): StudyGoal => {
  const newGoal = {
    ...goal,
    id: Date.now().toString(),
    createdAt: Date.now(),
    completedMinutes: 0,
  };
  
  const goals = getGoals();
  saveGoals([...goals, newGoal]);
  return newGoal;
};

export const updateGoalProgress = (goalId: string, additionalMinutes: number): void => {
  const goals = getGoals();
  const updatedGoals = goals.map(goal => {
    if (goal.id === goalId) {
      return {
        ...goal,
        completedMinutes: goal.completedMinutes + additionalMinutes,
      };
    }
    return goal;
  });
  
  saveGoals(updatedGoals);
};

// Get/Save Sessions
export const getSessions = (): StudySession[] => {
  const sessions = localStorage.getItem(SESSIONS_KEY);
  return sessions ? JSON.parse(sessions) : [];
};

export const saveSessions = (sessions: StudySession[]): void => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const addSession = (subjectId: string, durationMinutes: number): StudySession => {
  // Ensure we're only recording non-zero sessions
  if (durationMinutes <= 0) {
    throw new Error("Cannot add a session with zero or negative duration");
  }

  const newSession = {
    id: Date.now().toString(),
    subjectId,
    durationMinutes,
    date: Date.now(),
  };
  
  const sessions = getSessions();
  saveSessions([...sessions, newSession]);
  
  // Update total study time
  updateTotalStudyTime(durationMinutes);
  
  // Update streak
  updateStreak();
  
  // Update goals for this subject
  updateGoalsForSubject(subjectId, durationMinutes);
  
  return newSession;
};

// Total study time tracking
export const getTotalStudyTime = (): number => {
  const time = localStorage.getItem(TOTAL_STUDY_TIME_KEY);
  return time ? parseInt(time, 10) : 0;
};

export const updateTotalStudyTime = (additionalMinutes: number): void => {
  if (additionalMinutes <= 0) return; // Don't update for non-positive values
  
  const currentTotal = getTotalStudyTime();
  localStorage.setItem(TOTAL_STUDY_TIME_KEY, (currentTotal + additionalMinutes).toString());
};

// Streak handling
export const getStreak = (): number => {
  const streak = localStorage.getItem(STREAK_KEY);
  return streak ? parseInt(streak, 10) : 0;
};

export const updateStreak = (): void => {
  const today = new Date().toLocaleDateString();
  const lastStudyDay = localStorage.getItem(LAST_STUDY_DAY_KEY);
  
  if (lastStudyDay === today) {
    // Already studied today, nothing to update
    return;
  }
  
  // Check if the last study day was yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toLocaleDateString();
  
  let streak = getStreak();
  
  if (lastStudyDay === yesterdayString) {
    // Continuing the streak
    streak += 1;
  } else if (lastStudyDay !== today) {
    // Streak broken, start new one
    streak = 1;
  }
  
  localStorage.setItem(STREAK_KEY, streak.toString());
  localStorage.setItem(LAST_STUDY_DAY_KEY, today);
};

// Update goals for a subject after completing a session
const updateGoalsForSubject = (subjectId: string, durationMinutes: number): void => {
  if (durationMinutes <= 0) return; // Don't update for non-positive values
  
  const goals = getGoals();
  let updated = false;
  
  const updatedGoals = goals.map(goal => {
    if (goal.subjectId === subjectId) {
      updated = true;
      return {
        ...goal,
        completedMinutes: goal.completedMinutes + durationMinutes,
      };
    }
    return goal;
  });
  
  if (updated) {
    saveGoals(updatedGoals);
  }
};

// Get sessions statistics for a time period
export const getSessionStats = (
  days: number = 7,
  subjectId?: string
): { totalMinutes: number; sessionsCount: number } => {
  const sessions = getSessions();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const filteredSessions = sessions.filter(session => {
    if (subjectId && session.subjectId !== subjectId) return false;
    return new Date(session.date) >= startDate;
  });
  
  const totalMinutes = filteredSessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0
  );
  
  return {
    totalMinutes,
    sessionsCount: filteredSessions.length,
  };
};

// Get subject by ID
export const getSubjectById = (id: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find(subject => subject.id === id);
};

// Delete a subject (this will also delete related goals)
export const deleteSubject = (subjectId: string): void => {
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  saveSubjects(subjects);
  
  // Delete goals for this subject
  const goals = getGoals().filter(g => g.subjectId !== subjectId);
  saveGoals(goals);
};

// Delete a goal
export const deleteGoal = (goalId: string): void => {
  const goals = getGoals().filter(g => g.id !== goalId);
  saveGoals(goals);
};

// Get all study time for a specific subject
export const getSubjectTotalTime = (subjectId: string): number => {
  const sessions = getSessions();
  return sessions
    .filter(session => session.subjectId === subjectId)
    .reduce((total, session) => total + session.durationMinutes, 0);
};
