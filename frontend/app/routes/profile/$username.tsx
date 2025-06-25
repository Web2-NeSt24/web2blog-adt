import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface Profile {
  user: {
    id: number;
    username: string;
  };
  biography: string;
  profile_picture: string | null;
  profile_picture_url: string | null;
}

interface Post {
  id: number;
  profile: Profile;
  title: string;
  content: string;
  image: string | null;
  tags: string[];
}

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data
        const profileResponse = await fetch(`/api/user/by-name/${username}/profile`, {
          credentials: 'include',
        });

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            setError('User not found');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch user's posts
        const postsResponse = await fetch('/api/filter/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            author_name: username,
            sort_by: 'DATE'
          }),
          credentials: 'include',
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          
          // Fetch detailed post information for each post ID
          const postPromises = postsData.post_ids.map(async (postId: number) => {
            const postResponse = await fetch(`/api/post/by-id/${postId}`, {
              credentials: 'include',
            });
            if (postResponse.ok) {
              return postResponse.json();
            }
            return null;
          });

          const postsDetails = await Promise.all(postPromises);
          setPosts(postsDetails.filter(post => post !== null));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Profile not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Profile Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  {profile.profile_picture_url ? (
                    <img 
                      src={profile.profile_picture_url} 
                      alt={`${profile.user.username}'s profile`}
                      className="rounded-circle"
                      width="80"
                      height="80"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                      style={{ width: '80px', height: '80px', fontSize: '32px' }}
                    >
                      {profile.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="col">
                  <h2 className="mb-2">{profile.user.username}</h2>
                  <p className="text-muted mb-0">
                    {profile.biography || 'This user has not written a biography yet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="row">
        <div className="col-12">
          <h3 className="mb-3">Posts by {profile.user.username}</h3>
          {posts.length === 0 ? (
            <div className="alert alert-info">
              This user hasn't published any posts yet.
            </div>
          ) : (
            <div className="row">
              {posts.map((post) => (
                <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">
                        <a 
                          href={`/post/${post.id}`} 
                          className="text-decoration-none"
                        >
                          {post.title}
                        </a>
                      </h5>
                      <p className="card-text">
                        {post.content.length > 150 
                          ? `${post.content.substring(0, 150)}...` 
                          : post.content
                        }
                      </p>
                      {post.tags.length > 0 && (
                        <div className="mb-2">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="badge bg-secondary me-1">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <a href={`/post/${post.id}`} className="btn btn-primary btn-sm">
                        Read More
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
