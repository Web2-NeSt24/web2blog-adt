export const dummyImages = [
  {
    id: 1,
    type: "PNG",
    data: "https://loremflickr.com/200/200/technology?random=1",
  },
  {
    id: 2,
    type: "JPEG",
    data: "https://loremflickr.com/200/200/design?random=1",
  },
  {
    id: 3,
    type: "JPEG",
    data: "https://loremflickr.com/200/200/coding?random=1",
  },
  {
    id: 4,
    type: "PNG",
    data: "https://loremflickr.com/200/200/web?random=1",
  },
  {
    id: 5,
    type: "JPEG",
    data: "https://loremflickr.com/200/200/mobile?random=1",
  },
  {
    id: 6,
    type: "JPEG",
    data: "https://loremflickr.com/200/200/javascript?random=1",
  },
];

export const dummyUsers = [
  {
    id: 1,
    username: "tibi",
    email: "tibi@example.com",
  },
  {
    id: 2,
    username: "anna",
    email: "anna@example.com",
  },
  {
    id: 3,
    username: "alex_dev",
    email: "alex@example.com",
  },
  {
    id: 4,
    username: "sarah_codes",
    email: "sarah@example.com",
  },
  {
    id: 5,
    username: "mike_design",
    email: "mike@example.com",
  },
];

export const dummyProfiles = [
  {
    id: 1,
    user: dummyUsers[0],
    biography: "Full Stack developer who loves React and TypeScript.",
    profile_picture: dummyImages[0],
  },
  {
    id: 2,
    user: dummyUsers[1],
    biography: "Photographer and UI designer.",
    profile_picture: dummyImages[1],
  },
  {
    id: 3,
    user: dummyUsers[2],
    biography: "Frontend developer passionate about modern web technologies.",
    profile_picture: dummyImages[2],
  },
  {
    id: 4,
    user: dummyUsers[3],
    biography: "Backend engineer and DevOps enthusiast.",
    profile_picture: dummyImages[3],
  },
  {
    id: 5,
    user: dummyUsers[4],
    biography: "Product designer focused on user experience.",
    profile_picture: dummyImages[4],
  },
];

export const dummyHashtags = [
  { id: 1, value: "coding" },
  { id: 2, value: "react" },
  { id: 3, value: "devlife" },
  { id: 4, value: "typescript" },
  { id: 5, value: "webdev" },
  { id: 6, value: "nodejs" },
  { id: 7, value: "design" },
  { id: 8, value: "javascript" },
  { id: 9, value: "css" },
  { id: 10, value: "tutorial" },
  { id: 11, value: "beginners" },
  { id: 12, value: "productivity" },
];

