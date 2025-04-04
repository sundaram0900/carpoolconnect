
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RideCard from "@/components/RideCard";
import RideDetailsModal from "@/components/RideDetailsModal";
import { Ride } from "@/lib/types";

interface RideCardWrapperProps {
  ride: Ride;
}

const RideCardWrapper = ({ ride }: RideCardWrapperProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <RideCard ride={ride} />
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsModalOpen(true)}
        >
          View & Book
        </Button>
      </div>
      <RideDetailsModal 
        ride={ride} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default RideCardWrapper;
