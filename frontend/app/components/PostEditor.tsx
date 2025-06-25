import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '@uiw/react-textarea-code-editor';

interface PostEditorProps {
  postId?: number; // For editing existing posts/drafts
  isNewPost?: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ postId, isNewPost = true }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPostId, setCurrentPostId] = useState<number | null>(postId || null);
  
  const { isAuthenticated, user } = useAuth();

  // Auto-save functionality
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const autoSaveInterval = setInterval(() => {
      if (title.trim() || content.trim()) {
        handleSave(true, true); // Save as draft, auto-save
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [title, content, tags, isAuthenticated]);

  // Load existing post if editing
  useEffect(() => {
    if (postId && !isNewPost) {
      loadPost(postId);
    }
  }, [postId, isNewPost]);

  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  };

  const loadPost = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/post/by-id/${id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title || '');
        setContent(data.content || '');
        setTags(data.tags?.map((tag: any) => tag.value || tag) || []);
        setIsDraft(data.draft !== false);
      }
    } catch (error) {
      setError('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        console.error('CSRF token not found');
        return null;
      }

      const response = await fetch('/api/drafts/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPostId(data.draft_post_id);
        return data.draft_post_id;
      }
    } catch (error) {
      console.error('Failed to create draft:', error);
    }
    return null;
  };

  const handleSave = async (saveAsDraft = true, isAutoSave = false) => {
    if (!isAuthenticated) {
      setError('You must be logged in to create posts');
      return;
    }

    if (!title.trim() && !content.trim() && !isAutoSave) {
      setError('Please add a title or content');
      return;
    }

    if (!isAutoSave) {
      setIsSaving(true);
      setError('');
      setSuccess('');
    }

    try {
      let postIdToUpdate = currentPostId;
      
      // Create new draft if this is a new post
      if (!postIdToUpdate && isNewPost) {
        postIdToUpdate = await createNewDraft();
        if (!postIdToUpdate) {
          throw new Error('Failed to create draft');
        }
      }

      // Update the post
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      let response;
      
      // Use FormData if there's an image, otherwise use JSON
      if (image) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('draft', saveAsDraft.toString());
        formData.append('image', image);
        
        // Add tags individually
        tags.forEach(tag => {
          formData.append('tags', tag);
        });

        response = await fetch(`/api/post/by-id/${postIdToUpdate}`, {
          method: 'PUT',
          headers: {
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: formData,
        });
      } else {
        const requestBody = {
          title: title.trim(),
          content: content.trim(),
          tags: tags,
          draft: saveAsDraft
        };

        response = await fetch(`/api/post/by-id/${postIdToUpdate}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        });
      }

      if (response.ok) {
        setIsDraft(saveAsDraft);
        if (!isAutoSave) {
          setSuccess(saveAsDraft ? 'Draft saved successfully!' : 'Post published successfully!');
          if (!saveAsDraft) {
            // Redirect to the published post
            setTimeout(() => {
              window.location.href = `/post/${postIdToUpdate}`;
            }, 1500);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save post');
      }
    } catch (error) {
      if (!isAutoSave) {
        setError('Network error. Please try again.');
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
      }
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          You must be <a href="/auth">logged in</a> to create posts.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              {isNewPost ? 'Create New Post' : 'Edit Post'}
            </h4>
            <div className="d-flex align-items-center">
              {isDraft && (
                <span className="badge bg-warning me-2">Draft</span>
              )}
              <small className="text-muted">
                Posting as {user?.username}
              </small>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                size="lg"
              />
            </Form.Group>

            {/* Content - Rich Text Editor */}
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <div style={{ border: '1px solid #ced4da', borderRadius: '0.375rem' }}>
                <CodeEditor
                  value={content}
                  language="markdown"
                  placeholder="Write your post content here... (Markdown supported)"
                  onChange={(evn) => setContent(evn.target.value)}
                  padding={15}
                  style={{
                    fontSize: 14,
                    backgroundColor: "#f8f9fa",
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    minHeight: '300px',
                  }}
                />
              </div>
              <Form.Text className="text-muted">
                You can use Markdown formatting (e.g., **bold**, *italic*, # heading, etc.)
              </Form.Text>
            </Form.Group>

            {/* Tags */}
            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="me-2"
                />
                <Button variant="outline-primary" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className="badge bg-secondary d-flex align-items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    #{tag}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.6em' }}
                      onClick={() => handleRemoveTag(tag)}
                      aria-label="Remove tag"
                    />
                  </span>
                ))}
              </div>
            </Form.Group>

            {/* Image Upload */}
            <Form.Group className="mb-4">
              <Form.Label>Featured Image (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    setImage(file);
                    // Create preview URL
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImage(null);
                    setImagePreview(null);
                  }
                }}
              />
              {imagePreview && (
                <div className="mt-3">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="img-thumbnail"
                    style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <div className="mt-2">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                        // Clear the file input
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                </div>
              )}
              <Form.Text className="text-muted">
                Upload a featured image for your post (JPG, PNG, or SVG)
              </Form.Text>
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" href="/">
                Cancel
              </Button>
              
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => handleSave(false)}
                  disabled={isSaving || (!title.trim() && !content.trim())}
                >
                  {isSaving ? 'Publishing...' : 'Publish Post'}
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <div className="mt-3">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Your draft is automatically saved every 30 seconds
        </small>
      </div>
    </Container>
  );
};

export default PostEditor;
