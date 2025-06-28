import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("post/:postId", "routes/post/detail.tsx"),
  route("profile/:username", "routes/profile/detail.tsx"),
  route("write", "routes/post/write.tsx"),
  route("edit/:postId", "routes/post/edit.tsx"),
  route("drafts", "routes/drafts.tsx"),
  route("bookmarks", "routes/bookmarks.tsx"),
  route("search", "routes/search.tsx"),
  route("explore", "routes/explore.tsx"),
  route("tag/:tag", "routes/tag.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;