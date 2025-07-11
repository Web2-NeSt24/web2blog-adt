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

  return <div>
    <div className="post-create-container">
      <div className="header-section">
        <h1>{ isNew ? "Create Post" : "Edit post"}</h1>
        <div className="save-status">
          {lastSaved && (
            <span className="saved">
              ✅ Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
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
      {post.tags.map(tag => (
          <div key={tag} className="tag">#{tag}</div>
        ))}
      <br />
      <br />
      {post.draft && (
        <button onClick={publishDraft}>Publish</button>
      )}
    </div>
  </div>
}
