
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Ride, BookingFormData } from "@/lib/types";
import { formatDate, formatTime, formatPrice, getAvatarUrl, calculateDistance, calculateDuration, bookRide } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { Calendar, Clock, MapPin, Users, IndianRupee, Route, ShieldCheck, Car, Info } from "lucide-react";
import DriverDetails from "./DriverDetails";
import BookRideModal from "./BookRideModal";
import { toast } from "sonner";

interface RideDetailsModalProps {
  ride: Ride;
  trigger?: React.ReactNode;
}

const RideDetailsModal = ({ ride, trigger }: RideDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const distance = calculateDistance(ride.startLocation, ride.endLocation);
  const duration = calculateDuration(distance);

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to book a ride");
      return;
    }
    
    setIsBookingModalOpen(true);
  };

  const handleBookRide = async (formData: BookingFormData) => {
    if (!user) return false;
    
    const success = await bookRide(ride.id, user.id, formData.seats);
    
    if (success) {
      setIsBookingModalOpen(false);
      setTimeout(() => setIsOpen(false), 1500);
    }
    
    return success;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="link">View Details</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl flex flex-col sm:flex-row sm:items-center gap-2">
              <span>
                {ride.startLocation.city} to {ride.endLocation.city}
              </span>
              <Badge className="sm:ml-2 w-fit">{ride.status}</Badge>
            </DialogTitle>
            <DialogDescription>
              {formatDate(ride.date)} at {formatTime(ride.time)}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details">Ride Details</TabsTrigger>
              <TabsTrigger value="driver">Driver Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
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
                  
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("driver")}>
                    <Info className="h-4 w-4 mr-1" />
                    Driver Info
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full" onClick={handleOpenBooking}>
                    Book This Ride
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="driver">
              <DriverDetails driver={ride.driver} ride={ride} />
              
              <div className="mt-6">
                <Button className="w-full" onClick={handleOpenBooking}>
                  Book This Ride
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <BookRideModal
        ride={ride}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBook={handleBookRide}
      />
    </>
  );
};

export default RideDetailsModal;
