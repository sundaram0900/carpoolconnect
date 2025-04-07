
import RideChat from "../RideChat";
import { Ride, User } from "@/lib/types";

interface TabChatProps {
  ride: Ride;
  otherUser: User;
}

export const TabChat = ({ ride, otherUser }: TabChatProps) => {
  return <RideChat ride={ride} otherUser={otherUser} />;
};
