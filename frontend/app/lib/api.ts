// API configuration and helper functions
const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: number;
  username: string;
}

export interface Profile {
  user: User;
  biography: string;
  profile_picture: number | null;
}

export interface Post {
  id: number;
  profile: Profile;
  title: string;
  content: string;
  image: number | null;
  tags: string[];
}

export interface Comment {
  id: number;
  post: number;
  author_profile: Profile;
  content: string;
}

export interface Bookmark {
  id: number;
  post: Post;
  creator_profile: Profile;
  title: string;
}

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json().catch(() => null);
  }

  // Auth endpoints
  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async changePassword(newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }

  // Profile endpoints
  async getProfile(userId: number): Promise<Profile> {
    return this.request(`/user/by-id/${userId}/profile`);
  }

  async getProfileByUsername(username: string): Promise<Profile> {
    return this.request(`/user/by-name/${username}/profile`);
  }

  async getMyProfile(): Promise<Profile> {
    return this.request('/user/me/profile');
  }

  async updateProfile(userId: number, data: { biography?: string; profile_picture?: File | null }) {
    return this.request(`/user/by-id/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Post endpoints
  async getPost(postId: number): Promise<Post> {
    return this.request(`/post/by-id/${postId}`);
  }

  async updatePost(postId: number, data: { title: string; content: string; image: number | null; tags: string[] }) {
    return this.request(`/post/by-id/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: number) {
    return this.request(`/post/by-id/${postId}`, {
      method: 'DELETE',
    });
  }

  async publishDraft(postId: number) {
    return this.request(`/post/by-id/${postId}`, {
      method: 'POST',
    });
  }

  // Filter posts
  async filterPosts(filters: {
    author_id?: number;
    author_name?: string;
    keywords?: string[];
    tags?: string[];
    sort_by?: 'DATE' | 'LIKES';
  }) {
    return this.request('/filter/', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Comments
  async getComments(postId: number): Promise<Comment[]> {
    return this.request(`/post/${postId}/comments/`);
  }

  async createComment(postId: number, content: string): Promise<Comment> {
    return this.request(`/post/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateComment(commentId: number, content: string): Promise<Comment> {
    return this.request(`/comments/${commentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: number) {
    return this.request(`/comments/${commentId}/`, {
      method: 'DELETE',
    });
  }

  // Likes
  async toggleLike(postId: number) {
    return this.request(`/post/${postId}/like/`, {
      method: 'POST',
    });
  }

  async getLikeStatus(postId: number): Promise<{ liked: boolean }> {
    return this.request(`/post/${postId}/like/`);
  }

  // Bookmarks
  async createBookmark(postId: number, title: string = ''): Promise<Bookmark> {
    return this.request(`/post/${postId}/bookmark/`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return this.request('/bookmarks/');
  }

  async updateBookmark(bookmarkId: number, title: string): Promise<Bookmark> {
    return this.request(`/bookmarks/${bookmarkId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  }

  async deleteBookmark(bookmarkId: number) {
    return this.request(`/bookmarks/${bookmarkId}/`, {
      method: 'DELETE',
    });
  }

  async getBookmarkStatus(postId: number): Promise<{ bookmarked: boolean }> {
    return this.request(`/post/${postId}/bookmark/`);
  }

  async deleteBookmarkByPost(postId: number) {
    return this.request(`/post/${postId}/bookmark/`, {
      method: 'DELETE',
    });
  }

  // Drafts
  async createDraft() {
    return this.request('/drafts/', {
      method: 'POST',
    });
  }

  async getDrafts() {
    return this.request('/drafts/');
  }

  // Images
  getImageUrl(imageId: number): string {
    return `${API_BASE_URL}/image/${imageId}`;
  }
}

export const api = new ApiClient();