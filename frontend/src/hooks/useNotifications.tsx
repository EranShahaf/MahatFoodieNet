import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { subMinutes, subHours, subDays } from "date-fns";
import type { Notification, FeedUser } from "@/types/feed";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const STORAGE_KEY = "foodienet_notifications_read";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* start fresh */
  }
  return new Set();
}

function persistReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const now = new Date();

function buildMockNotifications(): Notification[] {
  return [
    {
      id: "n1",
      type: "like",
      user: { name: "James Kim", handle: "@jamesk_foodie", avatar: "JK" },
      postId: "1",
      postTitle: "Spicy Miso Ramen",
      createdAt: subMinutes(now, 12),
      read: false,
    },
    {
      id: "n2",
      type: "comment",
      user: { name: "Anna Lopez", handle: "@anna_eats_world", avatar: "AL" },
      postId: "1",
      postTitle: "Spicy Miso Ramen",
      commentText: "This looks absolutely divine! Where exactly in Florence is this?",
      createdAt: subMinutes(now, 25),
      read: false,
    },
    {
      id: "n3",
      type: "follow",
      user: { name: "Sofia Reyes", handle: "@sofia_bites", avatar: "SR" },
      createdAt: subMinutes(now, 45),
      read: false,
    },
    {
      id: "n4",
      type: "like",
      user: { name: "Emma Chen", handle: "@emma_desserts", avatar: "EC" },
      postId: "4",
      postTitle: "Matcha Crepe Cake",
      createdAt: subHours(now, 1),
      read: false,
    },
    {
      id: "n5",
      type: "comment",
      user: { name: "Raj Patel", handle: "@raj_spiceroute", avatar: "RP" },
      postId: "4",
      postTitle: "Matcha Crepe Cake",
      commentText: "The poke bowls here are unreal. Did you try the spicy ahi version?",
      createdAt: subHours(now, 2),
      read: false,
    },
    {
      id: "n6",
      type: "follow",
      user: { name: "Mia Zhang", handle: "@mia_noodlehead", avatar: "MZ" },
      createdAt: subHours(now, 3),
      read: false,
    },
    {
      id: "n7",
      type: "like",
      user: { name: "Noah Williams", handle: "@noah_grill", avatar: "NW" },
      postId: "6",
      postTitle: "Wagyu Sushi",
      createdAt: subHours(now, 5),
      read: false,
    },
    {
      id: "n8",
      type: "comment",
      user: { name: "Luca Romano", handle: "@luca_mangiaroma", avatar: "LR" },
      postId: "1",
      postTitle: "Spicy Miso Ramen",
      commentText: "My nonna would approve! The tagliatelle looks perfectly al dente.",
      createdAt: subHours(now, 8),
      read: false,
    },
    {
      id: "n9",
      type: "like",
      user: { name: "Claire Fontaine", handle: "@claire_patisserie", avatar: "CF" },
      postId: "21",
      postTitle: "Avocado Toast",
      createdAt: subDays(now, 1),
      read: false,
    },
    {
      id: "n10",
      type: "follow",
      user: { name: "Kenji Watanabe", handle: "@kenji_ramenhead", avatar: "KW" },
      createdAt: subDays(now, 1),
      read: false,
    },
    {
      id: "n11",
      type: "comment",
      user: { name: "Nadia Moreau", handle: "@nadia_brunchclub", avatar: "NM" },
      postId: "6",
      postTitle: "Wagyu Sushi",
      commentText: "Al pastor is my weakness! That pineapple-cilantro combo is perfection.",
      createdAt: subDays(now, 2),
      read: false,
    },
    {
      id: "n12",
      type: "like",
      user: { name: "Daniel Park", handle: "@dan_seoulful", avatar: "DP" },
      postId: "30",
      postTitle: "Truffle Fries",
      createdAt: subDays(now, 3),
      read: false,
    },
  ];
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const readIds = loadReadIds();
    return buildMockNotifications().map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }));
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (input: Omit<Notification, "id" | "createdAt" | "read">) => {
      const n: Notification = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        read: false,
      };
      setNotifications((prev) => [n, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      const readIds = new Set(next.filter((n) => n.read).map((n) => n.id));
      persistReadIds(readIds);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      const readIds = new Set(next.map((n) => n.id));
      persistReadIds(readIds);
      return next;
    });
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
