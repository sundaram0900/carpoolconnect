
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Message, Ride, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { toast } from "sonner";

interface RideChatProps {
  ride: Ride;
  otherUser: User;
}

const RideChat = ({ ride, otherUser }: RideChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !otherUser?.id) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching messages for ride:", ride.id, "between", user.id, "and", otherUser.id);
        
        const { data, error } = await supabase.functions.invoke('ride-chat', {
          body: { 
            method: 'list', 
            userId: user.id, 
            rideId: ride.id 
          } as Record<string, unknown>
        });
        
        if (error) {
          console.error("Error invoking ride-chat function:", error);
          setError("Failed to load messages. Please try again.");
          return;
        }
        
        if (data) {
          console.log("Retrieved messages:", data);
          const formattedMessages = data.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender_id,
            recipientId: msg.recipient_id,
            rideId: msg.ride_id,
            content: msg.content,
            timestamp: msg.created_at,
            read: msg.read
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ride_id=eq.${ride.id}`
        },
        async (payload) => {
          console.log("New message received:", payload);
          const newMsg = payload.new as any;
          
          if (
            (newMsg.sender_id === user.id && newMsg.recipient_id === otherUser.id) ||
            (newMsg.sender_id === otherUser.id && newMsg.recipient_id === user.id)
          ) {
            const formattedMessage: Message = {
              id: newMsg.id,
              senderId: newMsg.sender_id,
              recipientId: newMsg.recipient_id,
              rideId: newMsg.ride_id,
              content: newMsg.content,
              timestamp: newMsg.created_at,
              read: newMsg.read
            };
            
            setMessages((prev) => [...prev, formattedMessage]);
            
            // Mark messages as read if the current user is the recipient
            if (newMsg.recipient_id === user.id) {
              try {
                await supabase.functions.invoke('ride-chat', {
                  body: { 
                    method: 'mark-read', 
                    messageId: newMsg.id 
                  } as Record<string, unknown>
                });
              } catch (error) {
                console.error("Error marking message as read:", error);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, ride.id, otherUser?.id]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSenderName = (senderId: string): string => {
    if (senderId === user?.id) {
      return user?.name || "You";
    }
    return otherUser?.name || "Other User";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || !otherUser?.id) return;
    
    try {
      setIsSending(true);
      console.log("Sending message to:", otherUser.id, "content:", newMessage.trim());
      
      const { error } = await supabase.functions.invoke('ride-chat', {
        body: {
          method: 'send',
          senderId: user.id,
          recipientId: otherUser.id,
          rideId: ride.id,
          content: newMessage.trim()
        } as Record<string, unknown>
      });
      
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return;
      }
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = () => {
    if (!user || !otherUser?.id) return;
    setIsLoading(true);
    setError(null);
    
    // Fetch messages again
    supabase.functions.invoke('ride-chat', {
      body: { 
        method: 'list', 
        userId: user.id, 
        rideId: ride.id 
      } as Record<string, unknown>
    }).then(({ data, error }) => {
      if (error) {
        console.error("Error retrying message fetch:", error);
        setError("Failed to load messages after retry");
        return;
      }
      
      if (data) {
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          recipientId: msg.recipient_id,
          rideId: msg.ride_id,
          content: msg.content,
          timestamp: msg.created_at,
          read: msg.read
        }));
        setMessages(formattedMessages);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={handleRetry} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <div className="p-4 bg-secondary/30 mb-2 rounded-lg flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={getAvatarUrl(otherUser)} alt={otherUser.name} />
          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">{otherUser.name}</div>
          <div className="text-xs text-muted-foreground">Chat about your ride</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              {message.senderId !== user?.id && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage
                    src={getAvatarUrl(otherUser)}
                    alt={getSenderName(message.senderId)}
                  />
                  <AvatarFallback>
                    {getSenderName(message.senderId).charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  message.senderId === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p>{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 flex space-x-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button type="submit" disabled={isSending || !newMessage.trim()}>
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default RideChat;
