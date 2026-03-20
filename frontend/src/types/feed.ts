export interface FeedUser {
  name: string;
  handle: string;
  avatar: string;
  avatarUrl?: string;
}

export interface FeedRestaurant {
  name: string;
  location: string;
  placeId?: string;
}

export interface FeedPost {
  id: string;
  user: FeedUser;
  restaurant: FeedRestaurant;
  image: string;
  title: string;
  rating: number;
  review: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  user: FeedUser;
  text: string;
  createdAt: Date;
}

export type NotificationType = "like" | "comment" | "follow";

export interface Notification {
  id: string;
  type: NotificationType;
  user: FeedUser;
  postId?: string;
  postTitle?: string;
  commentText?: string;
  createdAt: Date;
  read: boolean;
}
