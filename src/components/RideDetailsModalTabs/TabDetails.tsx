
import { Ride, BookingFormData, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatTime, formatPrice, getAvatarUrl } from "@/lib/utils";
import { rideService } from "@/lib/services/rideService";
import { toast } from "sonner";
import { useState } from "react";
import BookRideModal from "../BookRideModal";
import { 
  MessageSquare, 
  Info, 
  ReceiptText,
  PlayCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Clock,
  LayoutDashboard as Route,
  DollarSign as IndianRupee,
  Users,
  Car
} from "lucide-react";

interface TabDetailsProps {
  ride: Ride;
  isDriver: boolean;
  isPassenger: boolean;
  onRideUpdate?: (updatedRide: Ride) => void;
  onBookClick: (formData: BookingFormData) => Promise<{ success: boolean; bookingId?: string }>;
  onBookingSuccess?: () => Promise<void>;
  onOpenCancelDialog: () => void;
}

export const TabDetails = ({ 
  ride, 
  isDriver, 
  isPassenger, 
  onRideUpdate,
  onBookClick,
  onBookingSuccess,
  onOpenCancelDialog
}: TabDetailsProps) => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  const canStartRide = isDriver && ride.status === 'scheduled';
  const canCompleteRide = isDriver && ride.status === 'in-progress';
  const canCancelRide = isDriver && (ride.status === 'scheduled' || ride.status === 'in-progress');
  const canBookRide = !isDriver && !isPassenger && ride.status === 'scheduled' && ride.availableSeats > 0;
  const canCancelBooking = isPassenger && ride.status === 'scheduled';
  
  // Example values for distance and duration that should ideally come from props
  const distance = 20; // example value in km
  const duration = 45; // example value in minutes

  const handleStartRide = async () => {
    const success = await rideService.startRide(ride.id);
    if (success) {
      toast.success("Ride started successfully");
      refreshRideData();
    }
  };

  const handleCompleteRide = async () => {
    const success = await rideService.completeRide(ride.id);
    if (success) {
      toast.success("Ride completed successfully");
      refreshRideData();
    }
  };

  const handleCancelRide = async () => {
    const success = await rideService.cancelRide(ride.id);
    if (success) {
      toast.success("Ride cancelled successfully");
      refreshRideData();
    }
  };

  const generateReceipt = async () => {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('ride_id', ride.id)
      .eq('user_id', user?.id)
      .single();
      
    if (bookings) {
      const receipt = await rideService.generateReceipt(bookings.id);
      if (receipt) {
        toast.success("Receipt generated and sent to your email");
      }
    } else {
      toast.error("No booking found for this ride");
    }
  };

  const handleBookRide = () => {
    setIsBookModalOpen(true);
  };
  
  const refreshRideData = () => {
    if (onRideUpdate) {
      onRideUpdate(ride);
    }
  };

  const handleBookingSuccess = async () => {
    setIsBookModalOpen(false);
    if (onBookingSuccess) {
      await onBookingSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="min-w-8 flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="h-14 border-l border-dashed border-primary/30 my-1"></div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="mb-3">
            <div className="font-medium">{ride.startLocation.address}</div>
            <div className="text-sm text-muted-foreground">
              {ride.startLocation.city}, {ride.startLocation.state}
            </div>
          </div>
          
          <div>
            <div className="font-medium">{ride.endLocation.address}</div>
            <div className="text-sm text-muted-foreground">
              {ride.endLocation.city}, {ride.endLocation.state}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <Calendar className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Date</div>
          <div className="font-medium">{formatDate(ride.date)}</div>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <Clock className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Time</div>
          <div className="font-medium">{formatTime(ride.time)}</div>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <Route className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Distance</div>
          <div className="font-medium">{distance} km</div>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <Clock className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Duration</div>
          <div className="font-medium">{duration} min</div>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <IndianRupee className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Price per seat</div>
          <div className="font-medium">{formatPrice(ride.price)}</div>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <Users className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Available seats</div>
          <div className="font-medium">{ride.availableSeats}</div>
        </div>
        
        <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
          <Car className="h-5 w-5 mb-1 text-primary" />
          <div className="text-sm text-muted-foreground">Vehicle</div>
          <div className="font-medium">{ride.carInfo?.make} {ride.carInfo?.model}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getAvatarUrl(ride.driver)} alt={ride.driver.name} />
            <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{ride.driver.name}</div>
            <div className="flex items-center text-amber-500 text-sm">
              ★ {formatPrice(ride.driver.rating || 5.0)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
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
        
        {isDriver && (
          <div className="space-y-3">
            {canStartRide && (
              <Button className="w-full" onClick={handleStartRide}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Ride
              </Button>
            )}
            
            {canCompleteRide && (
              <Button className="w-full" onClick={handleCompleteRide}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Ride
              </Button>
            )}
            
            {canCancelRide && (
              <Button variant="destructive" className="w-full" onClick={handleCancelRide}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Ride
              </Button>
            )}
          </div>
        )}
        
        {isPassenger && ride.status === 'completed' && (
          <Button className="w-full" onClick={generateReceipt}>
            <ReceiptText className="mr-2 h-4 w-4" />
            Generate Receipt
          </Button>
        )}
      </div>
      
      <BookRideModal
        ride={ride}
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onBook={onBookClick}
      />
    </div>
  );
};
