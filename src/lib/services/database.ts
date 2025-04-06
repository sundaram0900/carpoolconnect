import { userService } from "./userService";
import { bookingService } from "./bookingService";
import { rideRequestService } from "./rideRequestService";
import { rideCreateService } from "./rideCreateService";

export const databaseService = {
  // User related functions
  updateUserProfile: userService.updateUserProfile,
  uploadProfilePicture: userService.uploadProfilePicture,
  
  // Proxy booking functions to bookingService
  bookRide: bookingService.bookRide,
  cancelBooking: bookingService.cancelBooking,
  checkExistingBooking: bookingService.checkExistingBooking,
  fetchRideBookings: bookingService.fetchRideBookings,
  fetchUserBookings: bookingService.fetchUserBookings,
  fetchUserReceipts: bookingService.fetchUserReceipts,
  downloadReceipt: bookingService.downloadReceipt,
  
  // Ride request related functions
  fetchUserRideRequests: rideRequestService.fetchUserRideRequests,
  createRideRequest: rideRequestService.createRideRequest,
  
  // Ride creation related functions
  fetchRideById: rideCreateService.fetchRideById,
  fetchUserRides: rideCreateService.fetchUserRides,
  createRide: rideCreateService.createRide,
};

export default databaseService;
