import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

interface Profile {
  user: {
    id: number;
    username: string;
  };
  biography: string;
  profile_picture: string | null;
  profile_picture_url: string | null;
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [biography, setBiography] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/me/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          setBiography(profileData.biography || '');
        } else {
          // Handle different HTTP error codes for profile fetch
          let errorMessage = 'Failed to load profile';
          
          switch (response.status) {
            case 401:
              errorMessage = 'You need to log in to view your profile.';
              navigate('/auth');
              return;
            case 403:
              errorMessage = 'You do not have permission to view this profile.';
              break;
            case 404:
              errorMessage = 'Profile not found.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Failed to load profile (Error ${response.status}).`;
          }
          
          setError(errorMessage);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred while loading your profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, or SVG).');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image file is too large. Please choose an image smaller than 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Clear any previous errors
      setError(null);
      
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicturePreview(event.target?.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read the image file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to get CSRF token from cookie
  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Get CSRF token from cookie
      const csrfToken = getCSRFToken();
      
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('biography', biography);
      
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      const response = await fetch('/api/user/me/profile', {
        method: 'PUT',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess(true);
        // Update local profile state
        setProfile(prev => prev ? { 
          ...prev, 
          biography,
          profile_picture_url: profilePicturePreview || prev.profile_picture_url
        } : null);
        
        // Show success message and redirect after a short delay
        setTimeout(() => {
          navigate(`/profile/${user?.username}`);
        }, 1500);
      } else {
        // Handle different HTTP error codes
        let errorMessage = 'Failed to update profile';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid data provided. Please check your inputs.';
              break;
            case 401:
              errorMessage = 'You need to log in again to update your profile.';
              break;
            case 403:
              errorMessage = 'You do not have permission to update this profile.';
              break;
            case 413:
              errorMessage = 'Image file is too large. Please choose a smaller image.';
              break;
            case 415:
              errorMessage = 'Unsupported image format. Please use JPG, PNG, or SVG.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Update failed (Error ${response.status}). Please try again.`;
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

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

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Edit Profile</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  Profile updated successfully! Redirecting...
                </div>
              )}

              <form onSubmit={handleSave}>
                {/* Profile Picture Section */}
                <div className="mb-4 text-center">
                  {profilePicturePreview || profile?.profile_picture_url ? (
                    <img 
                      src={profilePicturePreview || profile?.profile_picture_url || ''} 
                      alt={`${profile?.user.username}'s profile`}
                      className="rounded-circle mb-3"
                      width="100"
                      height="100"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                      style={{ width: '100px', height: '100px', fontSize: '40px' }}
                    >
                      {profile?.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="form-control mb-2"
                      style={{ maxWidth: '300px', margin: '0 auto' }}
                    />
                    {profilePicturePreview && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-2"
                        onClick={() => {
                          setProfilePicture(null);
                          setProfilePicturePreview(null);
                          // Clear the file input
                          const input = document.getElementById('profilePicture') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                      >
                        Remove Selected Image
                      </button>
                    )}
                    <div className="mt-1">
                      <small className="text-muted">
                        Upload a profile picture (JPG, PNG, or SVG, max 5MB)
                      </small>
                    </div>
                  </div>
                </div>

                {/* Username (read-only) */}
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="username"
                    value={profile?.user.username || ''}
                    disabled
                  />
                  <div className="form-text">Username cannot be changed</div>
                </div>

                {/* Biography */}
                <div className="mb-3">
                  <label htmlFor="biography" className="form-label">Biography</label>
                  <textarea 
                    className="form-control" 
                    id="biography"
                    rows={4}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <div className="form-text">
                    {biography.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/profile/${user.username}`)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
