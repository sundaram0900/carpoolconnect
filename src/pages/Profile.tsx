
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Mail, MapPin, Phone, Star, Clock } from "lucide-react";
import UserPreferences from "@/components/UserPreferences";
import { Ride, RideRequest } from "@/lib/types";
import { databaseService } from "@/lib/services/database";
import { getAvatarUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import RideList from "@/components/RideList";

const Profile = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [rides, setRides] = useState<Ride[]>([]);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch user's rides
        const userRides = await databaseService.fetchUserRides(user.id);
        setRides(userRides);
        
        // Fetch user's ride requests
        const userRideRequests = await databaseService.fetchUserRideRequests(user.id);
        setRideRequests(userRideRequests);
        
        // Fetch user's bookings
        const userBookings = await databaseService.fetchUserBookings(user.id);
        
        // Map bookings to include the ride object
        const mappedBookings = userBookings.map(booking => {
          const mappedRide = databaseService.mapDbRideToRide(booking.ride);
          return {
            ...booking,
            ride: mappedRide
          };
        });
        
        setBookings(mappedBookings);
        
        // Fetch user's receipts
        const userReceipts = await databaseService.fetchUserReceipts(user.id);
        setReceipts(userReceipts);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userBookedRides = bookings.map(booking => booking.ride);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        >
          <div className="md:col-span-1">
            <div className="p-6 glass-card rounded-xl text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={getAvatarUrl(user)} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
              <div className="flex items-center justify-center mb-4">
                <Star className="text-yellow-500 h-4 w-4 mr-1" />
                <span>{user.rating || 5.0}</span>
                <span className="text-muted-foreground ml-1">
                  ({user.reviewCount || 0} reviews)
                </span>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p>{user.address}</p>
                      {user.city && (
                        <p>
                          {user.city}
                          {user.zipCode && `, ${user.zipCode}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 glass-card rounded-xl mb-6">
              <h3 className="text-lg font-medium mb-4">Account</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  Profile Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("preferences")}
                >
                  Preferences
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/ride-offer")}
                >
                  Offer a Ride
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/ride-request")}
                >
                  Request a Ride
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="rides">Rides</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Profile</h3>
                  
                  {user.bio ? (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">About</h4>
                      <p className="text-muted-foreground">{user.bio}</p>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                      <p className="text-muted-foreground">
                        Your profile is looking a bit empty. Add a bio and your address to help
                        others get to know you better.
                      </p>
                    </div>
                  )}
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Your Rides</h4>
                      <div className="text-4xl font-bold mb-1">{rides.length}</div>
                      <p className="text-sm text-muted-foreground">Rides offered</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Your Trips</h4>
                      <div className="text-4xl font-bold mb-1">{bookings.length}</div>
                      <p className="text-sm text-muted-foreground">Trips taken</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">Receipts</h4>
                    {isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : receipts.length > 0 ? (
                      <div className="space-y-4">
                        {receipts.slice(0, 3).map((receipt) => (
                          <div key={receipt.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">
                                  {receipt.booking_details.ride.start_city} to {receipt.booking_details.ride.end_city}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(receipt.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{receipt.amount}</p>
                                <p className="text-xs uppercase text-muted-foreground">
                                  {receipt.payment_status}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {receipts.length > 3 && (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setActiveTab("bookings")}
                          >
                            View All Receipts
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No receipts yet.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="rides">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Your Rides</h3>
                  
                  <Tabs defaultValue="offered">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="offered">Offered</TabsTrigger>
                      <TabsTrigger value="requested">Requested</TabsTrigger>
                      <TabsTrigger value="booked">Booked</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="offered">
                      {isLoading ? (
                        <div className="space-y-6">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : (
                        <RideList 
                          rides={rides} 
                          emptyMessage="You haven't offered any rides yet." 
                        />
                      )}
                      
                      <div className="mt-6">
                        <Button 
                          className="w-full" 
                          onClick={() => navigate("/ride-offer")}
                        >
                          Offer a New Ride
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="requested">
                      {isLoading ? (
                        <div className="space-y-6">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : rideRequests.length > 0 ? (
                        <div className="space-y-4">
                          {rideRequests.map((request) => (
                            <div key={request.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">
                                  {request.startLocation.city} to {request.endLocation.city}
                                </h4>
                                <div className="px-2 py-1 bg-secondary rounded-full text-xs">
                                  {request.status}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(request.date).toLocaleDateString()} at {request.time}
                              </p>
                              <div className="flex justify-between text-sm">
                                <span>Seats: {request.numberOfSeats}</span>
                                {request.maxPrice && (
                                  <span>Max price: ₹{request.maxPrice}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-secondary/30 rounded-lg">
                          <p className="text-muted-foreground">You haven't requested any rides yet.</p>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <Button 
                          className="w-full" 
                          onClick={() => navigate("/ride-request")}
                        >
                          Request a New Ride
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="booked">
                      {isLoading ? (
                        <div className="space-y-6">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : (
                        <RideList 
                          rides={userBookedRides} 
                          emptyMessage="You haven't booked any rides yet." 
                        />
                      )}
                      
                      <div className="mt-6">
                        <Button 
                          className="w-full" 
                          onClick={() => navigate("/search")}
                        >
                          Find Rides to Book
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
              
              <TabsContent value="bookings">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Your Bookings & Receipts</h3>
                  
                  {isLoading ? (
                    <div className="space-y-6">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : receipts.length > 0 ? (
                    <div className="space-y-4">
                      {receipts.map((receipt) => (
                        <div key={receipt.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              {receipt.booking_details.ride.start_city} to {receipt.booking_details.ride.end_city}
                            </h4>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              receipt.payment_status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {receipt.payment_status}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(receipt.created_at).toLocaleDateString()}
                          </p>
                          
                          <div className="flex justify-between items-end">
                            <div className="text-sm">
                              <p>Seats: {receipt.booking_details.seats}</p>
                              <p className="text-muted-foreground">
                                {receipt.payment_method}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">₹{receipt.amount}</p>
                            </div>
                          </div>
                          
                          <Button
                            variant="link"
                            size="sm"
                            className="mt-2 p-0 h-auto"
                            onClick={() => {
                              // Generate and send receipt
                              rideService.generateReceipt(receipt.booking_id);
                            }}
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            Send Receipt
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-secondary/30 rounded-lg">
                      <p className="text-muted-foreground">No bookings or receipts yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="preferences">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-6">Preferences & Settings</h3>
                  <UserPreferences />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
