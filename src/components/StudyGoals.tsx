
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Target, Plus, Pencil, Trash2 } from 'lucide-react';
import { getGoals, StudyGoal, getSubjectById, deleteGoal } from '@/utils/storageUtils';
import AddGoalModal from './AddGoalModal';
import { toast } from 'sonner';
import FloatingEditButton from './FloatingEditButton';

interface StudyGoalsProps {
  onRefreshNeeded: boolean;
  onRefreshComplete: () => void;
}

const StudyGoals: React.FC<StudyGoalsProps> = ({ 
  onRefreshNeeded, 
  onRefreshComplete 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // Load goals from storage
  useEffect(() => {
    const loadGoals = () => {
      const allGoals = getGoals();
      setGoals(allGoals);
      onRefreshComplete();
    };

    loadGoals();
  }, [onRefreshNeeded, onRefreshComplete]);

  // Show/hide floating button based on expansion state
  useEffect(() => {
    setShowFloatingButton(isExpanded);
  }, [isExpanded]);

  // Calculate progress percentage
  const calculateProgress = (goal: StudyGoal) => {
    const targetMinutes = goal.targetHours * 60;
    const percentage = Math.min(100, (goal.completedMinutes / targetMinutes) * 100);
    return percentage;
  };

  // Format time completed
  const formatCompletedTime = (minutes: number, targetHours: number) => {
    return `${(minutes / 60).toFixed(1)} hours`;
  };

  // Check if a goal is completed
  const isGoalCompleted = (goal: StudyGoal) => {
    return goal.completedMinutes >= goal.targetHours * 60;
  };

  // Handle goal added or updated
  const handleGoalAdded = () => {
    setGoals(getGoals());
  };

  // Handle goal deletion
  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast.success("Goal deleted successfully");
  };

  return (
    <div className="glass-card rounded-md overflow-hidden animate-fade-in relative">
      {/* Header */}
      <div 
        className="flex justify-between items-center px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Target size={18} className="text-white/70" />
          <span className="text-white font-medium">Study Goals</span>
        </div>
        <button className="text-white/70 hover:text-white">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Goals content */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-4">
          {goals.length === 0 ? (
            <div className="text-white/50 text-center py-3 text-sm">
              No goals yet. Add your first study goal.
            </div>
          ) : (
            goals.map((goal) => {
              const subject = getSubjectById(goal.subjectId);
              const progress = calculateProgress(goal);
              const isCompleted = isGoalCompleted(goal);
              
              return (
                <div key={goal.id} className="space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <div className="text-white">
                      {subject?.name || 'Unknown Subject'}
                      <span className="ml-2 text-sm text-white/60">
                        {goal.targetHours} hours {goal.weeklyTarget ? 'weekly' : 'total'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <span className="text-xs bg-study-completed text-white px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="text-white/70 text-sm">
                          {Math.round(progress)}%
                        </span>
                      )}
                      
                      {/* Edit and delete controls - Better placement and always visible */}
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGoal(goal);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white focus-transition"
                          title="Edit goal"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGoal(goal.id);
                          }}
                          className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white focus-transition"
                          title="Delete goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-white/60">
                    {formatCompletedTime(goal.completedMinutes, goal.targetHours)}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Add new goal button */}
          <button 
            onClick={() => {
              setEditingGoal(null);
              setIsAddModalOpen(true);
            }}
            className="w-full py-2 mt-2 rounded border border-dashed border-white/20 
              flex items-center justify-center space-x-2 text-white/60 hover:text-white 
              hover:border-white/30 focus-transition"
          >
            <Plus size={16} />
            <span>Add New Goal</span>
          </button>
        </div>
      )}

      {/* Floating add button for quick access */}
      {showFloatingButton && (
        <FloatingEditButton 
          onClick={() => {
            setEditingGoal(null);
            setIsAddModalOpen(true);
          }}
          label="Add Goal"
        />
      )}

      {/* Add/Edit goal modal */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGoal(null);
        }}
        onGoalAdded={handleGoalAdded}
        editGoal={editingGoal}
      />
    </div>
  );
};

export default StudyGoals;