export const dummyPosts = [
  {
    id: 1,
    profile: dummyProfiles[0],
    title: "How I Learned TypeScript in 30 Days",
    content: "TypeScript transformed my JavaScript development experience. In this post, I'll share my journey from JavaScript to TypeScript, the challenges I faced, and the resources that helped me master static typing. From basic types to advanced generics, here's everything you need to know to get started with TypeScript.",
    image: dummyImages[0],
    tags: [dummyHashtags[0], dummyHashtags[3]],
    draft: false,
    created_at: "2024-12-15T10:30:00Z",
  },
  {
    id: 2,
    profile: dummyProfiles[1],
    title: "Essential UI Design Tips for Developers",
    content: "As developers, we often focus on functionality while neglecting design. Here are 10 practical UI design principles that will make your applications more user-friendly and visually appealing. Learn about color theory, typography, spacing, and layout patterns that actually work.",
    image: dummyImages[1],
    tags: [dummyHashtags[6], dummyHashtags[9]],
    draft: false,
    created_at: "2024-12-14T14:20:00Z",
  },
  {
    id: 3,
    profile: dummyProfiles[2],
    title: "Building Your First React Component",
    content: "React components are the building blocks of modern web applications. In this beginner-friendly tutorial, I'll walk you through creating your first React component, understanding props, state, and lifecycle methods. We'll build a simple todo list to put theory into practice.",
    image: dummyImages[2],
    tags: [dummyHashtags[1], dummyHashtags[10], dummyHashtags[10]],
    draft: false,
    created_at: "2024-12-13T09:15:00Z",
  },
  {
    id: 4,
    profile: dummyProfiles[3],
    title: "Why Every Developer Should Use TypeScript",
    content: "TypeScript helps catch errors at compile time and provides better developer experience with intelligent code completion. After using it for two years in production, I can't imagine going back to plain JavaScript. Here's why TypeScript should be your next learning priority.",
    image: dummyImages[3],
    tags: [dummyHashtags[3], dummyHashtags[4]],
    draft: false,
    created_at: "2024-12-12T16:45:00Z",
  },
  {
    id: 5,
    profile: dummyProfiles[4],
    title: "My Favorite Developer Tools in 2024",
    content: "Productivity is key in software development. Here's my curated list of tools that have significantly improved my workflow: VS Code extensions, terminal improvements, debugging tools, and productivity apps. These tools have saved me countless hours and reduced my debugging time by 50%.",
    image: dummyImages[4],
    tags: [dummyHashtags[2], dummyHashtags[11]],
    draft: false,
    created_at: "2024-12-11T11:30:00Z",
  },
  {
    id: 6,
    profile: dummyProfiles[0],
    title: "Getting Started with Blogging as a Developer",
    content: "Technical blogging is one of the best ways to share knowledge and build your personal brand. I'll share tips on choosing topics, writing engaging content, and growing your audience. From setting up your blog to SEO optimization, here's everything you need to start your blogging journey.",
    image: dummyImages[5],
    tags: [dummyHashtags[10], dummyHashtags[2]],
    draft: false,
    created_at: "2024-12-10T13:20:00Z",
  },
  {
    id: 7,
    profile: dummyProfiles[1],
    title: "Modern CSS Techniques Every Developer Should Know",
    content: "CSS has evolved significantly in recent years. Grid, Flexbox, Custom Properties, and Container Queries have revolutionized how we style web applications. In this comprehensive guide, I'll show you practical examples of modern CSS techniques that will make your styling more efficient and maintainable.",
    image: dummyImages[0],
    tags: [dummyHashtags[8], dummyHashtags[4], dummyHashtags[9]],
    draft: false,
    created_at: "2024-12-09T08:45:00Z",
  },
  {
    id: 8,
    profile: dummyProfiles[2],
    title: "Node.js Best Practices for Production",
    content: "Building scalable Node.js applications requires following proven patterns and practices. From error handling and logging to security and performance optimization, I'll share the lessons learned from deploying Node.js apps in production environments. These practices will help you avoid common pitfalls.",
    image: dummyImages[1],
    tags: [dummyHashtags[5], dummyHashtags[0]],
    draft: false,
    created_at: "2024-12-08T15:10:00Z",
  },
  {
    id: 9,
    profile: dummyProfiles[3],
    title: "JavaScript ES2024: New Features You Should Know",
    content: "JavaScript continues to evolve with new features that make development more enjoyable and productive. ES2024 introduces several exciting additions including array grouping, temporal API improvements, and enhanced pattern matching. Let's explore these features with practical examples.",
    image: dummyImages[2],
    tags: [dummyHashtags[7], dummyHashtags[4]],
    draft: false,
    created_at: "2024-12-07T12:00:00Z",
  },
  {
    id: 10,
    profile: dummyProfiles[4],
    title: "The Complete Guide to Web Accessibility",
    content: "Building accessible web applications isn't just about compliance—it's about creating inclusive experiences for everyone. This comprehensive guide covers ARIA labels, keyboard navigation, color contrast, and screen reader compatibility. Learn how to make your websites usable by everyone.",
    image: dummyImages[3],
    tags: [dummyHashtags[4], dummyHashtags[6]],
    draft: false,
    created_at: "2024-12-06T10:25:00Z",
  },
  {
    id: 11,
    profile: dummyProfiles[0],
    title: "Debugging React Applications Like a Pro",
    content: "Debugging React apps can be challenging, especially as they grow in complexity. I'll share advanced debugging techniques using React DevTools, performance profiling, and common patterns for identifying and fixing issues. These strategies will help you become more efficient at troubleshooting.",
    image: dummyImages[4],
    tags: [dummyHashtags[1], dummyHashtags[0]],
    draft: false,
    created_at: "2024-12-05T14:40:00Z",
  },
  {
    id: 12,
    profile: dummyProfiles[1],
    title: "Building Responsive Layouts with CSS Grid",
    content: "CSS Grid has revolutionized how we create layouts on the web. Unlike Flexbox, Grid is designed for two-dimensional layouts and offers incredible flexibility. In this tutorial, we'll build several responsive layouts from scratch, covering grid areas, auto-fit, and responsive design patterns.",
    image: dummyImages[5],
    tags: [dummyHashtags[8], dummyHashtags[6]],
    draft: false,
    created_at: "2024-12-04T09:30:00Z",
  },
];

export const dummyComments = [
  {
    id: 1,
    post: dummyPosts[0],
    author_profile: dummyProfiles[1],
    content: "Nagyon hasznos cikk, köszi!",
  },
];

export const dummyLikes = [
  {
    id: 1,
    post: dummyPosts[0],
    liker_profile: dummyProfiles[1],
  },
];

export const dummyBookmarks = [
  {
    id: 1,
    post: dummyPosts[0],
    creator_profile: dummyProfiles[0],
    title: "Kedvenc TypeScript cikkem",
  },
];
