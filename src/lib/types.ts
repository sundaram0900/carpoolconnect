
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

export type Review = {
  id: string;
  author: User;
  recipient: User;
  rating: number;
  comment: string;
  rideId: string;
  createdAt: string;
};

export type RideStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type RequestStatus = 'open' | 'matched' | 'cancelled' | 'expired';
