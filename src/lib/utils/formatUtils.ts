
// Utility functions for formatting various data types

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return 'N/A';
  
  // Check if the time is in HH:MM:SS format or just a time object
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return timeString;
};

export const formatPrice = (price: number): string => {
  if (price === undefined || price === null) return 'N/A';
  
  return price.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
};

export const calculateDistance = (startLocation: any, endLocation: any): number => {
  // Simplified implementation for demo purposes
  // In a real app, we would use Google Maps API or similar
  if (!startLocation?.lat || !startLocation?.lng || !endLocation?.lat || !endLocation?.lng) {
    return 20; // Default distance in km
  }
  
  // Simple distance calculation using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (endLocation.lat - startLocation.lat) * Math.PI / 180;
  const dLon = (endLocation.lng - startLocation.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(startLocation.lat * Math.PI / 180) * Math.cos(endLocation.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  
  return Math.round(distance);
};

export const calculateDuration = (distance: number): number => {
  // Simplified implementation - assuming average speed of 40 km/h
  if (!distance) return 45; // Default duration in minutes
  
  const durationInHours = distance / 40;
  return Math.round(durationInHours * 60);
};
