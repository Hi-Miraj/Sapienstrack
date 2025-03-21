
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface FloatingEditButtonProps {
  onClick: () => void;
  label?: string;
}

const FloatingEditButton: React.FC<FloatingEditButtonProps> = ({ onClick, label = "Add New" }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-study-blue text-white rounded-full p-4 flex items-center 
        shadow-lg hover:bg-study-blue/90 transition-all animate-fade-in z-20"
    >
      <PlusCircle size={20} className="mr-2" />
      <span>{label}</span>
    </button>
  );
};

export default FloatingEditButton;
