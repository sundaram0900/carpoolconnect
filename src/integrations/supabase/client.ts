
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { RideStatus } from '@/lib/types';

const SUPABASE_URL = "https://fhirnenctfmnykafxypy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoaXJuZW5jdGZtbnlrYWZ4eXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTg4MDksImV4cCI6MjA1ODQ5NDgwOX0.iIRCLJFS6mNFgfjSxQaTlS-xeYXin725gSBDqNT6FfQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add helper functions to convert between database and application types
export const mapDbProfileToUser = (profile: any) => {
  if (!profile) return null;
  
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    phone: profile.phone,
    rating: profile.rating,
    reviewCount: profile.review_count,
    verifiedDriver: profile.verified_driver,
    username: profile.username,
    bio: profile.bio,
    address: profile.address,
    city: profile.city,
    zipCode: profile.zip_code,
    createdAt: profile.created_at
  };
};

export const mapDbRideToRide = (ride: any, includeDriver = true) => {
  if (!ride) return null;
  
  // Ensure status is a valid RideStatus
  let status: RideStatus = 'scheduled';
  
  if (ride.status === 'scheduled' || 
      ride.status === 'in-progress' || 
      ride.status === 'completed' || 
      ride.status === 'cancelled' ||
      ride.status === 'booked') {
    status = ride.status as RideStatus;
  }
  
  const mapped = {
    id: ride.id,
    driver: includeDriver && ride.driver ? mapDbProfileToUser(ride.driver) : undefined,
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
    status: status,
    description: ride.description,
    createdAt: ride.created_at,
    carInfo: {
      make: ride.car_make,
      model: ride.car_model,
      year: ride.car_year,
      color: ride.car_color,
      licensePlate: ride.car_license_plate
    },
    bookedBy: ride.booked_by
  };
  
  return mapped;
};
