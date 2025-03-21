import { v4 as uuidv4 } from 'uuid';

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface StudyGoal {
  id: string;
  subjectId: string;
  targetHours: number;
  completedMinutes: number;
  weeklyTarget: boolean;
  createdAt: number;
}

// Subjects
export const getSubjects = (): Subject[] => {
  const subjects = localStorage.getItem('subjects');
  return subjects ? JSON.parse(subjects) : [];
};

export const getSubjectById = (id: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find(subject => subject.id === id);
};

export const addSubject = (subject: Omit<Subject, 'id'>): Subject => {
  const newSubject: Subject = { ...subject, id: uuidv4() };
  const subjects = getSubjects();
  localStorage.setItem('subjects', JSON.stringify([...subjects, newSubject]));
  return newSubject;
};

export const updateSubject = (updatedSubject: Subject): void => {
  const subjects = getSubjects();
  const updatedSubjects = subjects.map(subject => 
    subject.id === updatedSubject.id ? updatedSubject : subject
  );
  localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
};

export const deleteSubject = (id: string): void => {
  const subjects = getSubjects();
  const updatedSubjects = subjects.filter(subject => subject.id !== id);
  localStorage.setItem('subjects', JSON.stringify(updatedSubjects));

  // Also remove any goals associated with this subject
  const goals = getGoals();
  const updatedGoals = goals.filter(goal => goal.subjectId !== id);
  localStorage.setItem('studyGoals', JSON.stringify(updatedGoals));
};

// Study Goals
export const getGoals = (): StudyGoal[] => {
  const goals = localStorage.getItem('studyGoals');
  return goals ? JSON.parse(goals) : [];
};

export const addGoal = (goal: Omit<StudyGoal, 'id' | 'completedMinutes' | 'createdAt'>): StudyGoal => {
  const newGoal: StudyGoal = { 
    ...goal, 
    id: uuidv4(), 
    completedMinutes: 0,
    createdAt: Date.now(),
  };
  const goals = getGoals();
  localStorage.setItem('studyGoals', JSON.stringify([...goals, newGoal]));
  return newGoal;
};

export const updateGoalMinutes = (goalId: string, minutes: number): void => {
  const goals = getGoals();
  const updatedGoals = goals.map(goal => {
    if (goal.id === goalId) {
      return { ...goal, completedMinutes: goal.completedMinutes + minutes };
    }
    return goal;
  });
  localStorage.setItem('studyGoals', JSON.stringify(updatedGoals));
};

// Streak
export const getStreak = (): number => {
    const streak = localStorage.getItem('streak');
    return streak ? parseInt(streak) : 0;
};

export const incrementStreak = (): void => {
    const streak = getStreak();
    localStorage.setItem('streak', JSON.stringify(streak + 1));
};

export const resetStreak = (): void => {
    localStorage.setItem('streak', JSON.stringify(0));
};

// Total Study Time
export const getTotalStudyTime = (): number => {
  const totalStudyTime = localStorage.getItem('totalStudyTime');
  return totalStudyTime ? parseInt(totalStudyTime) : 0;
};

export const addStudyTime = (minutes: number): void => {
  const currentTotal = getTotalStudyTime();
  localStorage.setItem('totalStudyTime', JSON.stringify(currentTotal + minutes));
};

// Last Study Date
export const getLastStudyDate = (): number | null => {
  const lastStudyDate = localStorage.getItem('lastStudyDate');
  return lastStudyDate ? parseInt(lastStudyDate) : null;
};

export const setLastStudyDate = (date: number): void => {
  localStorage.setItem('lastStudyDate', JSON.stringify(date));
};

// Update Goal
export const updateGoal = (updatedGoal: StudyGoal): void => {
  const goals = getGoals();
  const updatedGoals = goals.map(goal => 
    goal.id === updatedGoal.id ? updatedGoal : goal
  );
  
  localStorage.setItem('studyGoals', JSON.stringify(updatedGoals));
};

// Delete Goal
export const deleteGoal = (goalId: string): void => {
  const goals = getGoals();
  const remainingGoals = goals.filter(goal => goal.id !== goalId);
  
  localStorage.setItem('studyGoals', JSON.stringify(remainingGoals));
};
