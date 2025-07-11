import { useState, useEffect } from "react";
import type { Route } from "./+types/PostEditor";
import type { Post } from "~/types/api";
import { makeAuthenticatedRequest } from "~/utils/auth";
import { Editor } from "@tinymce/tinymce-react";
import { handleImageUpload } from "~/utils/image";
import { ApiImage } from "~/components/ApiImage";
import { useNavigate } from "react-router";

export async function clientLoader({ params: { id: id_param }}: Route.ClientLoaderArgs) {
  async function loadPost(id: number) {
    const response = await fetch(`/api/post/by-id/${id}`)
    if (!response.ok) return null
    return await response.json()
  }

  let id = parseInt(id_param)
  if (isNaN(id)) {
    // Return a temporary post object for new posts - don't create backend draft yet
    return {
      id: null, // null indicates this is not yet saved to backend
      title: "",
      content: "",
      image: null,
      tags: [],
      like_count: 0,
      comment_count: 0,
      bookmark_count: 0,
      is_liked: false,
      is_bookmarked: false,
      draft: true,
      profile: null // Will be set when actually creating the draft
    }
  }
  let post: Post = await loadPost(id)
  return post
}

export default function PostEditor({ loaderData, params }: Route.ComponentProps) {
  if (!loaderData) {
    return <span>Post not found</span>
  }

  const isNew = params.new == "new" || loaderData.id === null

  let [post, setPost] = useState<Post | any>(loaderData) // Allow any for temporary posts
  let [lastSaved, setLastSaved] = useState<Date | null>(null)
  let [newTagText, setNewTagText] = useState<string>("")
  let [saving, setSaving] = useState(false)
  let navigate = useNavigate()

  async function createDraft() {
    const response = await makeAuthenticatedRequest("/api/drafts/", { method: "POST" })
    const json = await response.json()
    return json.draft_post_id
  }

  async function saveDraft() {
    if (!post.title || post.title.trim() === "") {
      alert("Please add a title before saving the draft.")
      return
    }

    setSaving(true)
    
    try {
      // If this is a new post without an ID, create the draft first
      if (post.id === null) {
        const draftId = await createDraft()
        const draftPost = { ...post, id: draftId }
        setPost(draftPost)
        
        // Save the initial version with title
        await makeAuthenticatedRequest(`/api/post/by-id/${draftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftPost)
        })
        
        // Update the URL to include the new ID
        navigate(`/post/edit/${draftId}/new`, { replace: true })
      }
      // Save existing draft
      else {
        await makeAuthenticatedRequest(`/api/post/by-id/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post)
        })
      }
      
      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save draft:", error)
      alert("Failed to save draft. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function updatePost(data: Partial<Post>) {
    const newData = {
      ...post,
      ...data,
    }
    setPost(newData)
  }
  
  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    let image_id = await handleImageUpload(e);
    updatePost({ image: image_id })
  }

  async function publishDraft() {
    if (post.id === null) {
      alert("Please add a title before publishing.")
      return
    }
    await makeAuthenticatedRequest(`/api/post/by-id/${post.id}`, { method: "POST" })
    navigate("/")
  }

  async function deleteDraft() {
    if (post.id === null) {
      // If it's not saved yet, just navigate away
      navigate("/drafts")
      return
    }
    
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      try {
        const response = await makeAuthenticatedRequest(`/api/post/by-id/${post.id}`, { method: "DELETE" })
        if (response.ok) {
          navigate("/drafts")
        } else {
          alert("Failed to delete draft. Please try again.")
        }
      } catch (error) {
        alert("An error occurred while deleting the draft.")
      }
    }
  }

  return <div>
    <div className="post-create-container">
      <div className="header-section">
        <h1>{ isNew ? "Create Post" : "Edit post"}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={saveDraft}
            disabled={saving || !post.title || post.title.trim() === ""}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: saving || !post.title || post.title.trim() === "" ? 'not-allowed' : 'pointer',
              opacity: saving || !post.title || post.title.trim() === "" ? 0.6 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <div className="save-status">
            {lastSaved && (
              <span className="saved">
                ✅ Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <input
        type="text"
        value={post?.title}
        onChange={e => updatePost({ title: e.target.value })}
        placeholder="Enter your post title..."
        className="post-title-input"
      />

      <Editor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7.9.1/tinymce.min.js"
        value={post?.content}
        init={{
          height: 400,
          menubar: false,
          license_key: 'gpl', // Add GPL license key
          plugins: [
            'lists', 'link', 'charmap', 'preview', 'anchor',
            'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          // Explicitly disable problematic plugins
          plugins_loaded: function () {
            console.log('TinyMCE plugins loaded successfully');
          },
          toolbar:
            'undo redo | formatselect | bold italic | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | link | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
        onEditorChange={(content, _editor) => updatePost({ content })}
      />
      {post.image ? <ApiImage id={post.image} onClick={() => updatePost({image: null})} /> : <label>
        Upload image
        <br />
        <input type="file" accept="image/png,image/jpeg,image/svg" onChange={uploadImage} />
      </label>}

        <br />
        <br />
      <label>
        <input type="text" onChange={(e) => setNewTagText(e.target.value)}/>
        <button onClick={() => {
          if (newTagText) {
            updatePost({ tags: [...post.tags, newTagText] })
          }
        }}>Add</button>
      </label>
      {post.tags.map((tag: string) => (
          <div key={tag} className="tag">#{tag}</div>
        ))}
      <br />
      <br />
      {post.draft && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={publishDraft}>Publish</button>
          <button 
            onClick={deleteDraft}
            style={{ 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete Draft
          </button>
        </div>
      )}
    </div>
  </div>
}
