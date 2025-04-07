
import { userBookingsService } from "./userBookings";
import { bookingValidationService } from "./bookingValidation";
import { createBookingService } from "./createBooking";
import { rideBookingsService } from "./rideBookings";
import { cancelBookingService } from "./cancelBooking";

export const bookingService = {
  // User bookings related functions
  fetchUserBookings: userBookingsService.fetchUserBookings,
  fetchUserReceipts: userBookingsService.fetchUserReceipts,
  downloadReceipt: userBookingsService.downloadReceipt,
  
  // Booking validation related functions
  checkExistingBooking: bookingValidationService.checkExistingBooking,
  isUserDriverOfRide: bookingValidationService.isUserDriverOfRide,
  
  // Create booking related functions
  bookRide: createBookingService.bookRide,
  
  // Ride bookings related functions
  fetchRideBookings: rideBookingsService.fetchRideBookings,
  
  // Cancel booking related functions
  cancelBooking: cancelBookingService.cancelBooking
};
