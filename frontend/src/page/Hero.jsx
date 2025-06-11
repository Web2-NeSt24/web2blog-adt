import React from "react";
import Card from "../components/Card";
import { dummyPosts } from "../dummy";

const Hero = () => {
  console.log(dummyPosts);
  return (
    <>
      {dummyPosts.map((post, idx) => (
        <div key={post.id || idx}>
          {<Card post={post} idx={idx}/>}
        </div>
      ))}
    </>
  );
};

export default Hero;
