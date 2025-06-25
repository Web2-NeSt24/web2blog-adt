import React from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import CommentSection from '../components/CommentSection';

// Example post component to demonstrate comment section
const ExamplePost: React.FC = () => {
  // This would normally come from your post data/API
  const postId = 1; // Replace with actual post ID
  const postData = {
    id: postId,
    title: "Example Blog Post",
    content: "This is an example blog post to demonstrate the comment section functionality. Users can like this post and add comments even if they're not registered.",
    author: "John Doe",
    date: "2025-06-25"
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <Card.Title>{postData.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            By {postData.author} on {postData.date}
          </Card.Subtitle>
          <Card.Text>{postData.content}</Card.Text>
        </Card.Body>
      </Card>
      
      {/* Comment Section */}
      <CommentSection 
        postId={postId}
        initialLikeCount={5}
        initialIsLiked={false}
      />
    </Container>
  );
};

export default ExamplePost;
