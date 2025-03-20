
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addGoal, getSubjects, Subject } from '@/utils/storageUtils';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onGoalAdded,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [targetHours, setTargetHours] = useState(5);
  const [isWeekly, setIsWeekly] = useState(true);

  // Load subjects on modal open
  useEffect(() => {
    if (isOpen) {
      const availableSubjects = getSubjects();
      setSubjects(availableSubjects);
      
      if (availableSubjects.length > 0 && !selectedSubject) {
        setSelectedSubject(availableSubjects[0].id);
      }
    }
  }, [isOpen, selectedSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || targetHours <= 0) return;
    
    // Add the new goal
    addGoal({
      subjectId: selectedSubject,
      targetHours,
      weeklyTarget: isWeekly,
    });
    
    // Notify parent component
    onGoalAdded();
    
    // Reset form
    setTargetHours(5);
    setIsWeekly(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">Add Study Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Subject selection */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">
              Subject
            </label>
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
            >
              <SelectTrigger className="bg-white/5 border-white/10 focus:ring-study-blue">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Target hours */}
          <div className="space-y-2">
            <label htmlFor="target-hours" className="text-sm text-white/70">
              Target Hours
            </label>
            <Input
              id="target-hours"
              type="number"
              min="1"
              max="100"
              value={targetHours}
              onChange={(e) => setTargetHours(parseInt(e.target.value) || 1)}
              className="bg-white/5 border-white/10 focus:border-study-blue focus:ring-study-blue"
            />
          </div>
          
          {/* Weekly toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-goal" className="text-sm text-white/70">
              Weekly Goal
            </Label>
            <Switch
              id="weekly-goal"
              checked={isWeekly}
              onCheckedChange={setIsWeekly}
              className="data-[state=checked]:bg-study-blue"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-study-blue hover:bg-study-blue/90"
              disabled={!selectedSubject || targetHours <= 0}
            >
              Add Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalModal;
