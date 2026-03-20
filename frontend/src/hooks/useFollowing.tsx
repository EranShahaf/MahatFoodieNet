import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface FollowingContextValue {
  handles: Set<string>;
  toggle: (handle: string) => void;
  isFollowing: (handle: string) => boolean;
  count: number;
}

const STORAGE_KEY = "foodienet_following";

function loadHandles(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* corrupt data — start fresh */
  }
  return new Set();
}

function persistHandles(handles: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...handles]));
}

const FollowingContext = createContext<FollowingContextValue | null>(null);

export function FollowingProvider({ children }: { children: ReactNode }) {
  const [handles, setHandles] = useState(loadHandles);

  const toggle = useCallback((handle: string) => {
    setHandles((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      persistHandles(next);
      return next;
    });
  }, []);

  const isFollowing = useCallback(
    (handle: string) => handles.has(handle),
    [handles]
  );

  return (
    <FollowingContext.Provider
      value={{ handles, toggle, isFollowing, count: handles.size }}
    >
      {children}
    </FollowingContext.Provider>
  );
}

export function useFollowing() {
  const ctx = useContext(FollowingContext);
  if (!ctx)
    throw new Error("useFollowing must be used within FollowingProvider");
  return ctx;
}
