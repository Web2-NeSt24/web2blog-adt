import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Profile, Post } from "../types/api";
import { makeAuthenticatedRequest } from "../utils/auth";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router";

const ProfileView: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editPic, setEditPic] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await makeAuthenticatedRequest("/api/user/me/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        const prof = data.profile ? data.profile : data;
        setProfile(prof);
        setEditBio(prof.biography || "");
        // Fetch posts if post_ids exist
        if (prof.post_ids && prof.post_ids.length > 0) {
          const postsData: Post[] = await Promise.all(
            prof.post_ids.map(async (id: number) => {
              const res = await makeAuthenticatedRequest(`/api/post/by-id/${id}`);
              return res.ok ? await res.json() : null;
            })
          );
          setPosts(postsData.filter(Boolean));
        } else {
          setPosts([]);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBio(e.target.value);
  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setEditPic(e.target.files[0]);
  };
  const handlePicClick = () => fileInputRef.current?.click();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("biography", editBio);
      if (editPic) formData.append("profile_picture", editPic);
      const response = await makeAuthenticatedRequest("/api/user/me/profile", {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update profile");
      const data = await response.json();
      setProfile(data.profile ? data.profile : data);
      setEditPic(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="flex flex-col items-center mt-8 gap-8">
      <Card className="w-full max-w-md p-4 flex flex-col items-center mb-6">
        {loading && <LoadingSpinner />}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && profile && (
          <>
            <div className="flex flex-col items-center w-full">
              <div className="relative mb-4">
                <img
                  src={editPic ? URL.createObjectURL(editPic) : profile.profile_picture || undefined}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border cursor-pointer"
                  onClick={handlePicClick}
                  style={{ objectFit: "cover" }}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handlePicChange}
                />
              </div>
              <h2 className="text-2xl font-bold mb-2">{profile.user.username}</h2>
              <Form.Group className="w-full mb-2">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editBio}
                  onChange={handleBioChange}
                  disabled={saving}
                />
              </Form.Group>
              <Button variant="primary" className="mt-2" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </>
        )}
        {!loading && !error && !profile && <div>No profile data found.</div>}
      </Card>
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">My Posts</h3>
          <Button variant="success" onClick={() => navigate("/create")}>Create New Post</Button>
        </div>
        {posts.length === 0 ? (
          <div>No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="blog-card h-100 cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                {post.image && <Card.Img variant="top" src={post.image} className="card-img-top" />}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="card-title">{post.title}</Card.Title>
                  <Card.Text className="card-text flex-grow-1">
                    {post.content ? (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content) : "No content"}
                  </Card.Text>
                  <div className="tags mb-2">
                    {post.tags && post.tags.length > 0 ? post.tags.map((tag, idx) => <span className="tag" key={idx}>#{tag}</span>) : <span className="tag">No tags</span>}
                  </div>
                  <div className="post-stats mt-2">
                    <small className="text-muted">
                      {post.like_count} likes 3 {post.comment_count} comments 3 {post.bookmark_count} bookmarks
                    </small>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
