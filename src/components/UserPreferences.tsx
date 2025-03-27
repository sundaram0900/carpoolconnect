import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Clock, Megaphone, Car } from "lucide-react";
import { toast } from "sonner";
import { NotificationPreferences } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/context/AuthContext";

interface UserPreferencesProps {
  initialPreferences?: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  rideReminders: true,
  marketingEmails: false,
  newRideAlerts: true
};

const UserPreferences = ({ onSave }: UserPreferencesProps) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching preferences:", error);
          return;
        }
        
        if (data) {
          setPreferences({
            emailNotifications: data.email_notifications,
            pushNotifications: data.push_notifications,
            smsNotifications: data.sms_notifications,
            rideReminders: data.ride_reminders,
            marketingEmails: data.marketing_emails,
            newRideAlerts: data.new_ride_alerts
          });
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreferences();
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(preferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications from Ride and Share
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
            </div>
            <Switch 
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="pushNotifications" className="text-base">Push Notifications</Label>
            </div>
            <Switch 
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="smsNotifications" className="text-base">SMS Notifications</Label>
            </div>
            <Switch 
              id="smsNotifications"
              checked={preferences.smsNotifications}
              onCheckedChange={() => handleToggle('smsNotifications')}
            />
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="rideReminders" className="text-base">Ride Reminders</Label>
            </div>
            <Switch 
              id="rideReminders"
              checked={preferences.rideReminders}
              onCheckedChange={() => handleToggle('rideReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="marketingEmails" className="text-base">Marketing Emails</Label>
            </div>
            <Switch 
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={() => handleToggle('marketingEmails')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="newRideAlerts" className="text-base">New Ride Alerts</Label>
            </div>
            <Switch 
              id="newRideAlerts"
              checked={preferences.newRideAlerts}
              onCheckedChange={() => handleToggle('newRideAlerts')}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSave} 
          className="ml-auto"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserPreferences;
