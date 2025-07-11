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
import { handleImageUpload } from "~/utils/image";
import { PostCard } from "~/components/Card";


const formatErrorMessage = (error: any): string => {
  if (error.message?.includes("No module named 'PIL'") || error.message?.includes("ModuleNotFoundError")) {
    return "Image upload is currently unavailable. The server needs to install image processing libraries. Please try updating your biography only, or contact support.";
  }
  if (error.message?.includes("Network")) {
    return "Network error. Please check your connection and try again.";
  }
  return error.message || "An error occurred. Please try again.";
};

const ProfileView: React.FC = () => {
  const { isAuthenticated } = useAuth();
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

  // Fetch profile data and posts
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await makeAuthenticatedRequest("/api/user/me/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        
        const data = await response.json();
        const prof = data.profile || data;
        setProfile(prof);
        setEditBio(prof.biography || "");
        // Don't set editPic to existing profile picture - only set when new image is selected
        
        // Fetch posts if available
        if (prof.post_ids?.length > 0) {
          const postsData: Post[] = await Promise.all(
            prof.post_ids.map(async (id: number) => {
              const res = await makeAuthenticatedRequest(`/api/post/by-id/${id}`);
              return res.ok ? await res.json() : null;
            })
          );
          // Filter out drafts - only show published posts in profile
          setPosts(postsData.filter(post => post && !post.draft));
        } else {
          setPosts([]);
        }
      } catch (err: any) {
        setError(formatErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  // Handle profile picture upload
  const handlePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image_id = await handleImageUpload(e)
    setEditPic(image_id)
  };

  // Save profile updates
  const saveProfile = async (bioOnly = false) => {
    setSaving(true);
    setError(null);
    
    try {
      const body = bioOnly 
        ? { biography: editBio }
        : { biography: editBio, profile_picture: editPic };

      const response = await makeAuthenticatedRequest("/api/user/me/profile", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
        const updatedProfile = data.profile || data;
        setProfile(updatedProfile);
      } else {
        setProfile(prev => prev ? { ...prev, biography: editBio } : prev);
      }

      if (bioOnly) {
        setIsEditingBio(false);
      } else {
        // Update profile state with new picture before clearing editPic
        setProfile(prev => prev ? { ...prev, profile_picture: editPic } : prev);
        // Clear editPic after successful save so buttons disappear
        setEditPic(null);
      }
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const totalLikes = posts.reduce((total, post) => total + post.like_count, 0);
  const totalComments = posts.reduce((total, post) => total + post.comment_count, 0);

  if (!isAuthenticated) {
    return (
      <Container className="text-center py-5">
        <p>Please log in to view your profile.</p>
      </Container>
    );
  }

  return (
    <main style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={11} lg={10} xl={9}>
            <Card style={{ borderRadius: '15px' }} className="mb-4">
              <Card.Body className="p-4">
                {loading && <LoadingSpinner />}
                {error && <div className="alert alert-danger">{error}</div>}
                
                {!loading && !error && profile && (
                  <div className="d-flex text-dark">
                    {/* Profile Image */}
                    <section className="flex-shrink-0 position-relative" style={{ display: 'inline-block' }}>
                      <ProfilePicture
                        id={editPic ?? profile.profile_picture}
                        alt="Profile"
                        width={180}
                        height={180}
                        style={{ borderRadius: '10px', cursor: 'pointer' }}
                      />
                      {/* Edit overlay with pencil icon */}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          top: 0,
                          left: 0,
                          width: '180px',
                          height: '180px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          opacity: 0,
                          transition: 'opacity 0.2s ease-in-out',
                          cursor: 'pointer'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <svg width="24" height="24" fill="white" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L8.5 11.207l-3 1a.5.5 0 0 1-.64-.64l1-3L12.146.146ZM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5Zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5Z"/>
                        </svg>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handlePicChange}
                      />
                      {editPic && (
                        <div className="mt-2 d-flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => saveProfile(false)} 
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
                    </section>
                    
                    {/* Profile Info */}
                    <section className="flex-grow-1 ms-3">
                      <Card.Title className="mb-3">{profile.user.username}</Card.Title>
                      
                      {/* Biography */}
                      <section className="mb-4">
                        <header className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 text-muted">Biography</h6>
                          <Button variant="outline-secondary" size="sm" onClick={() => setIsEditingBio(!isEditingBio)}>
                            {isEditingBio ? 'Cancel' : 'Edit'}
                          </Button>
                        </header>
                        
                        {!isEditingBio ? (
                          <div 
                            className="p-3 rounded border bg-light"
                            style={{ minHeight: '80px', cursor: 'pointer' }}
                            onClick={() => setIsEditingBio(true)}
                          >
                            <p className="mb-0 text-muted fst-italic">
                              {profile.biography || "Click here to add your biography..."}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              value={editBio}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditBio(e.target.value)}
                              disabled={saving}
                              placeholder="Tell us about yourself..."
                              className="mb-2"
                              autoFocus
                            />
                            <div className="d-flex gap-2">
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => saveProfile(true)}
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
                          </>
                        )}
                      </section>

                      {/* Stats */}
                      <section className="d-flex justify-content-start rounded-3 p-2 mb-3" style={{ backgroundColor: '#efefef' }}>
                        <div>
                          <p className="small text-muted mb-1">Posts</p>
                          <p className="mb-0 fw-bold">{posts.length}</p>
                        </div>
                        <div className="px-3">
                          <p className="small text-muted mb-1">Total Likes</p>
                          <p className="mb-0 fw-bold">{totalLikes}</p>
                        </div>
                        <div>
                          <p className="small text-muted mb-1">Comments</p>
                          <p className="mb-0 fw-bold">{totalComments}</p>
                        </div>
                      </section>

                      {/* Action Button */}
                      <div className="d-flex pt-1">
                        <Button 
                          variant="primary" 
                          className="w-100" 
                          onClick={() => navigate("/post/edit/new", { replace: true })}
                        >
                          Create New Post
                        </Button>
                      </div>
                    </section>
                  </div>
                )}
                
                {!loading && !error && !profile && (
                  <div>No profile data found.</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Posts Section */}
        <Row className="justify-content-center mt-4">
          <Col md={11} lg={10} xl={9}>
            <Card style={{ borderRadius: '15px' }}>
              <Card.Header>
                <h5 className="mb-0">My Posts</h5>
              </Card.Header>
              <Card.Body>
                {posts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No posts found.</p>
                    <Button variant="primary" onClick={() => navigate("/post/edit/new")}>
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  <Row className="g-3">
                    {posts.map((post) => (
                      <Col md={6} key={post.id}>
                          <PostCard post={post} />
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ProfileView;
