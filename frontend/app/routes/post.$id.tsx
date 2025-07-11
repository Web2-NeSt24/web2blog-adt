import React from "react";
import PostDetail from "./PostDetail";
import type { Route } from "./+types/post.$id";

export default function PostDetailPage({ params }: Route.ComponentProps) {
  return <PostDetail id={params.id} />;
}
