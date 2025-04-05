
import { useEffect, useState } from "react";
import { databaseService } from "@/lib/services/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail, Calendar, MapPin, MessageCircle, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useBookRide } from "@/hooks/useBookRide";
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

interface RideBookingsListProps {
  rideId: string;
  onBookingChange?: () => void;
}

const RideBookingsList = ({ rideId, onBookingChange }: RideBookingsListProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cancelBooking, isCancelling } = useBookRide(rideId);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsData = await databaseService.fetchRideBookings(rideId);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) {
      loadBookings();
    }
  }, [rideId]);

  const handleStartChat = (userId: string) => {
    // Navigate to chat with this passenger
    navigate(`/messages?ride=${rideId}&user=${userId}`);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    const success = await cancelBooking(bookingToCancel);
    if (success) {
      // Refresh the bookings list
      loadBookings();
      // Notify parent component if provided
      if (onBookingChange) {
        onBookingChange();
      }
    }
    setBookingToCancel(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-2" />
        <p className="text-muted-foreground">No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Passengers ({bookings.length})</h3>
        <Badge variant="outline">{bookings.reduce((acc, booking) => acc + booking.seats, 0)} seats booked</Badge>
      </div>
      
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-4 transition-shadow hover:shadow-md">
          <div className="flex items-start">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getAvatarUrl(booking.user)} />
              <AvatarFallback>{booking.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{booking.user.name}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Booked {new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant="secondary">{booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}</Badge>
              </div>
              
              <div className="mt-3 pt-3 border-t space-y-2">
                {booking.contact_phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{booking.contact_phone}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.user.email}</span>
                </div>

                {booking.user.city && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{booking.user.city}</span>
                  </div>
                )}
                
                {booking.notes && (
                  <div className="mt-2 p-3 bg-secondary/30 rounded text-sm">
                    <p className="text-xs font-medium mb-1">Notes:</p>
                    <p>{booking.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center"
                  onClick={() => handleStartChat(booking.user.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex items-center"
                  onClick={() => setBookingToCancel(booking.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel This Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking} 
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <><Skeleton className="h-4 w-4 mr-2" />Processing...</>
              ) : (
                <>Yes, Cancel Booking</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RideBookingsList;
