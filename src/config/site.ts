import ogImage from "../assets/images/about.jpeg";

export const siteConfig = {
  name: "Adrian Martinez",
  description:
    "I'm a software engineer based in Switzerland, finishing my BSc in Computer Science at the Zurich University of Applied Sciences (ZHAW). I have a passion for building software and learning new technologies.",
  url: "https://adrianmartinez.ch",
  lang: "en",
  locale: "en_US",
  author: "Adrian Martinez",
  ogImage: ogImage,
  socialLinks: {
    github: "https://github.com/adrmrt",
    linkedin: "https://www.linkedin.com/in/adrian-martinez-722709237/",
  },
  navLinks: [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
    /* { text: "Projects", href: "/projects" }, */
    { text: "Blog", href: "/blog" },
    { text: "Map", href: "/map" },
    /* { text: "Contact", href: "/contact" }, */
  ],
};
