
import { supabase } from "@/integrations/supabase/client";
import { User, Ride, RideRequest, Review, BookingFormData } from "@/lib/types";

export const databaseService = {
  async getUserRides(userId: string) {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user rides:", error);
      throw error;
    }
    
    return data;
  },
  
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rides:ride_id (
          *,
          driver:driver_id (
            id, name, email, avatar, phone, rating, review_count, verified_driver
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
    
    return data;
  },
  
  async getUserRequests(userId: string) {
    const { data, error } = await supabase
      .from('ride_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user requests:", error);
      throw error;
    }
    
    return data;
  },
  
  async getDriverReviews(driverId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        author:author_id (
          id, name, email, avatar
        ),
        ride:ride_id (
          id, start_city, end_city
        )
      `)
      .eq('recipient_id', driverId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching driver reviews:", error);
      throw error;
    }
    
    return data;
  },
  
  async searchRides(startCity: string, endCity: string, date: string) {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id (
          id, name, email, avatar, phone, rating, review_count, verified_driver
        )
      `)
      .ilike('start_city', `%${startCity}%`)
      .ilike('end_city', `%${endCity}%`)
      .eq('date', date)
      .gt('available_seats', 0)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error searching rides:", error);
      throw error;
    }
    
    return data;
  },
  
  async getRideById(rideId: string) {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id (
          id, name, email, avatar, phone, rating, review_count, verified_driver, bio, username
        )
      `)
      .eq('id', rideId)
      .single();
    
    if (error) {
      console.error("Error fetching ride:", error);
      throw error;
    }
    
    return data;
  },
  
  async bookRide(rideId: string, userId: string, formData: BookingFormData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ride_id: rideId,
        user_id: userId,
        seats: formData.seats,
        contact_phone: formData.contactPhone,
        notes: formData.notes || null,
        payment_method: formData.paymentMethod
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error booking ride:", error);
      throw error;
    }
    
    return data;
  },
  
  async updateNotificationPreferences(userId: string, preferences: any) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        email_notifications: preferences.emailNotifications,
        push_notifications: preferences.pushNotifications,
        sms_notifications: preferences.smsNotifications,
        ride_reminders: preferences.rideReminders,
        marketing_emails: preferences.marketingEmails,
        new_ride_alerts: preferences.newRideAlerts
      })
      .select();
    
    if (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
    
    return data;
  },
  
  async getReceipts(userId: string) {
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        booking:booking_id (
          *,
          ride:ride_id (
            id, start_city, end_city, date, time
          )
        )
      `)
      .in('booking_id', (sb) => 
        sb.from('bookings')
          .select('id')
          .eq('user_id', userId)
      )
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching receipts:", error);
      throw error;
    }
    
    return data;
  }
};
