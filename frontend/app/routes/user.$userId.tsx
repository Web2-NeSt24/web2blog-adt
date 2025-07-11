import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { Profile, Post } from "../types/api";
import { makeAuthenticatedRequest } from "../utils/auth";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfilePicture from "../components/ProfilePicture";
import { PostCard } from "~/components/Card";

const UserProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (user && userId && parseInt(userId) === user.id) {
      navigate('/profile', { replace: true });
      return;
    }
  }, [user, userId, navigate]);

  // Fetch profile data and posts
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await makeAuthenticatedRequest(`/api/user/by-id/${userId}/profile`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          throw new Error("Failed to fetch profile");
        }
        
        const data = await response.json();
        const prof = data.profile || data;
        setProfile(prof);
        
        // Fetch posts if available
        if (prof.post_ids?.length > 0) {
          const postsData: Post[] = await Promise.all(
            prof.post_ids.map(async (id: number) => {
              const res = await makeAuthenticatedRequest(`/api/post/by-id/${id}`);
              return res.ok ? await res.json() : null;
            })
          );
          // Only show published posts (not drafts) for other users
          setPosts(postsData.filter(post => post && !post.draft));
        } else {
          setPosts([]);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading the profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const totalLikes = posts.reduce((total, post) => total + post.like_count, 0);
  const totalComments = posts.reduce((total, post) => total + post.comment_count, 0);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="text-center py-5">
        <p>Profile not found.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
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
                <Row className="align-items-center">
                  <Col xs={12} sm={4} md={3} className="text-center mb-3 mb-sm-0">
                    <div className="position-relative d-inline-block">
                      <ProfilePicture 
                        id={profile.profile_picture} 
                        width={120}
                        height={120}
                        className="rounded-circle"
                        style={{
                          border: '4px solid #dee2e6',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={12} sm={8} md={9}>
                    <div className="profile-info">
                      <h2 className="mb-1" style={{ fontWeight: '600' }}>
                        {profile.user?.username || 'Unknown User'}
                      </h2>
                      
                      <Row className="text-center mt-3">
                        <Col xs={4}>
                          <div className="stat-item">
                            <h5 className="mb-0" style={{ color: '#495057', fontWeight: '600' }}>
                              {posts.length}
                            </h5>
                            <small className="text-muted">Posts</small>
                          </div>
                        </Col>
                        <Col xs={4}>
                          <div className="stat-item">
                            <h5 className="mb-0" style={{ color: '#495057', fontWeight: '600' }}>
                              {totalLikes}
                            </h5>
                            <small className="text-muted">Likes</small>
                          </div>
                        </Col>
                        <Col xs={4}>
                          <div className="stat-item">
                            <h5 className="mb-0" style={{ color: '#495057', fontWeight: '600' }}>
                              {totalComments}
                            </h5>
                            <small className="text-muted">Comments</small>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Biography Section */}
            <Card style={{ borderRadius: '15px' }} className="mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-3" style={{ fontWeight: '600' }}>About</h5>
                <p className="mb-0" style={{ lineHeight: '1.6' }}>
                  {profile.biography || "This user hasn't written a biography yet."}
                </p>
              </Card.Body>
            </Card>

            {/* Posts Section */}
            <Card style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <h5 className="mb-4" style={{ fontWeight: '600' }}>
                  Posts ({posts.length})
                </h5>
                
                {posts.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <i className="bi bi-file-text" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    </div>
                    <h6 className="text-muted">No posts yet</h6>
                    <p className="text-muted mb-0">
                      This user hasn't published any posts yet.
                    </p>
                  </div>
                ) : (
                  <Row>
                    {posts.map((post) => (
                      <Col xs={12} sm={6} lg={4} key={post.id} className="mb-4">
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

export default UserProfileView;
