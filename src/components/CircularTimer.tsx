
import React from 'react';
import { calculateStrokeDashOffset } from '@/utils/timerUtils';

interface CircularTimerProps {
  progress: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ 
  progress,
  color = '#3B82F6', // Default blue color
  size = 220,
  strokeWidth = 4
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = calculateStrokeDashOffset(progress, circumference);

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="circular-progress"
        />
      </svg>
    </div>
  );
};

export default CircularTimer;
