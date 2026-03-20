import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, UserCheck } from "lucide-react";
import { useFollowing } from "@/hooks/useFollowing";
import { api } from "@/lib/api";

const SuggestedUsers = () => {
  const { toggle, isFollowing } = useFollowing();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then(data => {
        // filter out admin or ourselves if wanted, but fine for now
        // just take top 5
        setUsers(data.slice(0, 5));
      })
      .catch((e) => console.error("Failed to load suggested users"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">Foodies to Follow</h2>

      <div className="space-y-3">
        {users.map((user) => {
          const handle = `@${user.username}`;
          const following = isFollowing(handle);
          const initials = user.username.substring(0, 2).toUpperCase();
          const role = user.roles?.[0] || 'Foodie';
          
          return (
            <div key={user.id} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
              <button
                onClick={() => toggle(handle)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  following
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {following ? (
                  <>
                    <UserCheck className="h-3 w-3" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3" />
                    Follow
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </motion.aside>
  );
};

export default SuggestedUsers;
