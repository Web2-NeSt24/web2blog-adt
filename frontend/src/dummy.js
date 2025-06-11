// dummyData.ts

export const dummyImages = [
  {
    id: 1,
    type: "PNG",
    data: "https://loremflickr.com/200/200?random=1", // vagy csak "binary data"
  },
  {
    id: 2,
    type: "JPEG",
    data: "https://loremflickr.com/200/200?random=1",
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
];

export const dummyProfiles = [
  {
    id: 1,
    user: dummyUsers[0],
    biography: "Full Stack fejlesztő, szereti a React-ot.",
    profile_picture: dummyImages[0],
  },
  {
    id: 2,
    user: dummyUsers[1],
    biography: "Fotós és UI designer.",
    profile_picture: dummyImages[1],
  },
];

export const dummyHashtags = [
  { id: 1, value: "coding" },
  { id: 2, value: "react" },
  { id: 3, value: "devlife" },
];

export const dummyPosts = [
  {
    id: 1,
    profile: dummyProfiles[0],
    title: "Hogyan tanultam meg a TypeScript-et",
    content: "Ez egy hosszabb poszt tartalma...",
    image: dummyImages[0],
    tags: [dummyHashtags[0], dummyHashtags[1]],
    draft: false,
  },
  {
    id: 2,
    profile: dummyProfiles[1],
    title: "UI design tippek",
    content: "",
    image: null,
    tags: [],
    draft: true,
  },
  {
    id: 3,
    profile: dummyProfiles[0],
    title: "React komponensek alapjai",
    content:
      "Ebben a posztban bemutatom, hogyan készíts egyszerű React komponenst.",
    image: dummyImages[1],
    tags: [],
    draft: false,
  },
  {
    id: 4,
    profile: dummyProfiles[1],
    title: "Miért jó a TypeScript?",
    content:
      "A TypeScript segít elkerülni a hibákat és jobb fejlesztői élményt nyújt.",
    image: dummyImages[1],
    tags: [dummyHashtags[0]],
    draft: false,
  },
  {
    id: 5,
    profile: dummyProfiles[0],
    title: "Kedvenc fejlesztői eszközeim",
    content:
      "Ebben a bejegyzésben megosztom a kedvenc eszközeimet, amiket nap mint nap használok.",
    image: dummyImages[0],
    tags: [dummyHashtags[2]],
    draft: false,
  },
  {
    id: 6,
    profile: dummyProfiles[1],
    title: "Hogyan kezdj el blogolni?",
    content: "Tippek és trükkök kezdő bloggereknek.",
    image: dummyImages[1],
    tags: [dummyHashtags[1]],
    draft: false,
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
