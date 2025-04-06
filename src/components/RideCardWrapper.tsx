
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RideCard from "@/components/RideCard";
import RideDetailsModal from "@/components/RideDetailsModal";
import { Ride } from "@/lib/types";
import { useNavigate } from "react-router-dom";

interface RideCardWrapperProps {
  ride: Ride;
}

const RideCardWrapper = ({ ride }: RideCardWrapperProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Handle view button click
  const handleViewClick = () => {
    navigate(`/ride/${ride.id}`);
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
      {isModalOpen && (
        <RideDetailsModal 
          ride={ride} 
          isOpenByDefault={isModalOpen}
        />
      )}
    </div>
  );
};

export default RideCardWrapper;
