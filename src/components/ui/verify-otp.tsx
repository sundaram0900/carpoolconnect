
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VerifyOTPProps {
  userId: string;
  rideId: string;
  onSuccess?: () => void;
}

export function VerifyOTP({ userId, rideId, onSuccess }: VerifyOTPProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendOTP = async () => {
    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('send-verification-otp', {
        body: { userId, rideId }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Verification code sent to your email");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { userId, rideId, code: otp }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Invalid verification code");
      }
      
      setIsVerified(true);
      toast.success("Verification successful");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2" />
        <p className="text-lg font-medium">Verification Successful</p>
        <p className="text-muted-foreground">You have been verified for this ride.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <p className="mb-4">
        Verify your identity with a one-time code. This helps ensure safety for all riders.
      </p>
      
      {!isSending && !isLoading && (
        <Button 
          variant="outline" 
          onClick={handleSendOTP} 
          className="mb-4 w-full"
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            "Send Verification Code"
          )}
        </Button>
      )}
      
      <form onSubmit={handleVerify}>
        <div className="space-y-2">
          <Label htmlFor="otp">Enter Verification Code</Label>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-4" 
          disabled={isLoading || !otp}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </form>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Didn't receive a code? Check your spam folder or request a new code.
      </p>
    </div>
  );
}
