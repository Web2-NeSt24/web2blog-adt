// API types based on backend serializers
export interface User {
  id: number;
  username: string;
}

export interface Profile {
  user: User;
  biography: string;
  profile_picture: number | null;
  post_ids: number[];
}

export interface Post {
  id: number;
  profile: Profile;
  title: string;
  content: string;
  image: number | null;
  tags: string[];
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  draft: boolean;
}

export interface Comment {
  id: number;
  post: Post;
  author_profile: Profile;
  content: string;
}

export interface Bookmark {
  id: number;
  post: Post;
  creator_profile: Profile;
  title: string;
}
