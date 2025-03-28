
import { Ride } from "@/lib/types";
import RideCardWrapper from "./RideCardWrapper";

interface RideListProps {
  rides: Ride[];
  emptyMessage?: string;
}

const RideList = ({ rides, emptyMessage = "No rides found" }: RideListProps) => {
  if (rides.length === 0) {
    return (
      <div className="text-center p-6 bg-secondary/30 rounded-lg">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => (
        <RideCardWrapper key={ride.id} ride={ride} />
      ))}
    </div>
  );
};

export default RideList;
