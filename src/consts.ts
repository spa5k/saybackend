import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "SayBackend",
  DESCRIPTION:
    "A blog about backend development, software engineering, and other tech topics.",
  EMAIL: "admin@saybackend.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 1,
};

export const HOME: Metadata = {
  TITLE: "Say Backend - Your Backend and DevOps Resource",
  DESCRIPTION:
    "Say Backend is your go-to resource for backend and DevOps topics. Dive into our articles to learn about the latest trends, best practices, and tools in the industry.",
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
    NAME: "GitHub",
    HREF: "https://github.com/spa5k",
  },
];
