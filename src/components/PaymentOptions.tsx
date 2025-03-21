
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Wallet, IndianRupee } from "lucide-react";

interface PaymentOptionsProps {
  onSelectMethod: (method: string) => void;
}

const PaymentOptions = ({ onSelectMethod }: PaymentOptionsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [upiId, setUpiId] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  
  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
    onSelectMethod(value);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Payment Method</h3>
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={handleMethodChange}
        className="grid gap-4"
      >
        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-secondary/50">
          <RadioGroupItem value="upi" id="upi" />
          <Label htmlFor="upi" className="flex items-center cursor-pointer">
            <Wallet className="h-4 w-4 mr-2 text-primary" />
            <span>UPI</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-secondary/50">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex items-center cursor-pointer">
            <CreditCard className="h-4 w-4 mr-2 text-primary" />
            <span>Credit/Debit Card</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-secondary/50">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash" className="flex items-center cursor-pointer">
            <IndianRupee className="h-4 w-4 mr-2 text-primary" />
            <span>Cash on Ride</span>
          </Label>
        </div>
      </RadioGroup>
      
      {selectedMethod === "upi" && (
        <div className="mt-4 p-4 bg-secondary/30 rounded-md space-y-3">
          <Label htmlFor="upi-id">UPI ID</Label>
          <Input 
            id="upi-id" 
            placeholder="name@upi" 
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter your UPI ID (e.g., yourname@okhdfcbank, 9876543210@ybl)
          </p>
        </div>
      )}
      
      {selectedMethod === "card" && (
        <div className="mt-4 p-4 bg-secondary/30 rounded-md space-y-3">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input 
              id="card-number" 
              placeholder="1234 5678 9012 3456" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv" 
                placeholder="123" 
                type="password" 
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
      {selectedMethod === "cash" && (
        <div className="mt-4 p-4 bg-secondary/30 rounded-md">
          <p className="text-sm">
            You will pay the driver directly in cash before or after the ride.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;
