import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Container, Row, Col, Card, Button, Tab, Tabs } from 'react-bootstrap';
import type { Route } from "../+types/detail";
import Layout from '~/components/Layout';
import PostCard from '~/components/PostCard';
import LoadingSpinner from '~/components/LoadingSpinner';
import ErrorAlert from '~/components/ErrorAlert';
import { api, type Profile, type Post } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.username} - Profile - RustyPython` },
    { name: "description", content: `View ${params.username}'s profile and posts on RustyPython` },
  ];
}

export default function ProfileDetail() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (username) {
      loadProfile();
      loadUserPosts();
    }
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await api.getProfileByUsername(username!);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const result = await api.filterPosts({ 
        author_name: username,
        sort_by: 'DATE'
      });
      const postPromises = result.post_ids.map((id: number) => api.getPost(id));
      const postsData = await Promise.all(postPromises);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading profile..." />
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <Container>
          <ErrorAlert error={error || 'Profile not found'} />
        </Container>
      </Layout>
    );
  }

  const isOwnProfile = user && user.user.id === profile.user.id;

  return (
    <Layout>
      <Container>
        {/* Profile Header */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={3} className="text-center mb-3 mb-md-0">
                {profile.profile_picture ? (
                  <img
                    src={api.getImageUrl(profile.profile_picture)}
                    alt={profile.user.username}
                    className="rounded-circle shadow-sm"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mx-auto shadow-sm"
                    style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                  >
                    {profile.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </Col>
              <Col md={6}>
                <h2 className="mb-2">{profile.user.username}</h2>
                {profile.biography && (
                  <p className="text-muted mb-3">{profile.biography}</p>
                )}
                <div className="d-flex gap-4 text-muted">
                  <div>
                    <strong>{posts.length}</strong> posts
                  </div>
                  <div>
                    <strong>0</strong> followers
                  </div>
                  <div>
                    <strong>0</strong> following
                  </div>
                </div>
              </Col>
              <Col md={3} className="text-md-end">
                {isOwnProfile ? (
                  <Button variant="outline-primary" href="/settings">
                    <i className="bi bi-gear me-1"></i>
                    Edit Profile
                  </Button>
                ) : (
                  <Button variant="primary">
                    <i className="bi bi-person-plus me-1"></i>
                    Follow
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Profile Content */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'posts')}
          className="mb-4"
        >
          <Tab eventKey="posts" title={`Posts (${posts.length})`}>
            {posts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-journal-x display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">No posts yet</h4>
                <p className="text-muted">
                  {isOwnProfile 
                    ? "Start sharing your thoughts with the world!" 
                    : `${profile.user.username} hasn't posted anything yet.`
                  }
                </p>
                {isOwnProfile && (
                  <Button variant="primary" href="/write">
                    Write Your First Post
                  </Button>
                )}
              </div>
            ) : (
              <Row>
                {posts.map((post) => (
                  <Col key={post.id} lg={4} md={6} className="mb-4">
                    <PostCard post={post} onLikeChange={loadUserPosts} />
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
          
          <Tab eventKey="about" title="About">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5>About {profile.user.username}</h5>
                {profile.biography ? (
                  <p className="text-muted">{profile.biography}</p>
                ) : (
                  <p className="text-muted fst-italic">
                    {isOwnProfile 
                      ? "Add a bio to tell people more about yourself."
                      : "This user hasn't added a bio yet."
                    }
                  </p>
                )}
                
                <hr />
                
                <div className="row">
                  <div className="col-sm-6">
                    <strong>Member since:</strong>
                    <p className="text-muted">Recently joined</p>
                  </div>
                  <div className="col-sm-6">
                    <strong>Total posts:</strong>
                    <p className="text-muted">{posts.length} posts</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </Layout>
  );
}