import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface FavoritesContextValue {
  ids: Set<string>;
  toggle: (postId: string) => void;
  isSaved: (postId: string) => boolean;
}

const STORAGE_KEY = "foodienet_favorites";

function loadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* corrupt data — start fresh */
  }
  return new Set();
}

function persistIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState(loadIds);

  const toggle = useCallback((postId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      persistIds(next);
      return next;
    });
  }, []);

  const isSaved = useCallback((postId: string) => ids.has(postId), [ids]);

  return (
    <FavoritesContext.Provider value={{ ids, toggle, isSaved }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
