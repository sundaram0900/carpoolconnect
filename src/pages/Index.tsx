
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import RideCard from "@/components/RideCard";
import { fetchRides } from "@/lib/utils";
import { Ride } from "@/lib/types";
import { ChevronRight, Star, MessageSquare, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    role: "Regular Commuter",
    text: "CarpoolConnect has transformed my daily commute. I save money, meet great people, and help the environment. What's not to love?",
    rating: 5,
  },
  {
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
    role: "Weekend Traveler",
    text: "Finding rides for weekend trips used to be a hassle. Now I just open the app and connect with drivers going my way. It's so simple!",
    rating: 4,
  },
  {
    name: "Olivia Garcia",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    role: "College Student",
    text: "As a student on a budget, this app is a lifesaver. I've made friends and saved enough money to actually enjoy my semester!",
    rating: 5,
  },
];

const Index = () => {
  const [popularRides, setPopularRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const rides = await fetchRides();
        setPopularRides(rides.slice(0, 3));
      } catch (error) {
        console.error("Error fetching rides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRides();
  }, []);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-semibold mb-4"
            >
              Popular Rides
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              Check out these trending routes with our top-rated drivers
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Skeleton loaders
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 animate-pulse h-96"
                  >
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-8"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                  </div>
                ))
            ) : (
              popularRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/search" className="flex items-center">
                View all available rides
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-semibold mb-4"
            >
              How CarpoolConnect Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              Connect with drivers and passengers in just a few simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-semibold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Search for Rides</h3>
              <p className="text-muted-foreground">
                Enter your departure and destination locations, date, and number of passengers to find available rides.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-semibold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Your Seat</h3>
              <p className="text-muted-foreground">
                Choose from available options, review driver profiles and ratings, and book your seat securely.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-semibold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enjoy Your Ride</h3>
              <p className="text-muted-foreground">
                Meet at the designated pickup location, enjoy your journey, and leave a review after your ride.
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center mt-12">
            <Button asChild className="rounded-full">
              <Link to="/search">Find a Ride Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-semibold mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              Join thousands of satisfied users who've transformed their commute
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted"
                        }`}
                      />
                    ))}
                </div>
                
                <p className="text-muted-foreground mb-4">{testimonial.text}</p>
                
                <div className="flex space-x-4 text-muted-foreground text-sm">
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>Helpful</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>Reply</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-semibold mb-6"
            >
              Ready to start your journey?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl opacity-90 mb-8"
            >
              Join thousands of users already saving money and reducing their carbon footprint.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to="/search">Find a Ride</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent border-white text-white hover:bg-white/10">
                <Link to="/offer">Offer a Ride</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
