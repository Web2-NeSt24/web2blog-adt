import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("post/:postId", "routes/post/$postId.tsx"),
  route("auth", "routes/auth.tsx"),
  route("example-post", "routes/example-post.tsx"),
  route("create-post", "routes/create-post.tsx"),
  route("edit-post/:postId", "routes/edit-post/$postId.tsx"),
  route("drafts", "routes/drafts.tsx"),
  route("profile/:username", "routes/profile/$username.tsx"),
  route("edit-profile", "routes/edit-profile.tsx"),
  route("bookmarks", "routes/bookmarks.tsx")
] satisfies RouteConfig;
