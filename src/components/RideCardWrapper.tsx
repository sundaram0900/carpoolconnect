
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
  
  // Handle view button click
  const handleViewClick = () => {
    setIsModalOpen(true);
  };
  
  return (
    <div>
      <RideCard ride={ride} />
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewClick}
        >
          View & Book
        </Button>
      </div>
      <RideDetailsModal 
        ride={ride} 
        isOpenByDefault={isModalOpen}
      />
    </div>
  );
};

export default RideCardWrapper;
