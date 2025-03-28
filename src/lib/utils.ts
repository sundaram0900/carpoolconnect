import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Ride, User, BookingFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatTime, formatPrice, calculateDistance, calculateDuration } from "./utils/formatUtils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatDate, formatTime, formatPrice, calculateDistance, calculateDuration };

export const getAvatarUrl = (user?: User): string => {
  if (!user || !user.avatar) {
    return "/placeholder.svg";
  }
  
  // If it's already a full URL
  if (user.avatar.startsWith('http')) {
    return user.avatar;
  }
  
  // If it's a Supabase storage path
  if (user.avatar.startsWith('avatars/')) {
    return `${supabase.storageUrl}/avatars/${user.avatar}`;
  }
  
  return user.avatar;
};

export async function fetchRides(): Promise<Ride[]> {
  try {
    // Assuming you have a Supabase client set up
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id(*)
      `);
    
    if (error) {
      console.error("Error fetching rides:", error);
      return [];
    }
    
    return data.map(ride => ({
      id: ride.id,
      driver: ride.driver,
      startLocation: {
        address: ride.start_address,
        city: ride.start_city,
        state: ride.start_state,
        country: ride.start_country,
        lat: ride.start_lat,
        lng: ride.start_lng
      },
      endLocation: {
        address: ride.end_address,
        city: ride.end_city,
        state: ride.end_state,
        country: ride.end_country,
        lat: ride.end_lat,
        lng: ride.end_lng
      },
      date: ride.date,
      time: ride.time,
      availableSeats: ride.available_seats,
      price: ride.price,
      status: ride.status,
      passengers: [],
      description: ride.description,
      carInfo: {
        make: ride.car_make,
        model: ride.car_model,
        year: ride.car_year,
        color: ride.car_color,
        licensePlate: ride.car_license_plate
      },
      createdAt: ride.created_at
    }));
  } catch (error) {
    console.error("Unexpected error fetching rides:", error);
    return [];
  }
}

export async function bookRide(rideId: string, userId: string, seats: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        { ride_id: rideId, user_id: userId, seats: seats },
      ]);

    if (error) {
      console.error("Error booking ride:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error booking ride:", error);
    return false;
  }
}

export const fetchRidesByStatus = async (status: string): Promise<Ride[]> => {
  try {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id(*)
      `)
      .eq('status', status);

    if (error) {
      console.error("Error fetching rides by status:", error);
      return [];
    }

    return data.map(ride => ({
      id: ride.id,
      driver: ride.driver,
      startLocation: {
        address: ride.start_address,
        city: ride.start_city,
        state: ride.start_state,
        country: ride.start_country,
        lat: ride.start_lat,
        lng: ride.start_lng
      },
      endLocation: {
        address: ride.end_address,
        city: ride.end_city,
        state: ride.end_state,
        country: ride.end_country,
        lat: ride.end_lat,
        lng: ride.end_lng
      },
      date: ride.date,
      time: ride.time,
      availableSeats: ride.available_seats,
      price: ride.price,
      status: ride.status,
      passengers: [],
      description: ride.description,
      carInfo: {
        make: ride.car_make,
        model: ride.car_model,
        year: ride.car_year,
        color: ride.car_color,
        licensePlate: ride.car_license_plate
      },
      createdAt: ride.created_at
    }));
  } catch (error) {
    console.error("Unexpected error fetching rides by status:", error);
    return [];
  }
};
