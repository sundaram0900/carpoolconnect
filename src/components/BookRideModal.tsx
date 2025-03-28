
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Ride, BookingFormData } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Loader2, CheckCircle, AlertCircle, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import PaymentOptions from "./PaymentOptions";
import { useAuth } from "@/lib/context/AuthContext";
import { databaseService } from "@/lib/services/database";

interface BookRideModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
  onBook: (formData: BookingFormData) => Promise<boolean>;
}

const BookRideModal = ({ ride, isOpen, onClose, onBook }: BookRideModalProps) => {
  const [seats, setSeats] = useState<string>("1");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState<boolean>(false);
  const { user } = useAuth();

  const totalPrice = parseInt(seats) * ride.price;
  const serviceFee = Math.round(totalPrice * 0.05); // 5% service fee
  const finalPrice = totalPrice + serviceFee;
  
  // Check if user has already booked this ride when the modal opens
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (user && ride.id && isOpen) {
        const hasBooking = await databaseService.checkExistingBooking(ride.id, user.id);
        setIsAlreadyBooked(hasBooking);
        
        if (hasBooking) {
          toast.info("You have already booked this ride");
        }
      }
    };
    
    checkExistingBooking();
  }, [user, ride.id, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to book a ride");
      return;
    }
    
    if (isAlreadyBooked) {
      toast.error("You have already booked this ride");
      setBookingStatus("error");
      return;
    }
    
    if (currentStep === 1) {
      if (!seats || !contactPhone) {
        toast.error("Please fill in all required fields");
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Check again for existing booking right before submitting
      const hasExistingBooking = await databaseService.checkExistingBooking(ride.id, user.id);
      
      if (hasExistingBooking) {
        setIsAlreadyBooked(true);
        throw new Error("You have already booked this ride");
      }
      
      // If no existing booking, proceed with creating a new booking
      const bookingData: BookingFormData = {
        seats: parseInt(seats),
        contactPhone,
        notes,
        paymentMethod
      };
      
      // Call the onBook function which has the callback logic
      const success = await onBook(bookingData);
      
      setBookingStatus(success ? "success" : "error");
      
      if (success) {
        toast.success("Ride booked successfully!");
      } else {
        toast.error("Failed to book ride. Please try again.");
      }
    } catch (error: any) {
      console.error("Error booking ride:", error);
      setBookingStatus("error");
      toast.error(`Booking failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setSeats("1");
    setContactPhone("");
    setNotes("");
    setPaymentMethod("upi");
    setBookingStatus("idle");
    setCurrentStep(1);
    setIsAlreadyBooked(false);
    onClose();
  };

  const handleCloseDialog = () => {
    if (bookingStatus === "success") {
      resetForm();
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md">
        {bookingStatus === "success" ? (
          <div className="py-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-xl mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="mb-6">
              Your ride has been booked successfully. The driver will contact you shortly.
            </DialogDescription>
            <Button onClick={resetForm}>Done</Button>
          </div>
        ) : bookingStatus === "error" ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <DialogTitle className="text-xl mb-2">Booking Failed</DialogTitle>
            <DialogDescription className="mb-6">
              {isAlreadyBooked 
                ? "You have already booked this ride." 
                : "We couldn't complete your booking. Please try again or contact support."}
            </DialogDescription>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              {!isAlreadyBooked && (
                <Button onClick={() => setBookingStatus("idle")}>Try Again</Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book this Ride</DialogTitle>
              <DialogDescription>
                {currentStep === 1 
                  ? "Complete the form below to book your spot in this ride." 
                  : "Choose your payment method to complete booking."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {currentStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available seats:</span>
                      <span className="font-medium">{ride.availableSeats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price per seat:</span>
                      <span className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {formatPrice(ride.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-medium">{ride.date} at {ride.time}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Select
                      value={seats}
                      onValueChange={setSeats}
                    >
                      <SelectTrigger id="seats">
                        <SelectValue placeholder="Select number of seats" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: ride.availableSeats}, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "seat" : "seats"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or information for the driver"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-lg font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <PaymentOptions onSelectMethod={setPaymentMethod} />
                  
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Service Fee:</span>
                      <span className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {formatPrice(serviceFee)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-b">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-lg font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {formatPrice(finalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <DialogFooter className="pt-4">
                {currentStep === 1 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Pay & Book"
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookRideModal;
