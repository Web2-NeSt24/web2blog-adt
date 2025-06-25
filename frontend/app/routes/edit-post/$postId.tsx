import React from 'react';
import { useParams } from 'react-router';
import PostEditor from '../../components/PostEditor';

export default function EditPost() {
  const { postId } = useParams();
  const numericPostId = postId ? parseInt(postId, 10) : undefined;
  
  return <PostEditor postId={numericPostId} isNewPost={false} />;
}
