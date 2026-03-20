import { Search, Bell, Home, PlusSquare, Heart, User, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useNotifications } from "@/hooks/useNotifications";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/add-review", icon: PlusSquare, label: "Add Review" },
  { to: "/favorites", icon: Heart, label: "Favorites" },
  { to: "/profile", icon: User, label: "Profile" },
];

const Header = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/" className="shrink-0 flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-sm group-hover:shadow-soft transition-shadow">
            <UtensilsCrossed className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Foodie<span className="text-primary">Net</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
              connect
            </span>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeClassName="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
