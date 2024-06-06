import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "SayBackend",
  DESCRIPTION:
    "A blog about backend development, software engineering, and other tech topics.",
  EMAIL: "iam.kurta.pajama@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 1,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION:
    "Welcome to my blog! I write about backend development, software engineering, and other tech topics.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects with links to repositories and live demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "X (formerly Twitter)",
    HREF: "https://twitter.com/KPayjama",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/spa5k",
  },
];
