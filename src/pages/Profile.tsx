import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/context/AuthContext";
import UserPreferences from "@/components/UserPreferences";
import { Plus, Car, User, CalendarRange, Clock, MapPin, Users, Star, Mail, Phone, Edit } from "lucide-react";
import { motion } from "framer-motion";
import RideCardWrapper from "@/components/RideCardWrapper";
import { Ride, RideStatus } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { databaseService } from "@/lib/services/database";

export default function Profile() {
  const { user, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [offeredRides, setOfferedRides] = useState<Ride[]>([]);
  const [bookedRides, setBookedRides] = useState<Ride[]>([]);
  const [pastRides, setPastRides] = useState<Ride[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
    
    if (user) {
      setBioText(user.bio || "");
      fetchUserRides();
    }
  }, [user, isLoading, navigate]);

  const fetchUserRides = async () => {
    if (!user) return;
    
    setIsLoadingRides(true);
    try {
      const rides = await databaseService.fetchUserRides(user.id);
      
      // Ensure rides have valid RideStatus values before setting state
      if (rides && rides.length > 0) {
        // Partition rides into offered, booked, and past
        const offered = rides.filter(ride => 
          (ride.status === 'scheduled' || ride.status === 'booked' || ride.status === 'in-progress') 
          && new Date(ride.date) >= new Date()
        );
        
        const past = rides.filter(ride => 
          ride.status === 'completed' || ride.status === 'cancelled' || new Date(ride.date) < new Date()
        );

        setOfferedRides(offered);
        setPastRides(past);
        
        // Fetch booked rides
        await fetchBookedRides();
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast.error("Failed to load rides");
    } finally {
      setIsLoadingRides(false);
    }
  };
  
  const fetchBookedRides = async () => {
    if (!user) return;
    
    try {
      const bookings = await databaseService.fetchUserBookings(user.id);
      
      if (bookings && bookings.length > 0) {
        // Map bookings to rides
        const rides = bookings.map(booking => {
          const mappedRide = databaseService.mapDbRideToRide(booking.ride);
          return mappedRide;
        }).filter(ride => ride !== null);
        
        setBookedRides(rides);
      }
    } catch (error) {
      console.error("Error fetching booked rides:", error);
    }
  };
  
  const handleSaveBio = async () => {
    if (!user) return;
    
    try {
      const success = await updateProfile({
        bio: bioText
      });
      
      if (success) {
        setIsEditingBio(false);
        toast.success("Bio updated successfully");
      }
    } catch (error) {
      console.error("Error saving bio:", error);
      toast.error("Failed to update bio");
    }
  };
  
  const handleSavePreferences = async (preferences: any) => {
    // This is handled by the UserPreferences component
    toast.success("Preferences saved successfully");
  };
  
  const profileVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };
  
  const ridesVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={profileVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>View and manage your profile information</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="text-center mt-2">
                  <div className="text-lg font-semibold">{user?.name}</div>
                  <div className="text-sm text-muted-foreground">@{user?.username}</div>
                  
                  <div className="flex items-center justify-center mt-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{user?.rating?.toFixed(1) || "5.0"} ({user?.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                
                {user?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.phone}</span>
                  </div>
                )}
                
                {user?.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.address}, {user?.city}, {user?.zipCode}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium">Bio</h4>
                
                {isEditingBio ? (
                  <div className="flex flex-col space-y-2">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="border rounded-md p-2 text-sm"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setIsEditingBio(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveBio}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {user?.bio || "No bio provided"}
                    
                    <Button variant="link" size="sm" onClick={() => setIsEditingBio(true)} className="p-0">
                      <Edit className="h-4 w-4 ml-1 inline-block" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="offered" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="offered" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>Offered Rides</span>
              </TabsTrigger>
              <TabsTrigger value="booked" className="flex items-center space-x-2">
                <CalendarRange className="h-4 w-4" />
                <span>Booked Rides</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Past Rides</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Preferences</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="offered" className="space-y-4">
              <motion.div variants={ridesVariants} initial="hidden" animate="visible">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Your Offered Rides</h2>
                  <Button onClick={() => navigate("/offer")} className="space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Offer a Ride</span>
                  </Button>
                </div>
                
                <Separator />
                
                {isLoadingRides ? (
                  <div>Loading rides...</div>
                ) : offeredRides.length > 0 ? (
                  <RideCardWrapper rides={offeredRides} />
                ) : (
                  <div>No offered rides yet.</div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="booked" className="space-y-4">
              <motion.div variants={ridesVariants} initial="hidden" animate="visible">
                <h2 className="text-lg font-semibold">Your Booked Rides</h2>
                
                <Separator />
                
                {isLoadingRides ? (
                  <div>Loading rides...</div>
                ) : bookedRides.length > 0 ? (
                  <RideCardWrapper rides={bookedRides} />
                ) : (
                  <div>No booked rides yet.</div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              <motion.div variants={ridesVariants} initial="hidden" animate="visible">
                <h2 className="text-lg font-semibold">Your Past Rides</h2>
                
                <Separator />
                
                {isLoadingRides ? (
                  <div>Loading rides...</div>
                ) : pastRides.length > 0 ? (
                  <RideCardWrapper rides={pastRides} />
                ) : (
                  <div>No past rides yet.</div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <motion.div variants={ridesVariants} initial="hidden" animate="visible">
                <h2 className="text-lg font-semibold">Your Preferences</h2>
                
                <Separator />
                
                <UserPreferences onSave={handleSavePreferences} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
