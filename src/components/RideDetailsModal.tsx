
import { useState, useEffect, useCallback } from "react";
import { Ride } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import RideDetailsModalTabs from "./RideDetailsModalTabs";
import BookRideModal from "./BookRideModal";
import { useBookRide } from "@/hooks/useBookRide";

interface RideDetailsModalProps {
  ride: Ride;
  isOpen?: boolean;
  isOpenByDefault?: boolean;
  onClose?: () => void;
  onRideUpdate?: (updatedRide: Ride) => void;
  trigger?: React.ReactNode;
}

const RideDetailsModal = ({ 
  ride, 
  isOpen: externalIsOpen, 
  isOpenByDefault = false,
  onClose: externalOnClose,
  onRideUpdate,
  trigger
}: RideDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen !== undefined ? externalIsOpen : isOpenByDefault);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const navigate = useNavigate();
  const { bookRide, isBooking } = useBookRide(ride.id);
  
  // Open/close the modal based on external props
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  }, [externalOnClose]);
  
  const handleBookClick = () => {
    console.log("Book button clicked");
    setIsBookModalOpen(true);
  };
  
  const handleBookModalClose = () => {
    setIsBookModalOpen(false);
  };
  
  const handleBookRide = async (formData: any) => {
    console.log("Attempting to book ride with form data:", formData);
    const result = await bookRide(formData);
    
    if (result.success) {
      console.log("Booking successful:", result);
      setIsBookModalOpen(false);
      
      // Only redirect if not already on the ride details page
      if (!isOpenByDefault) {
        // Pass booking information to the ride details page
        navigate(`/ride/${ride.id}?booking_success=true&booking_id=${result.bookingId || ''}`, {replace: true});
        handleClose();
      } else if (onRideUpdate && result.updatedRide) {
        // If we're already on the ride details page, update the ride data
        onRideUpdate(result.updatedRide);
      }
    } else {
      console.error("Booking failed:", result);
    }
    
    return result;
  };
  
  const handleRideUpdate = (updatedRide: Ride) => {
    if (onRideUpdate) {
      onRideUpdate(updatedRide);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>View details about this ride</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <RideDetailsModalTabs 
              ride={ride} 
              onBookClick={handleBookClick}
              onRideUpdate={handleRideUpdate}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <BookRideModal
        ride={ride}
        isOpen={isBookModalOpen}
        onClose={handleBookModalClose}
        onBook={handleBookRide}
      />
    </>
  );
};

export default RideDetailsModal;
