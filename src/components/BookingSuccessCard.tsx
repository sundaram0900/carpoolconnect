
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

interface BookingSuccessCardProps {
  bookingId: string;
  rideId: string;
  source?: string;
}

const BookingSuccessCard = ({ bookingId, rideId, source = "modal" }: BookingSuccessCardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti animation on successful booking
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const fireConfetti = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#553C9A', '#B794F4'],
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#553C9A', '#B794F4'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(fireConfetti);
      }
    };
    
    fireConfetti();
  }, []);

  const handleViewRide = () => {
    navigate(`/ride/${rideId}`);
  };

  const handleViewBookings = () => {
    navigate('/profile');
  };

  return (
    <Card className="w-full max-w-md mx-auto border-green-200 shadow-md">
      <CardHeader className="text-center border-b pb-6">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl font-bold">Booking Successful!</CardTitle>
        <CardDescription>Your ride has been booked successfully</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Booking Reference:</p>
            <p className="font-medium">{bookingId.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Status:</p>
            <div className="bg-green-100 text-green-800 text-sm py-1 px-3 rounded-full inline-block">
              Confirmed
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            A receipt has been automatically generated and is available in your profile.
            The driver will contact you shortly with more details.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={handleViewRide}>
          View Ride Details
        </Button>
        <Button variant="outline" className="w-full" onClick={handleViewBookings}>
          View All Bookings
        </Button>
        {source === "modal" && (
          <Button variant="ghost" className="w-full" asChild>
            <Link to="/">Find More Rides</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingSuccessCard;
