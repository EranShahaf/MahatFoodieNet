import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/add-review", icon: PlusSquare, label: "Review" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
  { to: "/profile", icon: User, label: "Profile" },
];

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground transition-colors"
              activeClassName="text-primary"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
