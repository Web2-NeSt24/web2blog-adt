import type { Route } from "./+types/home";
import { dummyPosts } from "~/dummy";
import { RandomCard } from "~/components/Card";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      {dummyPosts.map((post, idx) => (
        <div key={post.id || idx}>
          {<RandomCard post={post} idx={idx}/>}
        </div>
      ))}
    </>
  );
}
