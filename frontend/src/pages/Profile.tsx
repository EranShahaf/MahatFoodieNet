import { useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Pencil,
  Star,
  ImageIcon,
  BookOpen,
  Heart,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useFollowing } from "@/hooks/useFollowing";
import { useProfile } from "@/hooks/useProfile";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/hooks/useAuth";
import FeedCard from "@/components/FeedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const Profile = () => {
  const { count: followingCount } = useFollowing();
  const { profile, updateProfile } = useProfile();
  const { posts } = useFeed();
  const { logout } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(profile);

  const myPosts = useMemo(
    () => posts.filter((p) => p.user.handle === profile.handle),
    [posts, profile.handle]
  );

  const totalLikes = useMemo(
    () => myPosts.reduce((sum, p) => sum + p.likes, 0),
    [myPosts]
  );

  const galleryImages = useMemo(
    () => myPosts.map((p) => ({ id: p.id, src: p.image, alt: p.title, rating: p.rating })),
    [myPosts]
  );

  function handleOpenEdit() {
    setDraft(profile);
    setEditOpen(true);
  }

  function handleSave() {
    updateProfile(draft);
    setEditOpen(false);
  }

  return (
    <div className="container max-w-3xl py-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        {/* ── Profile header ──────────────────────────────────── */}
        <section className="rounded-2xl bg-card border border-border shadow-card p-6 md:p-8 space-y-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-2xl font-bold text-primary-foreground shadow-soft">
              {profile.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground truncate">
                {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.handle}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined {profile.joinedYear}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0 items-end">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full"
                    onClick={handleOpenEdit}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your public profile information.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-name">Display name</Label>
                      <Input
                        id="edit-name"
                        value={draft.name}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={draft.location}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, location: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-bio">Bio</Label>
                      <Textarea
                        id="edit-bio"
                        rows={3}
                        value={draft.bio}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, bio: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={logout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>

          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )}
        </section>

        {/* ── Stats row ───────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: "Reviews", value: myPosts.length },
            { label: "Photos", value: galleryImages.length },
            { label: "Likes", value: totalLikes },
            { label: "Following", value: followingCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-card border border-border p-3 shadow-card"
            >
              <p className="text-lg md:text-xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Reviews / Photos tabs ───────────────────────────── */}
        <Tabs defaultValue="reviews">
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0 border-b border-border rounded-none">
            <TabsTrigger
              value="reviews"
              className="gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BookOpen className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="photos"
              className="gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ImageIcon className="h-4 w-4" />
              Photos
            </TabsTrigger>
          </TabsList>

          {/* -- Reviews tab -- */}
          <TabsContent value="reviews" className="pt-4">
            <AnimatePresence mode="wait">
              {myPosts.length > 0 ? (
                <motion.div
                  key="reviews-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {myPosts.map((post, i) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.35 }}
                      className="flex gap-4 rounded-2xl bg-card border border-border shadow-card p-4 hover:shadow-soft transition-shadow"
                    >
                      <Link
                        to={
                          post.restaurant.placeId
                            ? `/restaurant/${post.restaurant.placeId}`
                            : "#"
                        }
                        className="shrink-0"
                      >
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground truncate">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="h-3.5 w-3.5 text-star fill-star" />
                            <span className="text-xs font-semibold text-star">
                              {post.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={
                            post.restaurant.placeId
                              ? `/restaurant/${post.restaurant.placeId}`
                              : "#"
                          }
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{post.restaurant.name}</span>
                        </Link>
                        <p className="text-sm text-foreground/80 line-clamp-2">
                          {post.review}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {post.comments}
                          </span>
                          <span>
                            {formatDistanceToNow(post.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* -- Photos tab -- */}
          <TabsContent value="photos" className="pt-4">
            <AnimatePresence mode="wait">
              {galleryImages.length > 0 ? (
                <motion.div
                  key="photos-grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {galleryImages.map((img, i) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs font-medium text-white truncate">
                          {img.alt}
                        </span>
                        <span className="flex items-center gap-0.5 text-white">
                          <Star className="h-3 w-3 fill-star text-star" />
                          <span className="text-xs font-semibold">
                            {img.rating.toFixed(1)}
                          </span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl bg-muted/30 border border-dashed border-border p-10 text-center space-y-2"
    >
      <p className="text-muted-foreground text-sm font-medium">
        Nothing here yet
      </p>
      <p className="text-muted-foreground/60 text-xs">
        Share your first food experience with the community!
      </p>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <Link to="/add-review">Write a review</Link>
      </Button>
    </motion.div>
  );
}

export default Profile;
