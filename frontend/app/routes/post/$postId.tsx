import { useLoaderData, Link } from "react-router";
import CommentSection from "~/components/CommentSection";
import type { Route } from "./$types/postId";

// Interface for API data
interface Post {
  id: number;
  profile: {
    user: {
      id: number;
      username: string;
    };
    biography: string;
    profile_picture: string | null;
  };
  title: string;
  content: string;
  image: string | null;
  image_url?: string;
  tags: string[];
}

export const loader = async ({ params }: Route.LoaderArgs) => {
  const postId = parseInt(params.postId || "0", 10);
  
  try {
    const response = await fetch(`http://localhost:8000/api/post/by-id/${postId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Response("Post not found", { status: 404 });
    }
    
    const post = await response.json();
    return { post };
  } catch (error) {
    console.error('Error fetching post:', error);
    throw new Response("Post not found", { status: 404 });
  }
};

export function meta({ data }: Route.MetaArgs) {
  const postData = data as { post?: Post };
  
  if (!postData?.post) {
    return [
      { title: "Post Not Found" },
      { name: "description", content: "The requested post could not be found." },
    ];
  }

  return [
    { title: postData.post.title },
    { name: "description", content: postData.post.content.substring(0, 160) },
  ];
}

export default function PostDetail() {
  const { post } = useLoaderData<typeof loader>() as { post: Post };

  return (
    <div className="container py-5">
      <Link to="/" className="btn btn-outline-primary mb-4">
        &larr; Back to Home
      </Link>
      
      <article className="blog-post">
        <header className="mb-4">
          <h1 className="display-5 fw-bold">{post.title}</h1>
          
          <div className="d-flex align-items-center mb-4">
            <div className="d-flex align-items-center">
              {post.profile.profile_picture ? (
                <img
                  src={post.profile.profile_picture}
                  alt={`Profile picture of ${post.profile.user.username}`}
                  className="rounded-circle me-2"
                  width="50"
                  height="50"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle me-2 bg-secondary"
                  style={{ width: 50, height: 50 }}
                  aria-hidden="true"
                />
              )}
              <div>
                <Link 
                  to={`/profile/${post.profile.user.username}`}
                  className="fw-bold text-decoration-none"
                >
                  {post.profile.user.username}
                </Link>
                {/* Note: created_at is not available in the API response */}
              </div>
            </div>
          </div>
        </header>
        
        {post.image_url && (
          <div className="mb-4 text-center">
            <img
              src={post.image_url}
              alt={`Featured image for ${post.title}`}
              className="img-fluid rounded"
              style={{ maxHeight: "500px", width: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        
        <div className="blog-content mb-4">
          <p className="lead">{post.content}</p>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                className="badge bg-secondary"
                key={index}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
      
      {/* Comment Section */}
      <CommentSection 
        postId={post.id}
        initialLikeCount={0}
        initialIsLiked={false}
      />
    </div>
  );
}
