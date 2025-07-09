import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Profile, Post } from "../types/api";
import { makeAuthenticatedRequest } from "../utils/auth";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfilePicture from "../components/ProfilePicture";
import { useNavigate } from "react-router";

const ProfileView: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editPic, setEditPic] = useState<number | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
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
        setEditPic(prof.profile_picture);
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
  const handlePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      async function bufferToBase64(buffer: any) {
        const base64url: any = await new Promise(r => {
          const reader = new FileReader()
          reader.onload = () => r(reader.result)
          reader.readAsDataURL(new Blob([buffer]))
        });
        return base64url.slice(base64url.indexOf(',') + 1);
      }

      const response = await makeAuthenticatedRequest("/api/image/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: file.type.split("/")[1].toUpperCase(), data: await bufferToBase64(await file.arrayBuffer()) }),
      });
      setEditPic((await response.json()).id)
    }
  };
  const handlePicClick = () => fileInputRef.current?.click();

  const handleSaveBio = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await makeAuthenticatedRequest("/api/user/me/profile", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ biography: editBio }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 500) {
          throw new Error("Server error occurred while updating profile. Please try again later.");
        }
        throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
      }
      const responseText = await response.text();
      if (responseText) {
        const data = JSON.parse(responseText);
        const updatedProfile = data.profile ? data.profile : data;
        setProfile(updatedProfile);
      } else {
        setProfile(prev => prev ? { ...prev, biography: editBio } : prev);
      }
      setIsEditingBio(false);
    } catch (err: any) {
      console.error("Biography save error:", err);
      setError(err.message || "An error occurred while saving your biography. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editBio !== (profile?.biography || "") || editPic != null) {
        // Only update biography if it has changed
        const response = await makeAuthenticatedRequest("/api/user/me/profile", {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ biography: editBio, profile_picture: editPic }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          // Check if this is a server error
          if (response.status === 500) {
            throw new Error("Server error occurred while updating profile. Please try again later.");
          }
          throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
        }
        const responseText = await response.text();
        if (responseText) {
          const data = JSON.parse(responseText);
          const updatedProfile = data.profile ? data.profile : data;
          setProfile(updatedProfile);
          setEditBio(""); // Clear the bio field after successful save
        } else {
          // If no response body, just update the local state
          setProfile(prev => prev ? { ...prev, biography: editBio } : prev);
          setEditBio(""); // Clear the bio field after successful save
        }
      }
    } catch (err: any) {
      console.error("Profile save error:", err);
      // Provide user-friendly error messages
      if (err.message.includes("No module named 'PIL'") || err.message.includes("ModuleNotFoundError")) {
        setError("Image upload is currently unavailable. The server needs to install image processing libraries. Please try updating your biography only, or contact support.");
      } else if (err.message.includes("Network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "An error occurred while saving your profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={9} lg={7} xl={6}>
            <Card style={{ borderRadius: '15px' }} className="mb-4">
              <Card.Body className="p-4">
                {loading && <LoadingSpinner />}
                {error && <div className="alert alert-danger">{error}</div>}
                {!loading && !error && profile && (
                  <div className="d-flex text-dark">
                    {/* Profile Image Section */}
                    <div className="flex-shrink-0">
                      <ProfilePicture
                        id={editPic != null ? editPic : profile.profile_picture}
                        alt="Profile"
                        width={180}
                        height={180}
                        className="cursor-pointer"
                        onClick={handlePicClick}
                        style={{ 
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handlePicChange}
                      />
                      {/* Save Picture Button - appears when new image is selected */}
                      {editPic && (
                        <div className="mt-2 d-flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={handleSave} 
                            disabled={saving}
                            className="flex-grow-1"
                          >
                            {saving ? "Saving..." : "Save Picture"}
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => setEditPic(null)}
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Profile Info Section */}
                    <div className="flex-grow-1 ms-3">
                      <Card.Title className="mb-3">{profile.user.username}</Card.Title>
                      
                      {/* Biography Section with Inline Editing */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 text-muted">Biography</h6>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => setIsEditingBio(!isEditingBio)}
                          >
                            {isEditingBio ? 'Cancel' : 'Edit'}
                          </Button>
                        </div>
                        
                        {!isEditingBio ? (
                          <div 
                            className="p-3 rounded border bg-light"
                            style={{ minHeight: '80px', cursor: 'pointer' }}
                            onClick={() => setIsEditingBio(true)}
                          >
                            {profile.biography ? (
                              <p className="mb-0">{profile.biography}</p>
                            ) : (
                              <p className="mb-0 text-muted fst-italic">
                                Click here to add your biography...
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={editBio}
                              onChange={handleBioChange}
                              disabled={saving}
                              placeholder="Tell us about yourself..."
                              className="mb-2"
                              autoFocus
                            />
                            <div className="d-flex gap-2">
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={handleSaveBio}
                                disabled={saving || editBio === (profile?.biography || "")}
                              >
                                {saving ? "Saving..." : "Save Biography"}
                              </Button>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => {
                                  setIsEditingBio(false);
                                  setEditBio(profile?.biography || "");
                                }}
                                disabled={saving}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats Section */}
                      <div className="d-flex justify-content-start rounded-3 p-2 mb-3" style={{ backgroundColor: '#efefef' }}>
                        <div>
                          <p className="small text-muted mb-1">Posts</p>
                          <p className="mb-0 fw-bold">{posts.length}</p>
                        </div>
                        <div className="px-3">
                          <p className="small text-muted mb-1">Total Likes</p>
                          <p className="mb-0 fw-bold">{posts.reduce((total, post) => total + post.like_count, 0)}</p>
                        </div>
                        <div>
                          <p className="small text-muted mb-1">Comments</p>
                          <p className="mb-0 fw-bold">{posts.reduce((total, post) => total + post.comment_count, 0)}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex pt-1">
                        <Button variant="primary" className="w-100" onClick={() => navigate("/create")}>
                          Create New Post
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {!loading && !error && !profile && <div>No profile data found.</div>}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Posts Section */}
        <Row className="justify-content-center mt-4">
          <Col md={9} lg={7} xl={6}>
            <Card style={{ borderRadius: '15px' }}>
              <Card.Header>
                <h5 className="mb-0">My Posts</h5>
              </Card.Header>
              <Card.Body>
                {posts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No posts found.</p>
                    <Button variant="primary" onClick={() => navigate("/create")}>Create Your First Post</Button>
                  </div>
                ) : (
                  <Row className="g-3">
                    {posts.map((post) => (
                      <Col md={6} key={post.id}>
                        <Card className="h-100" onClick={() => navigate(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
                          {post.image && <Card.Img variant="top" src={post.image} style={{ height: '150px', objectFit: 'cover' }} />}
                          <Card.Body>
                            <Card.Title className="h6">{post.title}</Card.Title>
                            <Card.Text className="small text-muted">
                              {post.content ? (post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content) : "No content"}
                            </Card.Text>
                            <div className="d-flex justify-content-between small text-muted">
                              <span>{post.like_count} likes</span>
                              <span>{post.comment_count} comments</span>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileView;
