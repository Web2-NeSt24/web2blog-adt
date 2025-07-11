import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useAuth } from "../contexts/AuthContext";

// Import the authenticated request utility
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Get CSRF token from cookie
  const getCSRFToken = (): string | null => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Fetch CSRF token if needed
  const fetchCSRFToken = async (): Promise<void> => {
    try {
      await fetch('/api/auth/csrf/', {
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  // First ensure we have a CSRF token
  if (!getCSRFToken()) {
    await fetchCSRFToken();
  }

  const csrfToken = getCSRFToken();
  const headers = new Headers(options.headers);
  
  if (csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH' || options.method === 'DELETE')) {
    headers.set('X-CSRFToken', csrfToken);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

interface Draft {
  id: number;
  title: string;
  content: string;
  tags: string[];
  image: string | null;
  draft: boolean;
}

const API_BASE = "/api";

const PostCreate: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [authError, setAuthError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<any>(null);

  // Fix hydration by only rendering editor on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE}/user/me/profile`);
        if (!response.ok) {
          setAuthError(true);
        }
      } catch (error) {
        setAuthError(true);
      }
    };
    
    checkAuth();
  }, []);

  // Create draft when user starts writing (not on mount)
  const createDraftIfNeeded = async () => {
    if (draft) return draft; // Already have a draft
    
    try {
      console.log("Creating new draft...");
      setSaving(true);
      
      const createResponse = await makeAuthenticatedRequest(`${API_BASE}/drafts/`, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Draft creation response status:", createResponse.status);
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Failed to create draft:", createResponse.status, errorText);
        
        if (createResponse.status === 401 || createResponse.status === 403) {
          setAuthError(true);
          return null;
        }
        setSaving(false);
        return null;
      }
      
      const newDraftResponse = await createResponse.json();
      console.log("Draft creation response:", newDraftResponse);
      
      // Handle different response formats from the API
      let newDraft = null;
      if (newDraftResponse.id) {
        newDraft = newDraftResponse;
        setDraft(newDraftResponse); // Use the draft data directly
        console.log("Draft created with ID:", newDraftResponse.id);
      } else if (newDraftResponse.draft_post_id) {
        const draftId = newDraftResponse.draft_post_id;
        
        // Fetch the actual draft details
        const draftResponse = await makeAuthenticatedRequest(`${API_BASE}/post/by-id/${draftId}`);
        
        if (draftResponse.ok) {
          const draftData = await draftResponse.json();
          newDraft = draftData;
          setDraft(draftData);
          console.log("Draft loaded:", draftData);
        } else {
          console.error("Failed to load draft details:", draftResponse.status);
        }
      } else {
        console.error("Unknown draft response format:", newDraftResponse);
        return null;
      }
      
      setSaving(false);
      return newDraft;
    } catch (error) {
      console.error("Error creating draft:", error);
      setSaving(false);
      return null;
    }
  };

  // Sync local state with draft
  useEffect(() => {
    if (draft) {
      setTitle(draft.title || "");
      setContent(draft.content || "");
      setTags(draft.tags || []);
    }
  }, [draft]);

  // Auto-save draft on change (create draft if needed, then save)
  useEffect(() => {
    // Don't save if both title and content are empty
    if (!title.trim() && !content.trim()) return;
    
    const timeout = setTimeout(async () => {
      console.log("Auto-saving draft:", { title, content: content.substring(0, 50) + "..." });
      
      // Create draft if we don't have one yet
      let currentDraft = draft;
      if (!currentDraft) {
        currentDraft = await createDraftIfNeeded();
        if (!currentDraft) return; // Failed to create draft
      }
      
      setSaving(true);
      makeAuthenticatedRequest(`${API_BASE}/post/by-id/${currentDraft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title || "Untitled", 
          content: content || "", 
          tags 
        })
      })
        .then(async res => {
          if (res.ok) {
            return res.json();
          }
          const errorText = await res.text();
          console.error("Auto-save failed:", res.status, res.statusText, errorText);
          throw new Error(`Failed to save draft: ${res.status} - ${errorText}`);
        })
        .then(updatedDraft => {
          setDraft(updatedDraft);
          setLastSaved(new Date());
          console.log("Draft auto-saved");
        })
        .catch(error => console.error("Error saving draft:", error))
        .finally(() => setSaving(false));
    }, 2000); // Save 2 seconds after user stops typing
    
    return () => clearTimeout(timeout);
  }, [title, content, tags, draft]);

  const handleTagAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const base64Data = await fileToBase64(file);
      const fileType = file.type.split("/")[1].toUpperCase();
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/image/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: fileType, data: base64Data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handlePublish = async () => {
    console.log("handlePublish called", { draft, title: title.trim(), content: content.trim() });
    
    if (!title.trim()) {
      alert("Please add a title before publishing.");
      return;
    }
    
    if (!content.trim()) {
      alert("Please add some content before publishing.");
      return;
    }
    
    try {
      setSaving(true);
      
      // Create draft if we don't have one yet
      let currentDraft = draft;
      if (!currentDraft) {
        currentDraft = await createDraftIfNeeded();
        if (!currentDraft) {
          alert("Failed to create draft. Please try again.");
          return;
        }
      }
      
      console.log("Publishing draft ID:", currentDraft.id);
      
      // Handle image upload if there's a new image
      let imageId = null;
      if (image) {
        console.log("Uploading image...");
        imageId = await handleImageUpload(image);
        console.log("Image uploaded with ID:", imageId);
      }
      
      // Update the draft with all content but NOT the image (due to backend bug)
      const updateData: any = { 
        title: title || "Untitled", 
        content, 
        tags 
      };
      
      // Note: We don't include the image here due to a backend bug
      // The image will need to be associated separately or the backend needs to be fixed
      
      const updateResponse = await makeAuthenticatedRequest(`${API_BASE}/post/by-id/${currentDraft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Failed to update draft:", updateResponse.status, errorText);
        throw new Error(`Failed to update draft: ${updateResponse.status} - ${errorText}`);
      }
      
      // Publish the draft
      console.log("Publishing to:", `${API_BASE}/drafts/${currentDraft.id}/publish/`);
      const response = await makeAuthenticatedRequest(`${API_BASE}/drafts/${currentDraft.id}/publish/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      console.log("Publish response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Publish error:", response.status, errorData);
        throw new Error(`Failed to publish: ${response.status} - ${errorData}`);
      }

      const publishedPost = await response.json();
      alert("Post published successfully!");
      console.log("Published post:", publishedPost);
      
      // Reset form for new post
      setTitle("");
      setContent("");
      setTags([]);
      setImage(null);
      setDraft(null);
      setLastSaved(null);
      
      // Create a new draft for the next post
      console.log("Creating new draft...");
      const createResponse = await makeAuthenticatedRequest(`${API_BASE}/drafts/`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }
      });
      
      if (createResponse.ok) {
        const newDraftResponse = await createResponse.json();
        console.log("New draft creation response:", newDraftResponse);
        
        // Handle different response formats
        let draftId;
        if (newDraftResponse.id) {
          draftId = newDraftResponse.id;
          setDraft(newDraftResponse); // Use the draft data directly
        } else if (newDraftResponse.draft_post_id) {
          draftId = newDraftResponse.draft_post_id;
          
          // Fetch the actual draft details
          const draftResponse = await makeAuthenticatedRequest(`${API_BASE}/post/by-id/${draftId}`);
          
          if (draftResponse.ok) {
            const draftData = await draftResponse.json();
            setDraft(draftData);
            console.log("New draft loaded:", draftData);
          } else {
            console.error("Failed to load new draft details");
          }
        } else {
          console.error("Unknown new draft response format:", newDraftResponse);
        }
      }
      
    } catch (error) {
      console.error("Error publishing post:", error);
      alert(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (authError || !isAuthenticated) {
    return <div className="error">You are not authorized to access this page. Please log in.</div>;
  }

  return (
    <div className="post-create-container">
      <div className="header-section">
        <h1>Create Post</h1>
        <div className="save-status">
          {saving && <span className="saving">💾 Saving...</span>}
          {!saving && lastSaved && (
            <span className="saved">
              ✅ Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {!saving && !lastSaved && draft && (
            <span className="draft-created">📝 Draft created</span>
          )}
          {!saving && !lastSaved && !draft && (
            <span className="ready">📝 Ready to write</span>
          )}
        </div>
      </div>
      
      {/* Modern Title Input */}
      <div className="form-field">
        <label className="form-label">Post Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter your post title..."
          className="modern-input title-input"
        />
      </div>
      
      {/* TinyMCE Editor */}
      <div className="form-field">
        <label className="form-label">Content</label>
        {isClient ? (
          <div className="editor-wrapper">
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              onInit={(_evt: any, editor: any) => (editorRef.current = editor)}
              value={content}
              init={{
                height: 400,
                menubar: false,
                license_key: 'gpl',
                plugins: [
                  'lists', 'link', 'charmap', 'preview', 'anchor',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                plugins_loaded: function() {
                  console.log('TinyMCE plugins loaded successfully');
                },
                toolbar:
                  'undo redo | formatselect | bold italic | ' +
                  'alignleft aligncenter alignright alignjustify | ' +
                  'bullist numlist | link | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                setup: (editor: any) => {
                  if (typeof window !== 'undefined') {
                    editor.on('init', () => {
                      editor.setContent(content);
                    });
                  }
                }
              }}
              onEditorChange={setContent}
            />
          </div>
        ) : (
          <div className="editor-loading">
            <p>Loading editor...</p>
          </div>
        )}
      </div>

      {/* Modern Tag Input */}
      <div className="form-field">
        <label className="form-label">Tags</label>
        <form onSubmit={handleTagAdd} className="tag-input-form">
          <div className="tag-input-wrapper">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Add a tag and press Enter"
              className="modern-input tag-input"
            />
            <button type="submit" className="tag-add-button">
              <span>+</span>
            </button>
          </div>
        </form>
        
        {tags.length > 0 && (
          <div className="tag-list">
            {tags.map((tag, index) => (
              <span key={tag} className="tag-chip">
                #{tag}
                <button 
                  type="button"
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modern File Upload */}
      <div className="form-field">
        <label className="form-label">Featured Image</label>
        <div className="file-upload-wrapper">
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="file-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="file-upload-button">
            <div className="file-upload-content">
              <div className="file-upload-icon">📸</div>
              <div className="file-upload-text">
                <span className="file-upload-main">
                  {image ? image.name : "Choose an image"}
                </span>
                <span className="file-upload-sub">
                  Click to browse or drag and drop
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Publish Button */}
      <div className="form-actions">
        <button 
          onClick={handlePublish} 
          disabled={saving || !title.trim() || !content.trim()}
          className="publish-button"
        >
          {saving ? "Publishing..." : "Publish Post"}
        </button>
      </div>
      
      <div className="help-text">
        <small>
          💡 Your post will be automatically saved as a draft when you start writing.
          {draft && ` Draft ID: ${draft.id}`}
        </small>
      </div>
    </div>
  );
};

export default PostCreate;
