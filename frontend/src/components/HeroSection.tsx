import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

export const HeroSection = () => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Delicious restaurant scene"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
          <Users className="w-3 h-3 mr-1" />
          Join 50K+ Food Lovers
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Discover Amazing
          <span className="block bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">
            Culinary Experiences
          </span>
        </h1>

        <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
          Share your dining adventures, discover hidden gems, and connect with fellow food enthusiasts. 
          Rate restaurants, upload photos, and find your next favorite meal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button variant="hero" size="lg" className="min-w-[180px]">
            <Star className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
          <Button variant="glass" size="lg" className="min-w-[180px]">
            <MapPin className="w-5 h-5 mr-2" />
            Find Nearby
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="text-sm">Food Lovers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">15K+</div>
            <div className="text-sm">Restaurants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">200K+</div>
            <div className="text-sm">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">500K+</div>
            <div className="text-sm">Photos</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-primary/20 rounded-full animate-float hidden lg:block" />
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-accent/30 rounded-full animate-float animation-delay-1000 hidden lg:block" />
      <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-primary-glow/25 rounded-full animate-float animation-delay-2000 hidden lg:block" />
    </div>
  );
};