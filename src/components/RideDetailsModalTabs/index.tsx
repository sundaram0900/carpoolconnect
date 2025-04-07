
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ride, BookingFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { TabDetails } from "./TabDetails";
import { TabDriver } from "./TabDriver";
import { TabBookings } from "./TabBookings";
import { TabVerify } from "./TabVerify";
import { TabChat } from "./TabChat";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { useAuth } from "@/lib/context/AuthContext";

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
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const isDriver = user?.id === ride.driver.id;
  const isPassenger = user && ride.bookedBy ? ride.bookedBy.includes(user.id) : false;

  // Determine which tabs to show
  const showBookingsTab = isDriver;
  const showVerifyTab = isDriver || isPassenger;
  const showChatTab = (isDriver || isPassenger) && ride.bookedBy?.length > 0;

  let chatWithUser;
  if (isDriver) {
    chatWithUser = { id: ride.bookedBy?.[0] || "", name: "Passenger" };
  } else {
    chatWithUser = ride.driver;
  }

  const refreshRideData = async () => {
    if (!ride.id) return;
    
    setRefreshing(true);
    try {
      await onRideUpdate?.(ride);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="details">
              Details
            </TabsTrigger>
            <TabsTrigger value="driver">
              Driver
            </TabsTrigger>
            {showBookingsTab && (
              <TabsTrigger value="bookings">
                Bookings
              </TabsTrigger>
            )}
            {showVerifyTab && (
              <TabsTrigger value="verify">
                Verify
              </TabsTrigger>
            )}
            {showChatTab && (
              <TabsTrigger value="chat">
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
          <TabDetails 
            ride={ride} 
            isDriver={isDriver} 
            isPassenger={isPassenger} 
            onRideUpdate={onRideUpdate}
            onBookClick={onBookClick}
            onBookingSuccess={onBookingSuccess}
            onOpenCancelDialog={() => setIsCancelDialogOpen(true)}
          />
        </TabsContent>
        
        <TabsContent value="driver">
          <TabDriver 
            ride={ride}
            isPassenger={isPassenger}
            onBookClick={onBookClick}
            onOpenCancelDialog={() => setIsCancelDialogOpen(true)}
          />
        </TabsContent>
        
        {isDriver && (
          <TabsContent value="bookings">
            <TabBookings 
              rideId={ride.id} 
              onBookingChange={onBookingSuccess} 
            />
          </TabsContent>
        )}
        
        {showVerifyTab && (
          <TabsContent value="verify">
            <TabVerify
              userId={user?.id || ""}
              rideId={ride.id}
              isDriver={isDriver}
              rideStatus={ride.status}
              onRideUpdate={onRideUpdate}
            />
          </TabsContent>
        )}
        
        {showChatTab && (
          <TabsContent value="chat">
            <TabChat ride={ride} otherUser={chatWithUser} />
          </TabsContent>
        )}
      </Tabs>
      
      {isPassenger && (
        <CancelBookingDialog
          isOpen={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onCancelBooking={onCancelBooking}
          userId={user?.id || ""}
          rideId={ride.id}
          onSuccess={onBookingSuccess}
          refreshRideData={refreshRideData}
        />
      )}
    </>
  );
};

export default RideDetailsModalTabs;
