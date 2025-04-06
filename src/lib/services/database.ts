
import { userService } from "./userService";
import { bookingService } from "./bookingService";
import { rideRequestService } from "./rideRequestService";
import { rideCreateService } from "./rideCreateService";

export const databaseService = {
  // User related functions
  updateUserProfile: userService.updateUserProfile,
  uploadProfilePicture: userService.uploadProfilePicture,
  
  // Booking related functions
  fetchUserBookings: bookingService.fetchUserBookings,
  fetchUserReceipts: bookingService.fetchUserReceipts,
  downloadReceipt: bookingService.downloadReceipt,
  checkExistingBooking: bookingService.checkExistingBooking,
  isUserDriverOfRide: bookingService.isUserDriverOfRide,
  bookRide: bookingService.bookRide,
  fetchRideBookings: bookingService.fetchRideBookings,
  cancelBooking: bookingService.cancelBooking,
  
  // Ride request related functions
  fetchUserRideRequests: rideRequestService.fetchUserRideRequests,
  createRideRequest: rideRequestService.createRideRequest,
  
  // Ride creation related functions
  fetchRideById: rideCreateService.fetchRideById,
  fetchUserRides: rideCreateService.fetchUserRides,
  createRide: rideCreateService.createRide,
};

export default databaseService;
