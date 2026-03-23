import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { FeedPost, FeedUser, FeedRestaurant, Comment } from "@/types/feed";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface NewPostInput {
  imageFile?: File; // changed from string to File to support presigned URL upload
  image?: string;
  title: string;
  rating: number;
  review: string;
  tags: string[];
  restaurant: FeedRestaurant;
}

interface FeedContextValue {
  posts: FeedPost[];
  loading: boolean;
  refreshPosts: () => Promise<void>;
  addPost: (input: NewPostInput) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  isLiked: (postId: string) => boolean;
  addComment: (postId: string, text: string) => Promise<void>;
  getComments: (postId: string) => Comment[];
  fetchComments: (postId: string) => Promise<void>;
}

const FeedContext = createContext<FeedContextValue | null>(null);

// Mapper helper
const mapBackendPost = (post: any): FeedPost => {
  let restaurant = { name: "Unknown", location: post.location || "" };
  try {
    if (post.location && post.location.startsWith("{")) {
      restaurant = JSON.parse(post.location);
    }
  } catch (e) {
    // leave as string
  }
  return {
    id: post.id.toString(),
    image: post.image_path || "",
    title: post.title,
    rating: parseFloat(post.rating) || 0,
    review: post.body,
    tags: post.tags || [],
    restaurant,
    user: {
      name: post.username || "User",
      handle: post.username ? `@${post.username}` : "@user",
      avatar: post.username ? post.username.substring(0, 2).toUpperCase() : "U",
    },
    likes: parseInt(post.likes_count || "0", 10),
    comments: parseInt(post.comments_count || "0", 10),
    createdAt: new Date(post.created_at || Date.now()),
  };
};

export function FeedProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Map<string, Comment[]>>(new Map());

  const refreshPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPosts();
      setPosts(data.map(mapBackendPost));
      
      // Also fetch likes for current user if possible, but for simplicity
      // and following previous logic, we can keep likes locally optimistic
      // or fetch from an endpoint if one exists.
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const addPost = useCallback(async (input: NewPostInput) => {
    try {
      let finalImageUrl = input.image || "";

      if (input.imageFile) {
        // Use presigned URL flow
        const presigned = await api.getPresignedUrl(input.imageFile.name || "upload.jpg");
        await api.uploadToMinIO(presigned.uploadUrl, input.imageFile);
        finalImageUrl = presigned.objectName;
      }

      await api.createPost({
        image: finalImageUrl,
        title: input.title,
        rating: input.rating,
        body: input.review,
        tags: input.tags,
        location: JSON.stringify(input.restaurant),
      });

      await refreshPosts();
    } catch (err) {
      console.error("Failed to add post", err);
      toast.error("Failed to create post.");
      throw err;
    }
  }, [refreshPosts]);

  const toggleLike = useCallback(async (postId: string) => {
    const isCurrentlyLiked = likedIds.has(postId);
    
    // Optimistic UI update
    setLikedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, likes: p.likes + (isCurrentlyLiked ? -1 : 1) } 
        : p
    ));

    try {
      if (isCurrentlyLiked) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }
    } catch (err) {
      // Revert on error
      toast.error("Failed to update like status");
      setLikedIds(prev => {
        const next = new Set(prev);
        if (!isCurrentlyLiked) next.delete(postId);
        else next.add(postId);
        return next;
      });
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, likes: p.likes + (!isCurrentlyLiked ? -1 : 1) } 
          : p
      ));
    }
  }, [likedIds]);

  const isLiked = useCallback(
    (postId: string) => likedIds.has(postId),
    [likedIds]
  );

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const data = await api.getPostComments(postId);
      const mapped: Comment[] = data.map((c: any) => ({
        id: c.id.toString(),
        postId: c.post_id.toString(),
        user: {
          name: c.username || "User",
          handle: c.username ? `@${c.username}` : "@user",
          avatar: c.username ? c.username.substring(0, 2).toUpperCase() : "U",
        },
        text: c.message,
        createdAt: new Date(c.created_at || Date.now()),
      }));
      setCommentsMap(prev => {
        const next = new Map(prev);
        next.set(postId, mapped);
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch comments", e);
    }
  }, []);

  const addComment = useCallback(async (postId: string, text: string) => {
    try {
      await api.addComment(postId, text);
      toast.success("Comment added");
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      ));
      
      // Opt UI locally
      const comment: Comment = {
        id: crypto.randomUUID(),
        postId,
        user: { name: "You", handle: "@you", avatar: "Y" },
        text,
        createdAt: new Date(),
      };
      setCommentsMap(prev => {
        const next = new Map(prev);
        const existing = next.get(postId) || [];
        next.set(postId, [...existing, comment]);
        return next;
      });
    } catch (error) {
      toast.error("Failed to add comment");
      throw error;
    }
  }, []);

  const getComments = useCallback(
    (postId: string): Comment[] => commentsMap.get(postId) || [],
    [commentsMap]
  );

  return (
    <FeedContext.Provider
      value={{ posts, loading, refreshPosts, addPost, toggleLike, isLiked, addComment, getComments, fetchComments }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}

