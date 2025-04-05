
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RideCard from "@/components/RideCard";
import RideDetailsModal from "@/components/RideDetailsModal";
import { Ride } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { Car } from "lucide-react";

interface RideCardWrapperProps {
  ride: Ride;
}

const RideCardWrapper = ({ ride }: RideCardWrapperProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  // Check if user is the driver or if they've already booked this ride
  const isDriver = user?.id === ride.driver.id;
  const isPassenger = Array.isArray(ride.bookedBy) && ride.bookedBy?.includes(user?.id || "");
  const canBookRide = !isDriver && !isPassenger && ride.status === 'scheduled' && ride.availableSeats > 0;
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <RideCard ride={ride} />
      <div className="mt-2 p-3 flex justify-end border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsModalOpen(true)}
          className="gap-1"
        >
          {canBookRide ? (
            <>
              <Car className="h-4 w-4" />
              View & Book
            </>
          ) : (
            "View Details"
          )}
        </Button>
      </div>
      <RideDetailsModal 
        ride={ride} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default RideCardWrapper;
