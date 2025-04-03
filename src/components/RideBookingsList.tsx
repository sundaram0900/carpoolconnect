
import { useEffect, useState } from "react";
import { databaseService } from "@/lib/services/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail, Calendar, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RideBookingsListProps {
  rideId: string;
}

const RideBookingsList = ({ rideId }: RideBookingsListProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleStartChat = (userId: string) => {
    // Navigate to chat with this passenger
    navigate(`/messages?ride=${rideId}&user=${userId}`);
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
              
              <div className="mt-4 flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex items-center"
                  onClick={() => handleStartChat(booking.user.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message Passenger
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RideBookingsList;
