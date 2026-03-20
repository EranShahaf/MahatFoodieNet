import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, UserPlus, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/feed";

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
} as const;

const colorMap = {
  like: "text-primary bg-primary/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-emerald-500 bg-emerald-500/10",
} as const;

function notificationText(n: Notification): string {
  switch (n.type) {
    case "like":
      return `liked your post "${n.postTitle}"`;
    case "comment":
      return `commented on "${n.postTitle}"`;
    case "follow":
      return "started following you";
  }
}

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="container max-w-2xl py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-1">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 text-sm">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n, i) => {
              const Icon = iconMap[n.type];
              const colors = colorMap[n.type];

              const content = (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`flex items-start gap-3 rounded-xl p-3 transition-colors cursor-pointer ${
                    n.read
                      ? "hover:bg-muted/50"
                      : "bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">
                        {n.user.avatar}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center ${colors}`}
                    >
                      <Icon
                        className={`h-2.5 w-2.5 ${n.type === "like" ? "fill-current" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{n.user.name}</span>{" "}
                      {notificationText(n)}
                    </p>
                    {n.type === "comment" && n.commentText && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        &ldquo;{n.commentText}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </p>
                  </div>

                  {!n.read && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </motion.div>
              );

              if (n.postId) {
                return (
                  <Link
                    key={n.id}
                    to="/"
                    className="block"
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    {content}
                  </Link>
                );
              }

              return content;
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Notifications;
