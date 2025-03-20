
/**
 * Formats time in seconds to MM:SS format
 */
export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats time in seconds to HH:MM:SS format
 */
export const formatTimeHours = (timeInSeconds: number): string => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get progress percentage for timer
 */
export const getProgressPercentage = (
  timeInSeconds: number,
  totalTimeInSeconds: number
): number => {
  return Math.min(100, (timeInSeconds / totalTimeInSeconds) * 100);
};

/**
 * Calculate stroke dash offset for circular progress
 */
export const calculateStrokeDashOffset = (
  percentage: number,
  circumference: number
): number => {
  return circumference - (percentage / 100) * circumference;
};
