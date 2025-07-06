// API types based on backend serializers
export interface User {
  id: number;
  username: string;
}

export interface Profile {
  user: User;
  biography: string;
  profile_picture: string | null;
  post_ids: number[];
}

export interface Post {
  id: number;
  profile: Profile;
  title: string;
  content: string;
  image: string | null;
  tags: string[];
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

export interface Comment {
  id: number;
  post: Post;
  author_profile: Profile;
  content: string;
}
