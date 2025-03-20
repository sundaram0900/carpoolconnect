
import { Shield, Clock, CreditCard, Map, Zap, Users, Leaf, Gift } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Feature = ({ icon, title, description, delay }: FeatureProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="mb-4 p-3 bg-primary/10 rounded-full text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Profiles",
      description: "All drivers are verified for your safety and peace of mind.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Scheduling",
      description: "Find rides that match your schedule, any day of the week.",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Pay securely through our platform with multiple payment options.",
    },
    {
      icon: <Map className="h-6 w-6" />,
      title: "Route Tracking",
      description: "Real-time tracking for all your rides for maximum convenience.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Matching",
      description: "Our algorithm quickly matches you with the best available rides.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Ratings",
      description: "Transparent rating system ensures quality experiences.",
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Eco-Friendly",
      description: "Reduce your carbon footprint by sharing rides with others.",
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Rewards Program",
      description: "Earn points for every ride and redeem for discounts.",
    },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Why Choose CarpoolConnect</h2>
          <p className="text-muted-foreground text-lg">
            Our platform offers everything you need for safe, convenient, and affordable carpooling.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
