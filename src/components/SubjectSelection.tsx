
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getSubjects, Subject } from '@/utils/storageUtils';
import AddSubjectModal from './AddSubjectModal';

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

  // Load subjects from storage on component mount
  useEffect(() => {
    setSubjects(getSubjects());
  }, []);

  // Update subjects list when a new subject is added
  const handleSubjectAdded = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    onSelectSubject(newSubject.id);
  };

  return (
    <div className="w-full">
      <h2 className="text-white/80 text-sm font-medium mb-3">Select Subject</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className={`subject-${subject.id} rounded-md py-4 px-2 focus-transition
              ${selectedSubject === subject.id ? 'ring-2 ring-study-blue' : ''}
            `}
          >
            <span className="text-white font-medium">{subject.name}</span>
          </button>
        ))}
        
        {/* Add subject button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-md py-4 px-2 border-2 border-dashed border-white/20 
            flex items-center justify-center space-x-2 text-white/60 hover:text-white 
            hover:border-white/30 focus-transition"
        >
          <Plus size={18} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Add subject modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubjectAdded={handleSubjectAdded}
      />
    </div>
  );
};

export default SubjectSelection;
