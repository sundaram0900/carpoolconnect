
import { useState, useEffect } from "react";
import { Ride } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import RideDetailsModalTabs from "./RideDetailsModalTabs";
import { databaseService } from "@/lib/services/database";
import { useBookRide } from "@/hooks/useBookRide";

interface RideDetailsModalProps {
  ride: Ride;
  isOpenByDefault?: boolean;
  onRideUpdate?: (updatedRide: Ride) => void;
}

const RideDetailsModal = ({ 
  ride: initialRide, 
  isOpenByDefault = false,
  onRideUpdate
}: RideDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  const [ride, setRide] = useState<Ride>(initialRide);
  const { bookRide } = useBookRide(ride.id);
  
  useEffect(() => {
    setRide(initialRide);
  }, [initialRide]);
  
  const handleBookingSuccess = async () => {
    // Refresh the ride data to get updated seat count
    try {
      if (ride.id) {
        const updatedRide = await databaseService.fetchRideById(ride.id);
        if (updatedRide) {
          setRide(updatedRide);
          if (onRideUpdate) {
            onRideUpdate(updatedRide);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing ride data:", error);
    }
  };
  
  const handleRideUpdate = (updatedRide: Ride) => {
    setRide(updatedRide);
    if (onRideUpdate) {
      onRideUpdate(updatedRide);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Ride Details</DialogTitle>
          <Tabs defaultValue="details" className="w-full">
            <RideDetailsModalTabs 
              ride={ride} 
              onBookClick={bookRide} 
              onBookingSuccess={handleBookingSuccess}
              onRideUpdate={handleRideUpdate}
              defaultTab="details"
            />
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RideDetailsModal;
