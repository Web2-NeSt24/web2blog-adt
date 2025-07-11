import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth", "routes/auth.tsx"),
  route("/post/:id", "routes/post.$id.tsx"),
  route("/create", "routes/PostCreate.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/likes", "routes/likes.tsx"),
  route("/bookmarks", "routes/bookmarks.tsx"),
  route("/settings", "routes/settings.tsx"),
  route("/about", "routes/about.tsx"),
  route("/privacy", "routes/privacy.tsx")
] satisfies RouteConfig;
