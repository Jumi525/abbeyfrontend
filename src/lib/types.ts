export type User = {
  name: string;
  id: string;
  email: string;
};

type UserCount = {
  followers: number;
  following: number;
  connections: number;
  Notification: number;
  posts: number;
};

export type UserProfile = {
  id: string;
  name: string;
  userCount?: number;
  email: string;
  bio: string | null;
  headline: string | null;
  profilePhoto: string | null;
  coverPhoto: string | null;
  location: string | null;
  skills: string[];
  createdAt: string;
  _count: UserCount;
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  media: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    userCount: number;
    email: string;
    password?: string;
    bio: string | null;
    headline: string | null;
    profilePhoto: string | null;
    coverPhoto: string | null;
    location: string | null;
    skills: string[];
    createdAt: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

export type ConnectionStatus = "PENDING" | "CONNECTED";

export type Connection = {
  id: string;
  userId: string;
  targetId: string;
  status: ConnectionStatus;
  createdAt: string;
  user: User;
  target: User;
};

export interface UserCounts {
  connections: number;
  followers: number;
}

export interface UserDiscover {
  id: string;
  name: string;
  headline: string | null;
  location: string | null;
  bio: string | null;
  profilePhoto: string | null;
  _count: UserCounts;
}
