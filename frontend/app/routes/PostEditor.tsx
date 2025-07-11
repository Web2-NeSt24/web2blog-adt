import { useState } from "react";
import type { Route } from "./+types/PostEditor";
import type { Post } from "~/types/api";
import { makeAuthenticatedRequest } from "~/utils/auth";
import { Editor } from "@tinymce/tinymce-react";
import { handleImageUpload } from "~/utils/image";
import { ApiImage } from "~/components/ApiImage";
import { redirect } from "react-router";
import { useNavigate } from "react-router";

export async function clientLoader({ params: { id: id_param }}: Route.ClientLoaderArgs) {
  async function loadPost(id: number) {
    const response = await fetch(`/api/post/by-id/${id}`)
    if (!response.ok) return null
    return await response.json()
  }

  async function createDraft() {
    const response = await makeAuthenticatedRequest("/api/drafts/", { method: "POST" })
    const json = await response.json()
    return json.draft_post_id
  }

  let id = parseInt(id_param)
  if (isNaN(id)) {
    id = await createDraft()
    return redirect(`/post/edit/${id}/new`)
  }
  let post: Post = await loadPost(id)
  return post
}

export default function PostEditor({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData) {
    return <span>Post not found</span>
  }

  const isNew = params.new == "new"

  let [post, setPost] = useState<Post>(loaderData)
  let [lastSaved, setLastSaved] = useState<Date | null>(null)
  let [newTagText, setNewTagText] = useState<string>("")
  let navigate = useNavigate()

  async function updatePost(data: Partial<Post>) {
    const newData: Post = {
      ...post,
      ...data,
    }
    setPost(newData)
    await makeAuthenticatedRequest(`/api/post/by-id/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData)
    })
    setLastSaved(new Date())
  }
  
  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    let image_id = await handleImageUpload(e);
    updatePost({ image: image_id })
  }

  async function publishDraft() {
    await makeAuthenticatedRequest(`/api/post/by-id/${post.id}`, { method: "POST" })
    navigate("/")
  }

  async function deletePost() {
    await makeAuthenticatedRequest(`/api/post/by-id/${post.id}`, { method: "DELETE" })
    navigate("/")
  }

  return (
    <div className="post-detail-container">
      <article className="post-detail-card">
        {/* Editor Header */}
        <header className="post-header">
          <div className="post-author">
            <div className="author-info">
              <h1 className="author-name" style={{ fontSize: '1.5rem', margin: '0' }}>
                {isNew ? "Create New Post" : "Edit Post"}
              </h1>
              <p className="author-bio">
                {isNew ? "Start writing your new blog post" : "Make changes to your post"}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {lastSaved && (
              <span style={{ color: '#28a745', fontSize: '0.9rem', fontWeight: '500' }}>
                ✅ Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        {/* Post Title Input */}
        <div style={{ padding: '1rem 2rem' }}>
          <input
            type="text"
            value={post?.title}
            onChange={e => updatePost({ title: e.target.value })}
            placeholder="Enter your post title..."
            style={{
              width: '100%',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1f2937',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: '0.5rem 0',
              lineHeight: '1.2'
            }}
          />
        </div>

        {/* Featured Image Section */}
        <div style={{ padding: '0 2rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          {post.image ? (
            <div className="post-image-container" style={{ marginBottom: '1rem' }}>
              <ApiImage id={post.image} />
              <button
                onClick={() => updatePost({image: null})}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <div style={{ 
              border: '2px dashed #d1d5db', 
              borderRadius: '8px', 
              padding: '2rem', 
              textAlign: 'center',
              background: '#f9fafb'
            }}>
              <label style={{ cursor: 'pointer' }}>
                <div style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                  📷 Upload Featured Image
                </div>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/svg" 
                  onChange={uploadImage}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                  Click to select an image file
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Post Content Editor */}
        <div className="post-content">
          <Editor
            tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7.9.1/tinymce.min.js"
            value={post?.content}
            init={{
              height: 400,
              menubar: false,
              license_key: 'gpl',
              plugins: [
                'lists', 'link', 'charmap', 'preview', 'anchor',
                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
              ],
              plugins_loaded: function () {
                console.log('TinyMCE plugins loaded successfully');
              },
              toolbar:
                'undo redo | formatselect | bold italic | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist | link | help',
              content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; line-height: 1.6; color: #374151; padding: 20px; }',
            }}
            onEditorChange={(content, _editor) => updatePost({ content })}
          />
        </div>

        {/* Post Tags */}
        <div style={{ padding: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 1rem', color: '#1f2937', fontSize: '1.1rem', fontWeight: '600' }}>
            Tags
          </h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                placeholder="Add a tag..."
                style={{
                  flex: '1',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTagText.trim()) {
                    updatePost({ tags: [...post.tags, newTagText.trim()] });
                    setNewTagText('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newTagText.trim()) {
                    updatePost({ tags: [...post.tags, newTagText.trim()] });
                    setNewTagText('');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            <div className="tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {post.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="tag-chip"
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => updatePost({ tags: post.tags.filter(t => t !== tag) })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: '0',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          padding: '2rem', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          {post.draft && (
            <button 
              onClick={publishDraft}
              disabled={post.id === null}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: post.id === null ? 'not-allowed' : 'pointer',
                opacity: post.id === null ? 0.6 : 1,
                fontWeight: '500'
              }}
            >
              Publish Post
            </button>
          )}
          <button 
            onClick={deletePost}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {post.draft ? "Delete Draft" : "Delete Post"}
          </button>
        </div>
      </article>
    </div>
  );
}
