
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addSubject, Subject, updateSubject } from '@/utils/storageUtils';
import { Check, X } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectAdded: (subject: Subject) => void;
  onSubjectUpdated?: (subject: Subject) => void;
  editSubject: Subject | null;
}

const COLORS = [
  { id: 'physics', name: 'Blue', class: 'study-physics' },
  { id: 'chemistry', name: 'Green', class: 'study-chemistry' },
  { id: 'biology', name: 'Brown', class: 'study-biology' },
  { id: 'math', name: 'Purple', class: 'study-math' },
  { id: 'literature', name: 'Orange', class: 'study-literature' },
  { id: 'history', name: 'Red', class: 'study-history' },
  { id: 'geography', name: 'Teal', class: 'study-geography' },
  { id: 'art', name: 'Pink', class: 'study-art' },
  { id: 'music', name: 'Yellow', class: 'study-music' },
  { id: 'coding', name: 'Cyan', class: 'study-coding' },
];

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onSubjectAdded,
  onSubjectUpdated,
  editSubject,
}) => {
  const [subjectName, setSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].class);
  const isEditing = !!editSubject;

  // Set initial values when editing
  useEffect(() => {
    if (editSubject) {
      setSubjectName(editSubject.name);
      setSelectedColor(editSubject.color);
    } else {
      // Reset to defaults for new subjects
      setSubjectName('');
      setSelectedColor(COLORS[0].class);
    }
  }, [editSubject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectName.trim()) return;
    
    if (isEditing && editSubject) {
      // Update existing subject
      const updatedSubject = updateSubject({
        id: editSubject.id,
        name: subjectName.trim(),
        color: selectedColor,
      });
      
      if (onSubjectUpdated) {
        onSubjectUpdated(updatedSubject);
      }
    } else {
      // Add new subject
      const newSubject = addSubject({
        name: subjectName.trim(),
        color: selectedColor,
      });
      
      onSubjectAdded(newSubject);
    }
    
    // Reset form
    setSubjectName('');
    setSelectedColor(COLORS[0].class);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">
            {isEditing ? 'Edit Subject' : 'Add New Subject'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="subject-name" className="text-sm text-white/70">
              Subject Name
            </label>
            <Input
              id="subject-name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Mathematics, History, etc."
              className="bg-white/5 border-white/10 focus:border-study-blue focus:ring-study-blue"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-white/70">Subject Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.class)}
                  className={`subject-${color.id} w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-200 ${
                      selectedColor === color.class ? 'ring-2 ring-white' : 'ring-1 ring-white/30'
                    }`}
                  title={color.name}
                >
                  {selectedColor === color.class && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
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
              disabled={!subjectName.trim()}
            >
              {isEditing ? 'Update Subject' : 'Add Subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectModal;
