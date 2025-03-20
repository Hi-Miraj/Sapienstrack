
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

interface FocusControlsProps {
  onViewStats: () => void;
}

const FocusControls: React.FC<FocusControlsProps> = ({ onViewStats }) => {
  const [focusMode, setFocusMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    
    // Apply focus mode changes
    if (!focusMode) {
      // Enter focus mode
      document.body.classList.add('focus-mode');
      toast.success('Focus mode enabled. Stay productive!');
    } else {
      // Exit focus mode
      document.body.classList.remove('focus-mode');
      toast.success('Focus mode disabled.');
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    
    if (notificationsEnabled) {
      toast.success('Notifications disabled');
    } else {
      toast.success('Notifications enabled');
      
      // Request notification permission if needed
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div className="flex space-x-2 w-full">
      <Button
        onClick={toggleFocusMode}
        className={`flex-1 h-12 space-x-2 justify-center items-center ${
          focusMode 
            ? 'bg-study-blue hover:bg-study-blue/90' 
            : 'bg-white/5 hover:bg-white/10 border border-white/10'
        }`}
      >
        <Lightbulb size={18} />
        <span>Focus Mode</span>
      </Button>
      
      <Button
        onClick={onViewStats}
        className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10 space-x-2 justify-center items-center"
      >
        <BarChart size={18} />
        <span>Statistics</span>
      </Button>
      
      <Button
        onClick={toggleNotifications}
        className="w-12 h-12 p-0 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
      >
        {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
      </Button>
    </div>
  );
};

export default FocusControls;
