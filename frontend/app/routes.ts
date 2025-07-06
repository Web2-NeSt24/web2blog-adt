import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/auth", "routes/auth.tsx"),
  route("/post/:id", "routes/post.$id.tsx"),
  route("/create", "routes/PostCreate.tsx")
] satisfies RouteConfig;
