import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl, formatRating, fetchRides } from "@/lib/utils";
import { Ride, NotificationPreferences } from "@/lib/types";
import RideCard from "@/components/RideCard";
import UserPreferences from "@/components/UserPreferences";
import { 
  Star, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Car, 
  MapPin,
  Loader2,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  Save,
  AtSign,
  UserCircle,
  Home,
  MapPinned
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, isAuthenticated, isLoading, logout, updateUsername } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [pastRides, setPastRides] = useState<Ride[]>([]);
  const [offerHistory, setOfferHistory] = useState<Ride[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState(true);

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [address, setAddress] = useState(user?.address || "");
  const [city, setCity] = useState(user?.city || "");
  const [zipCode, setZipCode] = useState(user?.zipCode || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Handle saving notification preferences
  const handleSavePreferences = async (preferences: NotificationPreferences) => {
    if (!user) return;
    
    // In a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes we're just showing a success message
    return Promise.resolve();
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
      toast.error("Please sign in to view your profile");
    } else if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setZipCode(user.zipCode || "");
    }
  }, [isLoading, isAuthenticated, navigate, user]);

  // Load rides
  useEffect(() => {
    const loadRides = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingRides(true);
        const rides = await fetchRides();
        
        // For demo purposes, randomly assign some rides as the user's
        const today = new Date();
        
        // Upcoming rides (in the future)
        setUpcomingRides(
          rides
            .filter(ride => new Date(ride.date) > today)
            .slice(0, 2)
        );
        
        // Past rides (in the past)
        setPastRides(
          rides
            .filter(ride => new Date(ride.date) < today)
            .slice(0, 3)
        );
        
        // Rides the user has offered
        setOfferHistory(
          rides
            .filter((_, index) => index % 3 === 0)
            .slice(0, 2)
        );
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setIsLoadingRides(false);
      }
    };

    loadRides();
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSavingProfile(true);
      
      // Update username if it has changed
      if (username !== user.username) {
        await updateUsername(username);
      }
      
      // In a real app, this would call an API to update all user details
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setZipCode(user.zipCode || "");
    }
    setIsEditingProfile(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="glass-card rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={getAvatarUrl(user)} alt={user.name} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.verifiedDriver && (
                    <Badge className="absolute -bottom-2 -right-2 bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-semibold">{user.name}</h1>
                      <div className="flex items-center justify-center md:justify-start mt-1 space-x-1 text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span>{formatRating(user.rating || 5.0)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({user.reviewCount || 0} reviews)
                        </span>
                      </div>
                      {user.username && (
                        <div className="flex items-center justify-center md:justify-start mt-1 text-muted-foreground">
                          <AtSign className="h-4 w-4 mr-1" />
                          {user.username}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      {isEditingProfile ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSavingProfile}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingProfile(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={logout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Log Out
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isEditingProfile ? (
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell others about yourself..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <div className="relative">
                            <MapPinned className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Member since {new Date().toLocaleDateString()}
                      </div>
                      {user.address && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {user.address}, {user.city || ""} {user.zipCode || ""}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Tabs for different sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="upcoming">Upcoming Rides</TabsTrigger>
                <TabsTrigger value="past">Past Rides</TabsTrigger>
                <TabsTrigger value="offers">Your Offers</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-6">
                {isLoadingRides ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : upcomingRides.length > 0 ? (
                  upcomingRides.map(ride => (
                    <RideCard key={ride.id} ride={ride} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-secondary/50 rounded-xl">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No upcoming rides</h3>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                      You don't have any upcoming rides scheduled. 
                      Find a ride now or check back later.
                    </p>
                    <Button asChild className="mt-6">
                      <a href="/search">Find a Ride</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past" className="space-y-6">
                {isLoadingRides ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pastRides.length > 0 ? (
                  <>
                    {pastRides.map(ride => (
                      <div key={ride.id} className="glass-card rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="min-w-8 flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="h-10 border-l border-dashed border-primary/30 my-1"></div>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium">
                                  {ride.startLocation.city} to {ride.endLocation.city}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  {new Date(ride.date).toLocaleDateString()} at {ride.time}
                                </p>
                              </div>
                              <Badge variant="outline" className="h-6">Completed</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={getAvatarUrl(ride.driver)} alt={ride.driver.name} />
                                  <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{ride.driver.name}</span>
                              </div>
                              <Button variant="outline" size="sm">
                                Leave Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-12 bg-secondary/50 rounded-xl">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No past rides</h3>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                      You haven't taken any rides yet. 
                      Once you complete a ride, it will appear here.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="offers" className="space-y-6">
                {isLoadingRides ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : offerHistory.length > 0 ? (
                  offerHistory.map(ride => (
                    <div key={ride.id} className="glass-card rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="min-w-8 flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="h-10 border-l border-dashed border-primary/30 my-1"></div>
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">
                                {ride.startLocation.city} to {ride.endLocation.city}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {new Date(ride.date).toLocaleDateString()} at {ride.time}
                              </p>
                            </div>
                            <Badge
                              className={
                                new Date(ride.date) > new Date()
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }
                            >
                              {new Date(ride.date) > new Date() ? "Active" : "Completed"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Price</p>
                              <p className="font-medium">${ride.price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Seats</p>
                              <p className="font-medium">{ride.availableSeats} available</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Car</p>
                              <p className="font-medium">{ride.carInfo?.make} {ride.carInfo?.model}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Offer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-secondary/50 rounded-xl">
                    <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">No ride offers</h3>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                      You haven't offered any rides yet. 
                      Share your journey with others and help reduce carbon emissions.
                    </p>
                    <Button asChild className="mt-6">
                      <a href="/offer">Offer a Ride</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <UserPreferences 
                    initialPreferences={{
                      emailNotifications: true,
                      pushNotifications: true,
                      smsNotifications: false,
                      rideReminders: true,
                      marketingEmails: false,
                      newRideAlerts: true
                    }}
                    onSave={handleSavePreferences}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
