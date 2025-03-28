import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Car, Calendar, Clock, Users, IndianRupee, Info } from "lucide-react";
import { format } from "date-fns";
import { databaseService } from "@/lib/services/database";
import { useAuth } from "@/lib/context/AuthContext";

const formSchema = z.object({
  startCity: z.string().min(1, "Start city is required"),
  startAddress: z.string().min(1, "Start address is required"),
  endCity: z.string().min(1, "Destination city is required"),
  endAddress: z.string().min(1, "Destination address is required"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  availableSeats: z.string().min(1, "Available seats is required"),
  price: z.string().min(1, "Price is required"),
  carMake: z.string().optional(),
  carModel: z.string().optional(),
  carYear: z.string().optional(),
  carColor: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RideFormProps {
  type: "offer" | "request";
}

const RideForm = ({ type }: RideFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startCity: "",
      startAddress: "",
      endCity: "",
      endAddress: "",
      date: new Date(),
      time: "09:00",
      availableSeats: "2",
      price: "500",
      carMake: "",
      carModel: "",
      carYear: "",
      carColor: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to offer a ride");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === "offer") {
        const result = await databaseService.createRide({
          ...data,
          date: format(data.date, "yyyy-MM-dd"),
          availableSeats: parseInt(data.availableSeats),
          price: parseFloat(data.price),
          carYear: data.carYear ? parseInt(data.carYear) : null,
        }, user.id);

        if (result) {
          toast.success("Ride offer posted successfully!");
          navigate("/profile");
        } else {
          toast.error("Failed to post ride offer");
        }
      } else {
        const result = await databaseService.createRideRequest({
          startCity: data.startCity,
          startAddress: data.startAddress,
          endCity: data.endCity,
          endAddress: data.endAddress,
          date: format(data.date, "yyyy-MM-dd"),
          time: data.time,
          numberOfSeats: parseInt(data.availableSeats),
          maxPrice: parseFloat(data.price),
          description: data.description || null,
        }, user.id);

        if (result) {
          toast.success("Ride request posted successfully!");
          navigate("/profile");
        } else {
          toast.error("Failed to post ride request");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to submit: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-none">
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Start City</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter start city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Start Address</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter start address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Destination City</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter destination city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Destination Address</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter destination address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          onSelect={field.onChange}
                          className="border rounded-md p-2 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Time</span>
                      </FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Available Seats</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 6 }, (_, i) => i + 1).map((seats) => (
                            <SelectItem key={seats} value={String(seats)}>
                              {seats}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4" />
                      <span>Price per Seat</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter price per seat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === "offer" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Car Make</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter car make" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="carModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Car Model</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter car model" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Car Year</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter car year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="carColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Car Color</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter car color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Info className="h-4 w-4" />
                      <span>Additional Information</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about the ride"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default RideForm;
