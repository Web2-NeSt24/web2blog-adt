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
     <div className="py-4" style={{ paddingLeft: "5%", paddingRight: "5%" }}>
      {/* Reduced gap between cards for better visual spacing */}
      <div className="row g-3 justify-content-center">
        {dummyPosts.map((post, idx) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3" key={post.id || idx}>
            <RandomCard post={post} idx={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}
