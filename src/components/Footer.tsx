
import { Link } from "react-router-dom";
import { Car, Mail, Phone, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/70 backdrop-blur-sm py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <Link to="/" className="text-primary font-bold text-xl flex items-center">
              <Car className="w-5 h-5 mr-2" />
              CarpoolConnect
            </Link>
            <p className="text-muted-foreground max-w-xs">
              The sustainable way to travel. Connect with drivers and passengers going your way.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Rides
                </Link>
              </li>
              <li>
                <Link to="/offer" className="text-muted-foreground hover:text-primary transition-colors">
                  Offer a Ride
                </Link>
              </li>
              <li>
                <Link to="/request" className="text-muted-foreground hover:text-primary transition-colors">
                  Request a Ride
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-medium text-lg mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                <span className="text-muted-foreground">
                  123 Carpool Lane, San Francisco, CA
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <a href="mailto:contact@carpoolconnect.com" className="text-muted-foreground hover:text-primary transition-colors">
                  contact@carpoolconnect.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} CarpoolConnect. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0 flex items-center">
            Made with <Heart className="h-3 w-3 text-red-500 mx-1" /> for the environment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
