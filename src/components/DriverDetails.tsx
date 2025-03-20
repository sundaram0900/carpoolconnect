
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Ride } from "@/lib/types";
import { getAvatarUrl, formatRating } from "@/lib/utils";
import { Star, Phone, Mail, Shield, Award, Calendar, Languages, Car } from "lucide-react";

interface DriverDetailsProps {
  driver: User;
  ride?: Ride;
}

const DriverDetails = ({ driver, ride }: DriverDetailsProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex justify-between items-center">
          <div>Driver Information</div>
          {driver.verifiedDriver && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Verified Driver
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={getAvatarUrl(driver)} alt={driver.name} />
            <AvatarFallback className="text-xl">{driver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-lg font-medium">{driver.name}</h3>
            <div className="flex items-center mt-1 space-x-1 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
              <span>{formatRating(driver.rating || 5.0)}</span>
              <span className="text-muted-foreground text-sm">
                ({driver.reviewCount || 0} reviews)
              </span>
            </div>
            
            {driver.username && (
              <div className="text-muted-foreground mt-1">
                @{driver.username}
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          {driver.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{driver.phone}</span>
            </div>
          )}
          
          {driver.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{driver.email}</span>
            </div>
          )}
          
          {driver.createdAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Member since {new Date(driver.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {ride?.driverDetails && (
          <>
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Experience: {ride.driverDetails.experience}</span>
              </div>
              
              <div className="flex items-start">
                <Languages className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <span>Languages: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ride.driverDetails.languages.map((language, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Status: {ride.driverDetails.verificationStatus}</span>
              </div>
            </div>
            
            {ride.carInfo && (
              <>
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Vehicle Information
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pl-6">
                    <div>
                      <span className="text-muted-foreground">Make & Model:</span>
                      <p>{ride.carInfo.make} {ride.carInfo.model}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Year:</span>
                      <p>{ride.carInfo.year}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <p>{ride.carInfo.color}</p>
                    </div>
                    
                    {ride.carInfo.licensePlate && (
                      <div>
                        <span className="text-muted-foreground">License Plate:</span>
                        <p>{ride.carInfo.licensePlate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverDetails;
