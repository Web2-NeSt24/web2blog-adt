import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router';
import type { Route } from "../+types/edit";
import Layout from '~/components/Layout';
import LoadingSpinner from '~/components/LoadingSpinner';
import { api, type Post } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Edit Post ${params.postId} - RustyPython` },
    { name: "description", content: "Edit your blog post on RustyPython" },
  ];
}

export default function EditPost() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const postData = await api.getPost(Number(postId));
      setPost(postData);
      setFormData({
        title: postData.title,
        content: postData.content,
        tags: postData.tags || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit this post
  if (!loading && post && user && user.user.id !== post.profile.user.id) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updatePost(Number(postId), {
        title: formData.title,
        content: formData.content,
        image: post?.image || null,
        tags: formData.tags,
      });
      
      setSuccess('Post updated successfully!');
      setTimeout(() => navigate(`/post/${postId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading post..." />
      </Layout>
    );
  }

  if (error && !post) {
    return (
      <Layout>
        <Container>
          <Alert variant="danger">{error}</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="bi bi-pencil-square me-2"></i>
                Edit Post
              </h2>
              <Button variant="outline-secondary" href={`/post/${postId}`}>
                <i className="bi bi-arrow-left me-1"></i>
                Back to Post
              </Button>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Title */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter your post title..."
                      required
                      disabled={saving}
                      size="lg"
                    />
                  </Form.Group>

                  {/* Tags */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Tags</Form.Label>
                    <div className="tag-input">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            disabled={saving}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        onBlur={addTag}
                        placeholder="Add tags..."
                        disabled={saving}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Press Enter or comma to add tags.
                    </Form.Text>
                  </Form.Group>

                  {/* Content */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Content</Form.Label>
                    <div className="editor-container">
                      <Form.Control
                        as="textarea"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Tell your story..."
                        required
                        disabled={saving}
                        style={{ 
                          minHeight: '400px',
                          border: 'none',
                          resize: 'vertical',
                          fontSize: '1.1rem',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                  </Form.Group>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving || !formData.title.trim() || !formData.content.trim()}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1"></i>
                          Update Post
                        </>
                      )}
                    </Button>

                    <Button 
                      variant="outline-danger" 
                      href={`/post/${postId}`} 
                      disabled={saving}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}