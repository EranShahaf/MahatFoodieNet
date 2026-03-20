import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  location: string;
  bio: string;
  joinedYear: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "New Foodie",
  handle: "@newuser",
  avatar: "NF",
  location: "",
  bio: "",
  joinedYear: new Date().getFullYear(),
};

const STORAGE_PREFIX = "foodienet-profile-";

function profileKeyFor(username: string) {
  return `${STORAGE_PREFIX}${username.toLowerCase()}`;
}

function makeInitials(name: string): string {
  return name && name.length > 0
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "NF";
}

function defaultProfileFor(username: string): UserProfile {
  return {
    ...DEFAULT_PROFILE,
    name: username,
    handle: `@${username}`,
    avatar: makeInitials(username),
  };
}

function loadProfile(username: string): UserProfile {
  try {
    const raw = localStorage.getItem(profileKeyFor(username));
    if (raw) {
      const base = defaultProfileFor(username);
      return { ...base, ...JSON.parse(raw) };
    }
  } catch {
    /* ignore */
  }
  return defaultProfileFor(username);
}

interface ProfileContextValue {
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const username = user?.username ?? "";

  const [profile, setProfile] = useState<UserProfile>(() =>
    username ? loadProfile(username) : DEFAULT_PROFILE
  );

  useEffect(() => {
    if (username) {
      setProfile(loadProfile(username));
    } else {
      setProfile(DEFAULT_PROFILE);
    }
  }, [username]);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        if (username) {
          localStorage.setItem(profileKeyFor(username), JSON.stringify(next));
        }
        return next;
      });
    },
    [username]
  );

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
