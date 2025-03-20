
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Car, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type RideFormType = "offer" | "request";

interface RideFormProps {
  type: RideFormType;
}

const RideForm = ({ type }: RideFormProps) => {
  const [startLocation, setStartLocation] = useState("");
  const [startCity, setStartCity] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [endCity, setEndCity] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carColor, setCarColor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create a ride",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validation
      if (!startLocation || !startCity || !endLocation || !endCity || !date || !time || !seats) {
        toast({
          title: "Missing information",
          description: "Please fill out all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: `${type === "offer" ? "Ride offered" : "Ride requested"} successfully!`,
        description: `Your ${type === "offer" ? "ride offer" : "request"} has been posted.`,
      });
      
      navigate("/search");
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Locations */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startLocation">Pickup Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startLocation"
                placeholder="Enter pickup address"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startCity">Pickup City</Label>
            <Input
              id="startCity"
              placeholder="Enter city"
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endLocation">Dropoff Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endLocation"
                placeholder="Enter dropoff address"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endCity">Dropoff City</Label>
            <Input
              id="endCity"
              placeholder="Enter city"
              value={endCity}
              onChange={(e) => setEndCity(e.target.value)}
              required
            />
          </div>
        </div>
      </div>
      
      {/* Date and Time */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      
      {/* Seats and Price */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="seats">
            {type === "offer" ? "Available Seats" : "Number of Seats Needed"}
          </Label>
          <Input
            id="seats"
            type="number"
            min="1"
            max="8"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">
            {type === "offer" ? "Price per Seat" : "Maximum Price per Seat"}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-8"
              required={type === "offer"}
            />
          </div>
        </div>
      </div>
      
      {/* Car Info (Only for ride offers) */}
      {type === "offer" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Car className="h-5 w-5 mr-2" /> Vehicle Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="carMake">Car Make</Label>
              <Input
                id="carMake"
                placeholder="e.g., Toyota"
                value={carMake}
                onChange={(e) => setCarMake(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carModel">Car Model</Label>
              <Input
                id="carModel"
                placeholder="e.g., Prius"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="carYear">Year</Label>
              <Input
                id="carYear"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                placeholder="e.g., 2020"
                value={carYear}
                onChange={(e) => setCarYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carColor">Color</Label>
              <Input
                id="carColor"
                placeholder="e.g., Silver"
                value={carColor}
                onChange={(e) => setCarColor(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Additional Information</Label>
        <Textarea
          id="description"
          placeholder="Enter any additional information or details about the ride"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      
      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          "Processing..."
        ) : type === "offer" ? (
          "Offer Ride"
        ) : (
          "Request Ride"
        )}
      </Button>
    </form>
  );
};

export default RideForm;
