
import RideBookingsList from "../RideBookingsList";

interface TabBookingsProps {
  rideId: string;
  onBookingChange?: () => void;
}

export const TabBookings = ({ rideId, onBookingChange }: TabBookingsProps) => {
  return <RideBookingsList rideId={rideId} onBookingChange={onBookingChange} />;
};
