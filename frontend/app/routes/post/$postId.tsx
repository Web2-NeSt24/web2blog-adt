import { useLoaderData, Link } from "react-router";
import { dummyPosts } from "~/dummy";
import type { Route } from "./$types/postId";

export const loader = ({ params }: Route.LoaderArgs) => {
  const postId = parseInt(params.postId || "0", 10);
  const post = dummyPosts.find(p => p.id === postId);
  
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  
  return { post };
};

export function meta({ data }: Route.MetaArgs) {
  if (!data?.post) {
    return [
      { title: "Post Not Found" },
      { name: "description", content: "The requested post could not be found." },
    ];
  }

  return [
    { title: data.post.title },
    { name: "description", content: data.post.content.substring(0, 160) },
  ];
}

export default function PostDetail() {
  const { post } = useLoaderData<typeof loader>();

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
              {post.image?.data ? (
                <img
                  src={post.profile?.profile_picture?.data || post.image?.data}
                  alt={`Profile picture of ${post.profile?.user?.username || "Unknown author"}`}
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
                <div className="fw-bold">{post.profile?.user?.username || "Unknown author"}</div>
                {post.created_at && (
                  <div className="text-muted small">
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {post.image && (
          <div className="mb-4 text-center">
            <img
              src={post.image.data}
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
            {post.tags.map(tag => (
              <span 
                className="badge bg-secondary"
                key={tag.id}
              >
                #{tag.value}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
