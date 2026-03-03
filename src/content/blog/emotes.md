---
title: "Emotes"
pubDate: "2026-03-03"
description: "A brief discourse on how I added emotes to my posts."
author: "Adrian Martinez"
category: "Astro"
tags: []
---

Astro supports unicode emojis out-of-the-box, say 👍😊😍🎉. In my opinion, however, the default emojis are simply not expressive enough in some cases. Since I use Discord a lot, I wanted to add support for inline emotes by simply using `:emote_name:` in the Markdown file for a blog post.

## Why bother?

Because I'm looking to extend my website with features that I like from other platforms, even if they are not exactly useful. In Discord, you can upload any image you want on a server, assign a name to it, and use it as a pseudo-emoji, commonly called emotes.

I wanted that ability on my blog as well by uploading an image as a static asset, map it to a name, and directly use it anywhere on this website.

## Implementation

And, of course, some CSS styling to make it look good:

```css
.emote-container {
  position: relative;
  display: inline-block;
}

.emote {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
  margin: 0;
}

.emote-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s;
  background-color: var(--color-card);
  border-width: 1px;
  border-color: var(--color-border);
}

.emote-container:hover .emote-tooltip {
  opacity: 1;
}
```
