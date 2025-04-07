
import { VerifyOTP } from "../ui/verify-otp";
import { rideService } from "@/lib/services/rideService";
import { toast } from "sonner";
import { Ride } from "@/lib/types";

interface TabVerifyProps {
  userId: string;
  rideId: string;
  isDriver: boolean;
  rideStatus: string;
  onRideUpdate?: (updatedRide: Ride) => void;
}

export const TabVerify = ({ userId, rideId, isDriver, rideStatus, onRideUpdate }: TabVerifyProps) => {
  const handleVerificationSuccess = async () => {
    if (isDriver && rideStatus === 'scheduled') {
      const success = await rideService.startRide(rideId);
      if (success) {
        toast.success("Ride started successfully");
        if (onRideUpdate) {
          const updatedRide = await rideService.fetchRide(rideId);
          if (updatedRide) {
            onRideUpdate(updatedRide);
          }
        }
      }
    }
  };

  return (
    <VerifyOTP 
      userId={userId} 
      rideId={rideId}
      onSuccess={handleVerificationSuccess}
    />
  );
};
