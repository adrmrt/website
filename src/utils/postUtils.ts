import type { CollectionEntry } from "astro:content";

export const getWordCount = (post: CollectionEntry<"blog">): number => {
  return (
    post.body
      ?.replace(/^---[\s\S]*?---\s*/, "") // Frontmatter block
      .replace(/#{1,6}\s/g, "") // Heading markers
      .replace(/[*_`~]/g, "") // Markdown syntax
      .split(/\s+/)
      .filter(Boolean).length || 0
  );
};

export const getReadingTime = (post: CollectionEntry<"blog">): number => {
  const wordCount = getWordCount(post);
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
};
