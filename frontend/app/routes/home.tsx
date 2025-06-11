import { Sidebars } from "~/components/sidebars";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <div className="tw:p-10">
    <Sidebars
      left=<div className="menu">
        <h1 className="tw:flex tw:items-center tw:gap-5">
          <img src="/favicon.ico" alt="Logo" className="tw:inline" />
          <span>TheBlog</span>
        </h1>
        <p className="menu-label">Home</p>
        <ul className="menu-list">
          <li><a className="is-active">New</a></li>
          <li><a>Trending</a></li>
        </ul>
      </div>
      right=<div>
        <div className="menu">
          <p className="menu-label">Account</p>
          <ul className="menu-list">
            <li><span className="button is-primary mb-3 px-5">Register</span></li>
            <li><span className="button is-info px-5">Login</span></li>
          </ul>
        </div>
      </div>
    >
      <article className="box"><h1 className="title is-1">Hello world!</h1></article>
    </Sidebars>

  </div>;
}
