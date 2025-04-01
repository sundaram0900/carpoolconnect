
import { useEffect, useState } from "react";
import { databaseService } from "@/lib/services/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail } from "lucide-react";

interface RideBookingsListProps {
  rideId: string;
}

const RideBookingsList = ({ rideId }: RideBookingsListProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    if (rideId) {
      loadBookings();
    }
  }, [rideId]);

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
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Passengers ({bookings.length})</h3>
      
      {bookings.map((booking) => (
        <div key={booking.id} className="border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={getAvatarUrl(booking.user)} />
              <AvatarFallback>{booking.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-medium">{booking.user.name}</p>
              <p className="text-sm text-muted-foreground">
                Booked {booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}
              </p>
            </div>
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
            
            {booking.notes && (
              <div className="mt-2 p-2 bg-secondary/30 rounded text-sm">
                <p className="text-xs font-medium mb-1">Notes:</p>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RideBookingsList;
