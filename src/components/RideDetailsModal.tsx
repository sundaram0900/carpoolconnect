import { useState, useEffect } from "react";
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
import { formatDate, formatTime, formatPrice, getAvatarUrl, calculateDistance, calculateDuration } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { Calendar, Clock, MapPin, Users, IndianRupee, Route, Car, Info } from "lucide-react";
import DriverDetails from "./DriverDetails";
import BookRideModal from "./BookRideModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBookRide } from "@/hooks/useBookRide";
import { databaseService } from "@/lib/services/database";

interface RideDetailsModalProps {
  ride: Ride;
  trigger?: React.ReactNode;
  isOpenByDefault?: boolean;
  onRideUpdate?: (updatedRide: Ride) => void;
}

const RideDetailsModal = ({ ride, trigger, isOpenByDefault = false, onRideUpdate }: RideDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  const [activeTab, setActiveTab] = useState("details");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentRide, setCurrentRide] = useState<Ride>(ride);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { bookRide, isBooking } = useBookRide(currentRide.id);
  
  const distance = calculateDistance(currentRide.startLocation, currentRide.endLocation);
  const duration = calculateDuration(distance);

  // Set isOpen to true if isOpenByDefault changes
  useEffect(() => {
    if (isOpenByDefault) {
      setIsOpen(true);
    }
  }, [isOpenByDefault]);

  // Update current ride when prop changes
  useEffect(() => {
    setCurrentRide(ride);
  }, [ride]);

  const refreshRideData = async () => {
    if (!currentRide.id) return;
    
    try {
      const updatedRide = await databaseService.fetchRideById(currentRide.id);
      if (updatedRide) {
        setCurrentRide(updatedRide);
        if (onRideUpdate) {
          onRideUpdate(updatedRide);
        }
      }
    } catch (error) {
      console.error("Failed to refresh ride data:", error);
    }
  };

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to book a ride");
      navigate("/auth");
      return;
    }
    
    setIsBookingModalOpen(true);
  };

  const handleBookRide = async (formData: BookingFormData): Promise<{ success: boolean, bookingId?: string }> => {
    if (!user) return { success: false };
    
    const result = await bookRide(formData);
    
    if (result.success) {
      setIsBookingModalOpen(false);
      toast.success("Ride booked successfully! It will appear in your profile.");
      
      // Refresh ride data to get updated seat count
      await refreshRideData();
      
      setTimeout(() => {
        setIsOpen(false);
        // If we're on the ride details page, navigate back to search after booking
        if (isOpenByDefault) {
          navigate("/search");
        }
      }, 1500);
    }
    
    return result;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        // If closed and we're on ride details page, navigate back to search
        if (!open && isOpenByDefault) {
          navigate("/search");
        }
      }}>
        <DialogTrigger asChild>
          {!isOpenByDefault && (trigger || <Button variant="link">View Details</Button>)}
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl flex flex-col sm:flex-row sm:items-center gap-2">
              <span>
                {currentRide.startLocation.city} to {currentRide.endLocation.city}
              </span>
              <Badge className="sm:ml-2 w-fit">{currentRide.status}</Badge>
            </DialogTitle>
            <DialogDescription>
              {formatDate(currentRide.date)} at {formatTime(currentRide.time)}
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
                      <div className="font-medium">{currentRide.startLocation.address}</div>
                      <div className="text-sm text-muted-foreground">
                        {currentRide.startLocation.city}, {currentRide.startLocation.state}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">{currentRide.endLocation.address}</div>
                      <div className="text-sm text-muted-foreground">
                        {currentRide.endLocation.city}, {currentRide.endLocation.state}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
                    <Calendar className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{formatDate(currentRide.date)}</div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
                    <Clock className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">{formatTime(currentRide.time)}</div>
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
                    <div className="font-medium">{formatPrice(currentRide.price)}</div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
                    <Users className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm text-muted-foreground">Available seats</div>
                    <div className="font-medium">{currentRide.availableSeats}</div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-lg flex flex-col items-center">
                    <Car className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm text-muted-foreground">Vehicle</div>
                    <div className="font-medium">{currentRide.carInfo?.make} {currentRide.carInfo?.model}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(currentRide.driver)} alt={currentRide.driver.name} />
                      <AvatarFallback>{currentRide.driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{currentRide.driver.name}</div>
                      <div className="flex items-center text-amber-500 text-sm">
                        ★ {formatPrice(currentRide.driver.rating || 5.0)}
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("driver")}>
                    <Info className="h-4 w-4 mr-1" />
                    Driver Info
                  </Button>
                </div>
                
                <div className="pt-4">
                  {currentRide.availableSeats > 0 && currentRide.status === 'scheduled' ? (
                    <Button className="w-full" onClick={handleOpenBooking}>
                      Book This Ride
                    </Button>
                  ) : currentRide.availableSeats === 0 ? (
                    <Button className="w-full" disabled>
                      No Seats Available
                    </Button>
                  ) : currentRide.status !== 'scheduled' ? (
                    <Button className="w-full" disabled>
                      Ride {currentRide.status}
                    </Button>
                  ) : null}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="driver">
              <DriverDetails driver={currentRide.driver} ride={currentRide} />
              
              <div className="mt-6">
                {currentRide.availableSeats > 0 && currentRide.status === 'scheduled' ? (
                  <Button className="w-full" onClick={handleOpenBooking}>
                    Book This Ride
                  </Button>
                ) : currentRide.availableSeats === 0 ? (
                  <Button className="w-full" disabled>
                    No Seats Available
                  </Button>
                ) : currentRide.status !== 'scheduled' ? (
                  <Button className="w-full" disabled>
                    Ride {currentRide.status}
                  </Button>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <BookRideModal
        ride={currentRide}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBook={handleBookRide}
      />
    </>
  );
};

export default RideDetailsModal;
