// Time utility functions
export const TimeUtils = {
  // Get current time in HH:MM:SS format
  getCurrentTimeFormatted: () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  },

  // Format time from Date object to HH:MM:SS
  formatTimeToHHMMSS: (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  },

  // Get current timestamp
  getCurrentTimestamp: () => {
    return new Date().getTime();
  }
};

export default TimeUtils;
