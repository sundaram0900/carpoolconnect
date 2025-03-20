
import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import { fetchRides } from "@/lib/utils";
import { Ride } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Filter, RefreshCw, Calendar, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import RideDetailsModal from "@/components/RideDetailsModal";

const Search = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState({
    from: "",
    to: "",
    date: undefined as Date | undefined,
    seats: "1"
  });
  const [sortOption, setSortOption] = useState("price-asc");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const loadRides = async () => {
      try {
        setIsLoading(true);
        const fetchedRides = await fetchRides();
        setRides(fetchedRides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRides();
  }, []);

  const handleSearch = (criteria: {
    from: string;
    to: string;
    date: Date | undefined;
    seats: string;
  }) => {
    setIsLoading(true);
    setSearchCriteria(criteria);
    setHasSearched(true);
    
    // In a real app, we'd call an API with the search criteria
    // For now, simulate a search delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleSort = (value: string) => {
    setSortOption(value);
    
    // Sort the rides based on the selected option
    const sortedRides = [...rides];
    switch (value) {
      case "price-asc":
        sortedRides.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedRides.sort((a, b) => b.price - a.price);
        break;
      case "date-asc":
        sortedRides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "date-desc":
        sortedRides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "seats-desc":
        sortedRides.sort((a, b) => b.availableSeats - a.availableSeats);
        break;
      default:
        break;
    }
    
    setRides(sortedRides);
  };

  const filteredRides = rides.filter(ride => {
    if (hasSearched) {
      const fromMatch = searchCriteria.from 
        ? ride.startLocation.city.toLowerCase().includes(searchCriteria.from.toLowerCase())
        : true;
      
      const toMatch = searchCriteria.to
        ? ride.endLocation.city.toLowerCase().includes(searchCriteria.to.toLowerCase())
        : true;
      
      const dateMatch = searchCriteria.date
        ? new Date(ride.date).toDateString() === searchCriteria.date.toDateString()
        : true;
      
      const seatsMatch = Number(searchCriteria.seats) <= ride.availableSeats;
      
      return fromMatch && toMatch && dateMatch && seatsMatch;
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">Find Available Rides</h1>
            <p className="text-muted-foreground text-lg">
              Search for rides based on your travel plans and preferences
            </p>
          </motion.div>
          
          <SearchForm onSearch={handleSearch} loading={isLoading} />
        </div>
        
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="max-w-4xl mx-auto mb-8 p-4 bg-secondary/70 rounded-lg"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium">Search Results:</div>
              
              {searchCriteria.from && (
                <Badge variant="secondary" className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  From: {searchCriteria.from}
                </Badge>
              )}
              
              {searchCriteria.to && (
                <Badge variant="secondary" className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  To: {searchCriteria.to}
                </Badge>
              )}
              
              {searchCriteria.date && (
                <Badge variant="secondary" className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Date: {searchCriteria.date.toLocaleDateString()}
                </Badge>
              )}
              
              <Badge variant="secondary" className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Seats: {searchCriteria.seats}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto"
                onClick={() => setHasSearched(false)}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </motion.div>
        )}
        
        {filteredRides.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
            <p className="text-muted-foreground">
              {filteredRides.length} {filteredRides.length === 1 ? "ride" : "rides"} found
            </p>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Sort by:</span>
              <Select value={sortOption} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="date-asc">Date: Earliest First</SelectItem>
                  <SelectItem value="date-desc">Date: Latest First</SelectItem>
                  <SelectItem value="seats-desc">Available Seats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {isLoading ? (
              <div className="space-y-6">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-xl p-6">
                    <div className="flex items-start space-x-2 mb-4">
                      <div className="min-w-8 flex flex-col items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-10 w-1 my-1" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-48 mb-4" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-px w-full my-4" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredRides.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {filteredRides.map((ride) => (
                  <div key={ride.id} className="relative">
                    <RideDetailsModal 
                      ride={ride}
                      trigger={
                        <div className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                          <RideCard ride={ride} />
                          <div className="absolute bottom-0 right-0 p-4">
                            <Button size="sm" variant="default">Book Now</Button>
                          </div>
                        </div>
                      }
                    />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-secondary/50 rounded-xl p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-medium mb-3">No rides found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria or check back later for new rides.
                  </p>
                  <Button onClick={() => setHasSearched(false)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Search
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Search;
