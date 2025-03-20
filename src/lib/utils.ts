
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Ride, RideRequest, User, Location } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to "MMM D, YYYY" (e.g., "Apr 20, 2023")
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format time to "h:mm A" (e.g., "3:30 PM")
export function formatTime(timeString: string): string {
  return timeString;
}

// Calculate distance between two locations (mock implementation)
export function calculateDistance(start: Location, end: Location): number {
  // This would use a real geo-calculation in production
  return Math.floor(Math.random() * 50) + 5; // Random distance between 5-55 miles
}

// Calculate ride duration based on distance (mock implementation)
export function calculateDuration(distance: number): number {
  // Simple calculation: average speed of 50 mph
  return Math.ceil(distance / 50 * 60); // Duration in minutes
}

// Format price as currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Generate avatar URL or fallback to UI Avatars
export function getAvatarUrl(user: User): string {
  if (user.avatar) return user.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
}

// Format rating as X.X
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Mock function to fetch rides
export async function fetchRides(): Promise<Ride[]> {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate 10 mock rides
  return Array.from({ length: 10 }, (_, i) => ({
    id: `ride-${i + 1}`,
    driver: {
      id: `driver-${i + 1}`,
      name: `Driver ${i + 1}`,
      email: `driver${i + 1}@example.com`,
      avatar: i % 3 === 0 ? `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 1}.jpg` : undefined,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      verifiedDriver: i % 3 === 0
    },
    startLocation: {
      address: `${100 + i} Main St`,
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    endLocation: {
      address: `${200 + i} Oak Ave`,
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA'
    },
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    time: `${9 + (i % 8)}:${i % 2 === 0 ? '00' : '30'} ${i < 4 ? 'AM' : 'PM'}`,
    availableSeats: Math.floor(Math.random() * 3) + 1,
    price: (Math.floor(Math.random() * 10) + 1) * 10,
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
    carInfo: {
      make: ['Toyota', 'Honda', 'Tesla', 'Ford', 'BMW'][i % 5],
      model: ['Corolla', 'Civic', 'Model 3', 'Focus', '3 Series'][i % 5],
      year: 2018 + (i % 5),
      color: ['White', 'Black', 'Silver', 'Blue', 'Red'][i % 5]
    }
  }));
}

// Mock function to fetch ride requests
export async function fetchRideRequests(): Promise<RideRequest[]> {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate 5 mock ride requests
  return Array.from({ length: 5 }, (_, i) => ({
    id: `request-${i + 1}`,
    user: {
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatar: i % 2 === 0 ? `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg` : undefined,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 20) + 2
    },
    startLocation: {
      address: `${300 + i} Pine St`,
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    endLocation: {
      address: `${400 + i} Market St`,
      city: 'San Jose',
      state: 'CA',
      country: 'USA'
    },
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    time: `${8 + (i % 10)}:${i % 2 === 0 ? '00' : '30'} ${i < 3 ? 'AM' : 'PM'}`,
    numberOfSeats: Math.floor(Math.random() * 2) + 1,
    maxPrice: (Math.floor(Math.random() * 5) + 1) * 20,
    status: 'open' as const,
    createdAt: new Date().toISOString()
  }));
}
