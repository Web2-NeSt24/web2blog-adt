import { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import type { Route } from "../+types/write";
import Layout from '~/components/Layout';
import { api } from '~/lib/api';
import { useAuth } from '~/hooks/useAuth';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Write New Post - RustyPython" },
    { name: "description", content: "Create a new blog post on RustyPython" },
  ];
}

export default function WritePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create draft first
      const draft = await api.createDraft();
      
      // Update the draft with content
      await api.updatePost(draft.draft_post_id, {
        title: formData.title,
        content: formData.content,
        image: null,
        tags: formData.tags,
      });

      if (!isDraft) {
        // Publish the draft
        await api.publishDraft(draft.draft_post_id);
        setSuccess('Post published successfully!');
        setTimeout(() => navigate(`/post/${draft.draft_post_id}`), 1500);
      } else {
        setSuccess('Draft saved successfully!');
        setTimeout(() => navigate('/drafts'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>
                <i className="bi bi-pencil-square me-2"></i>
                Write New Post
              </h2>
              <Button variant="outline-secondary" href="/">
                <i className="bi bi-arrow-left me-1"></i>
                Back
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
                <Form>
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
                      disabled={loading}
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
                            disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Press Enter or comma to add tags. Use tags to help readers find your content.
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
                        disabled={loading}
                        style={{ 
                          minHeight: '400px',
                          border: 'none',
                          resize: 'vertical',
                          fontSize: '1.1rem',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Write your content in plain text. Formatting will be preserved.
                    </Form.Text>
                  </Form.Group>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        onClick={(e) => handleSubmit(e, false)}
                        disabled={loading || !formData.title.trim() || !formData.content.trim()}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-1"></i>
                            Publish Post
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline-secondary"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={loading || !formData.title.trim()}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-file-earmark me-1"></i>
                            Save as Draft
                          </>
                        )}
                      </Button>
                    </div>

                    <Button variant="outline-danger" href="/" disabled={loading}>
                      <i className="bi bi-x-lg me-1"></i>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Writing Tips */}
            <Card className="border-0 bg-light mt-4">
              <Card.Body>
                <h6 className="mb-3">
                  <i className="bi bi-lightbulb me-2"></i>
                  Writing Tips
                </h6>
                <ul className="mb-0 small text-muted">
                  <li>Use a clear, descriptive title that captures your main idea</li>
                  <li>Add relevant tags to help readers discover your content</li>
                  <li>Break up long paragraphs for better readability</li>
                  <li>Save drafts frequently to avoid losing your work</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}