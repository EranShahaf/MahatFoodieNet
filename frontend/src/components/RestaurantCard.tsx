import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Star, MapPin, DollarSign } from "lucide-react";
import { useState } from "react";

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  image: string;
  rating: number;
  priceRange: number;
  reviewCount: number;
  userReview?: {
    rating: number;
    comment: string;
    photos: string[];
    userName: string;
    userAvatar: string;
    date: string;
  };
  isLiked?: boolean;
}

export const RestaurantCard = ({ 
  name, 
  cuisine, 
  location, 
  image, 
  rating, 
  priceRange, 
  reviewCount,
  userReview,
  isLiked = false 
}: RestaurantCardProps) => {
  const [liked, setLiked] = useState(isLiked);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
    ));
  };

  const renderPriceRange = (price: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <DollarSign
        key={i}
        className={`w-3 h-3 ${
          i < price ? "text-primary" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 bg-card">
      {/* Restaurant Image */}
      <div className="relative h-48 bg-gradient-subtle">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Button
            variant="glass"
            size="icon"
            onClick={() => setLiked(!liked)}
            className="rounded-full"
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Restaurant Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
            <Badge variant="secondary" className="text-xs">
              {cuisine}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </div>
            <div className="flex items-center">
              {renderPriceRange(priceRange)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(Math.floor(rating))}
            </div>
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* User Review (if exists) */}
        {userReview && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <img 
                src={userReview.userAvatar} 
                alt={userReview.userName}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium">{userReview.userName}</span>
              <span className="text-xs text-muted-foreground">{userReview.date}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {renderStars(userReview.rating)}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {userReview.comment}
            </p>

            {userReview.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {userReview.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4" />
              Comment
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
          <Button variant="warm" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};