
import { Ride, BookingFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import DriverDetails from "../DriverDetails";

interface TabDriverProps {
  ride: Ride;
  isPassenger: boolean;
  onBookClick: (formData: BookingFormData) => Promise<{ success: boolean; bookingId?: string }>;
  onOpenCancelDialog: () => void;
}

export const TabDriver = ({ 
  ride, 
  isPassenger,
  onBookClick,
  onOpenCancelDialog
}: TabDriverProps) => {
  const canBookRide = !isPassenger && ride.status === 'scheduled' && ride.availableSeats > 0;
  const canCancelBooking = isPassenger && ride.status === 'scheduled';
  
  const handleBookRide = () => {
    // Open booking modal - This would be better handled by lifting this state up
    // and passing down a callback, but for now we'll duplicate the BookRideModal in TabDetails
    // to avoid too much refactoring
    window.dispatchEvent(new CustomEvent('open-book-modal'));
  };

  return (
    <>
      <DriverDetails driver={ride.driver} ride={ride} />
            
      <div className="mt-6">
        {canBookRide && (
          <Button className="w-full" onClick={handleBookRide}>
            Book This Ride
          </Button>
        )}
        
        {isPassenger && canCancelBooking && (
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={onOpenCancelDialog}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel My Booking
          </Button>
        )}
      </div>
    </>
  );
};
