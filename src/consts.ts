import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "SayBackend",
  DESCRIPTION:
    "A blog about backend development, software engineering, and other tech topics.",
  EMAIL: "hello@kamran.sh",
  NUM_POSTS_ON_HOMEPAGE: 6,
  NUM_PROJECTS_ON_HOMEPAGE: 1,
};

export const HOME: Metadata = {
  TITLE: "SayBackend - Backend Engineering & DevOps Blog",
  DESCRIPTION:
    "In-depth technical articles on backend development, DevOps, PostgreSQL, Kubernetes, and system architecture. Explore engineering tutorials, performance benchmarks, and production best practices.",
};

export const BLOG: Metadata = {
  TITLE: "Backend Engineering Blog - SayBackend",
  DESCRIPTION:
    "In-depth technical articles on backend development, DevOps, PostgreSQL, Kubernetes, Docker, and system architecture. Explore 50+ engineering tutorials and best practices from a senior software engineer.",
};

export const PROJECTS: Metadata = {
  TITLE: "DevOps Projects & Portfolio - SayBackend",
  DESCRIPTION:
    "Open-source projects and production deployments showcasing Go, Node.js, AWS, Kubernetes, PostgreSQL, and Docker implementations. View code repositories and live demos.",
};

export const ABOUT: Metadata = {
  TITLE: "About Kamran Tahir - Senior Backend Engineer",
  DESCRIPTION:
    "Meet Kamran Tahir, a Senior Software Engineer specializing in backend systems, AWS serverless architecture, PostgreSQL, and DevOps. 6+ years building scalable infrastructure and microservices.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/spa5k",
  },
];
