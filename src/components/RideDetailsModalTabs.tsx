import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ride, User, BookingFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";
import { VerifyOTP } from "./ui/verify-otp";
import RideChat from "./RideChat";
import { rideService } from "@/lib/services/rideService";
import { databaseService } from "@/lib/services/database";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  Info, 
  ShieldCheck, 
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
  Car,
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatTime, formatPrice, getAvatarUrl } from "@/lib/utils";
import DriverDetails from "./DriverDetails";
import RideBookingsList from "./RideBookingsList";
import BookRideModal from "./BookRideModal";
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

interface RideDetailsModalTabsProps {
  ride: Ride;
  defaultTab?: string;
  onBookClick: (formData: BookingFormData) => Promise<{ success: boolean; bookingId?: string }>;
  onCancelBooking?: (bookingId: string) => Promise<boolean>;
  onBookingSuccess?: () => Promise<void>;
  onRideUpdate?: (updatedRide: Ride) => void;
}

const RideDetailsModalTabs = ({ 
  ride, 
  defaultTab = "details",
  onBookClick,
  onCancelBooking,
  onBookingSuccess,
  onRideUpdate
}: RideDetailsModalTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [refreshing, setRefreshing] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user } = useAuth();
  
  const isDriver = user?.id === ride.driver.id;
  const isPassenger = user && ride.bookedBy ? ride.bookedBy.includes(user.id) : false;
  const canStartRide = isDriver && ride.status === 'scheduled';
  const canCompleteRide = isDriver && ride.status === 'in-progress';
  const canCancelRide = isDriver && (ride.status === 'scheduled' || ride.status === 'in-progress');
  const canBookRide = !isDriver && !isPassenger && ride.status === 'scheduled' && ride.availableSeats > 0;
  const canCancelBooking = isPassenger && ride.status === 'scheduled';
  
  const distance = 20; // example value in km
  const duration = 45; // example value in minutes

  let chatWithUser: User;
  if (isDriver) {
    chatWithUser = { id: ride.bookedBy?.[0] || "", name: "Passenger" } as User;
  } else {
    chatWithUser = ride.driver;
  }

  const refreshRideData = async () => {
    if (!ride.id) return;
    
    setRefreshing(true);
    try {
      const updatedRide = await databaseService.fetchRideById(ride.id);
      if (updatedRide && onRideUpdate) {
        onRideUpdate(updatedRide);
      }
    } catch (error) {
      console.error("Failed to refresh ride data:", error);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleCancelBooking = async () => {
    if (!user) return;
    
    setIsCancelling(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('ride_id', ride.id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error finding booking:", error);
        toast.error("Could not find your booking");
        setIsCancelling(false);
        setIsCancelDialogOpen(false);
        return;
      }
      
      if (bookings && onCancelBooking) {
        const success = await onCancelBooking(bookings.id);
        if (success) {
          toast.success("Your booking has been cancelled");
          refreshRideData();
          setIsCancelDialogOpen(false);
          if (onBookingSuccess) {
            await onBookingSuccess();
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
  
  const handleBookingChange = () => {
    refreshRideData();
    if (onBookingSuccess) {
      onBookingSuccess();
    }
  };

  return (
    <>
      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="details">
              <Info className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="driver">
              <Info className="h-4 w-4 mr-2" />
              Driver
            </TabsTrigger>
            {isDriver && (
              <TabsTrigger value="bookings">
                <Users className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
            )}
            {(isDriver || isPassenger) && (
              <TabsTrigger value="verify">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify
              </TabsTrigger>
            )}
            {(isDriver || isPassenger) && (
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            )}
          </TabsList>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshRideData}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <TabsContent value="details">
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
              {canBookRide && (
                <Button className="w-full" onClick={handleBookRide}>
                  Book This Ride
                </Button>
              )}
              
              {isPassenger && canCancelBooking && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setIsCancelDialogOpen(true)}
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
          </div>
        </TabsContent>
        
        <TabsContent value="driver">
          <DriverDetails driver={ride.driver} ride={ride} />
                
          <div className="mt-6">
            {canBookRide && (
              <Button className="w-full" onClick={handleBookRide}>
                Book This Ride
              </Button>
            )}
            
            {isPassenger && canCancelBooking && (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel My Booking
              </Button>
            )}
          </div>
        </TabsContent>
        
        {isDriver && (
          <TabsContent value="bookings">
            <RideBookingsList rideId={ride.id} onBookingChange={handleBookingChange} />
          </TabsContent>
        )}
        
        {(isDriver || isPassenger) && (
          <TabsContent value="verify">
            <VerifyOTP 
              userId={user?.id || ""} 
              rideId={ride.id}
              onSuccess={() => {
                if (isDriver && ride.status === 'scheduled') {
                  handleStartRide();
                }
              }}
            />
          </TabsContent>
        )}
        
        {(isDriver || isPassenger) && ride.bookedBy?.length > 0 && (
          <TabsContent value="chat">
            <RideChat ride={ride} otherUser={chatWithUser} />
          </TabsContent>
        )}
      </Tabs>
      
      <BookRideModal
        ride={ride}
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onBook={onBookClick}
      />

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
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
    </>
  );
};

export default RideDetailsModalTabs;
