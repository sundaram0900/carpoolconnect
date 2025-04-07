
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCcw, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelBooking?: (bookingId: string) => Promise<boolean>;
  userId: string;
  rideId: string;
  onSuccess?: () => Promise<void>;
  refreshRideData: () => void;
}

export const CancelBookingDialog = ({
  isOpen,
  onOpenChange,
  onCancelBooking,
  userId,
  rideId,
  onSuccess,
  refreshRideData
}: CancelBookingDialogProps) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = async () => {
    if (!userId) return;
    
    setIsCancelling(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('ride_id', rideId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error finding booking:", error);
        toast.error("Could not find your booking");
        setIsCancelling(false);
        onOpenChange(false);
        return;
      }
      
      if (bookings && onCancelBooking) {
        const success = await onCancelBooking(bookings.id);
        if (success) {
          toast.success("Your booking has been cancelled");
          refreshRideData();
          onOpenChange(false);
          if (onSuccess) {
            await onSuccess();
          }
        } else {
          toast.error("Failed to cancel booking");
        }
      } else {
        toast.error("Booking not found");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Error cancelling booking");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Your Booking</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your booking for this ride? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, Keep My Booking</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancelBooking} 
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Yes, Cancel My Booking
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
