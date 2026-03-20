import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFeed } from "@/hooks/useFeed";
import { useProfile } from "@/hooks/useProfile";
import type { FeedPost } from "@/types/feed";

interface CommentsSheetProps {
  post: FeedPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommentsSheet = ({ post, open, onOpenChange }: CommentsSheetProps) => {
  const { addComment, getComments } = useFeed();
  const { profile } = useProfile();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const comments = post ? getComments(post.id) : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !text.trim()) return;

    try {
      await addComment(post.id, text.trim());
      setText("");
    } catch (e) {
      // toast is handled in useFeed
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl px-0">
        <SheetHeader className="px-6 pb-3 border-b border-border">
          <SheetTitle className="text-base">
            Comments{post ? ` (${post.comments})` : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            View and add comments on this post
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(70vh-140px)]">
          <div className="px-6 py-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-xs font-bold">
                      {comment.user.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-0.5">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-3 flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold">
              {profile.avatar}
            </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 rounded-full text-primary disabled:opacity-40 hover:bg-primary/10 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsSheet;
