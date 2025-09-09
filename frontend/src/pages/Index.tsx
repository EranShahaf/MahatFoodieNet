import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Star } from "lucide-react";
import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";

const Index = () => {
  const mockRestaurants = [
    {
      id: "1",
      name: "Bella Vista Italian",
      cuisine: "Italian",
      location: "Downtown",
      image: restaurant1,
      rating: 4.8,
      priceRange: 3,
      reviewCount: 124,
      userReview: {
        rating: 5,
        comment: "Absolutely amazing pasta! The atmosphere was perfect for a romantic dinner. Service was exceptional and the wine selection was impressive.",
        photos: [restaurant1],
        userName: "Sarah Chen",
        userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        date: "2 days ago"
      },
      isLiked: true
    },
    {
      id: "2",
      name: "Sakura Sushi House",
      cuisine: "Japanese",
      location: "Midtown",
      image: restaurant2,
      rating: 4.6,
      priceRange: 4,
      reviewCount: 89,
      userReview: {
        rating: 4,
        comment: "Fresh sashimi and beautiful presentation. The chef's special roll was incredible!",
        photos: [restaurant2],
        userName: "Mike Johnson",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        date: "1 week ago"
      }
    },
    {
      id: "3",
      name: "Fiesta Mexicana",
      cuisine: "Mexican",
      location: "Arts District",
      image: restaurant3,
      rating: 4.4,
      priceRange: 2,
      reviewCount: 156,
      userReview: {
        rating: 4,
        comment: "Best tacos in the city! Authentic flavors and great margaritas. The atmosphere is lively and fun.",
        photos: [restaurant3],
        userName: "Anna Rodriguez",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        date: "3 days ago"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Featured Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Trending Reviews
                </h2>
                <p className="text-muted-foreground">
                  See what food lovers are raving about
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Hot Now
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {mockRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>

            <div className="text-center">
              <Button variant="warm" size="lg">
                <Star className="w-4 h-4 mr-2" />
                Explore More Restaurants
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h3 className="text-2xl font-bold mb-8">Ready to Share Your Experience?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                <MapPin className="w-4 h-4 mr-2" />
                Find Restaurants
              </Button>
              <Button variant="outline" size="lg">
                Add Your Review
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile spacing for bottom nav */}
      <div className="h-16 md:h-0" />
    </div>
  );
};

export default Index;
