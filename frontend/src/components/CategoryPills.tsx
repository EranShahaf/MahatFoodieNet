import { motion } from "framer-motion";
import { Flame, Pizza, Fish, Cake, Salad, Coffee, Beef, Soup } from "lucide-react";

const categories = [
  { name: "Trending", icon: Flame },
  { name: "Pizza", icon: Pizza },
  { name: "Sushi", icon: Fish },
  { name: "Desserts", icon: Cake },
  { name: "Healthy", icon: Salad },
  { name: "Coffee", icon: Coffee },
  { name: "BBQ", icon: Beef },
  { name: "Soup", icon: Soup },
];

interface CategoryPillsProps {
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

const CategoryPills = ({ activeTag, onTagChange }: CategoryPillsProps) => {
  return (
    <div className="py-4 overflow-x-auto scrollbar-hide">
      <div className="container">
        <div className="flex gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive =
              cat.name === "Trending" ? activeTag === null : activeTag === cat.name;
            return (
              <motion.button
                key={cat.name}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  onTagChange(cat.name === "Trending" ? null : cat.name)
                }
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryPills;
