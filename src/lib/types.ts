export type Ride = {
  id: string;
  driver: User;
  startLocation: Location;
  endLocation: Location;
  date: string;
  time: string;
  availableSeats: number;
  price: number;
  status: RideStatus;
  passengers?: User[];
  description?: string;
  carInfo?: CarInfo;
  createdAt: string;
  driverDetails?: DriverDetails;
  bookedBy?: string[];
};

export type RideRequest = {
  id: string;
  user: User;
  startLocation: Location;
  endLocation: Location;
  date: string;
  time: string;
  numberOfSeats: number;
  maxPrice?: number;
  status: RequestStatus;
  description?: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  verifiedDriver?: boolean;
  username?: string;
  bio?: string;
  notificationPreferences?: NotificationPreferences;
  address?: string;
  city?: string;
  zipCode?: string;
};

export type NotificationPreferences = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  rideReminders: boolean;
  marketingEmails: boolean;
  newRideAlerts: boolean;
};

export type Location = {
  address: string;
  city: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

export type CarInfo = {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate?: string;
};

export type DriverDetails = {
  experience: string;
  languages: string[];
  verificationStatus: string;
};

export type Review = {
  id: string;
  author: User;
  recipient: User;
  rating: number;
  comment: string;
  rideId: string;
  createdAt: string;
};

export type RideStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'booked';
export type RequestStatus = 'open' | 'matched' | 'cancelled' | 'expired';

export type BookingFormData = {
  seats: number;
  contactPhone: string;
  notes: string;
  paymentMethod?: string;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  rideId: string;
  content: string;
  timestamp: string;
  read: boolean;
};

export type OTP = {
  id: string;
  userId: string;
  rideId: string;
  code: string;
  expiresAt: string;
  verified: boolean;
};

export type Receipt = {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  createdAt: string;
  booking?: {
    ride: Ride;
    user: User;
  };
};
