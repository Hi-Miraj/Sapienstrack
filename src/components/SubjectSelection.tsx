
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getSubjects, Subject, deleteSubject } from '@/utils/storageUtils';
import AddSubjectModal from './AddSubjectModal';
import { toast } from 'sonner';

interface SubjectSelectionProps {
  selectedSubject: string | null;
  onSelectSubject: (subjectId: string) => void;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  selectedSubject,
  onSelectSubject,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Load subjects from storage on component mount
  useEffect(() => {
    setSubjects(getSubjects());
  }, []);

  // Update subjects list when a new subject is added
  const handleSubjectAdded = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    onSelectSubject(newSubject.id);
  };

  // Update subjects list when a subject is updated
  const handleSubjectUpdated = (updatedSubject: Subject) => {
    setSubjects((prev) => 
      prev.map((subject) => 
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    );
    // Make sure selected subject name is updated
    if (selectedSubject === updatedSubject.id) {
      // Force a re-selection to update UI
      onSelectSubject(updatedSubject.id);
    }
  };

  // Handle subject deletion
  const handleDeleteSubject = (subjectId: string) => {
    deleteSubject(subjectId);
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
    
    // If the deleted subject was selected, clear selection
    if (selectedSubject === subjectId) {
      onSelectSubject('');
    }
    
    toast.success("Subject deleted successfully");
  };

  return (
    <div className="w-full">
      <h2 className="text-white/80 text-sm font-medium mb-3">Select Subject</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <div 
            key={subject.id}
            className="relative group"
          >
            <button
              onClick={() => onSelectSubject(subject.id)}
              className={`subject-${subject.id} w-full rounded-md py-4 px-2 focus-transition
                ${subject.color ? subject.color : ''}
                ${selectedSubject === subject.id ? 'ring-2 ring-study-blue' : ''}
              `}
            >
              <span className="text-white font-medium">{subject.name}</span>
            </button>
            
            {/* Edit and delete controls that appear on hover */}
            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSubject(subject);
                  setIsAddModalOpen(true);
                }}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white focus-transition"
                title="Edit subject"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubject(subject.id);
                }}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white focus-transition"
                title="Delete subject"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add subject button */}
        <button
          onClick={() => {
            setEditingSubject(null);
            setIsAddModalOpen(true);
          }}
          className="rounded-md py-4 px-2 border-2 border-dashed border-white/20 
            flex items-center justify-center space-x-2 text-white/60 hover:text-white 
            hover:border-white/30 focus-transition"
        >
          <Plus size={18} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Add/Edit subject modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSubject(null);
        }}
        onSubjectAdded={handleSubjectAdded}
        onSubjectUpdated={handleSubjectUpdated}
        editSubject={editingSubject}
      />
    </div>
  );
};

export default SubjectSelection;
