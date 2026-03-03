---
title: "Custom Blog Emotes"
pubDate: "2026-03-03"
description: "A brief discourse on how I added emotes to my posts."
author: "Adrian Martinez"
category: "coding"
tags: ["astro"]
---

Astro supports unicode emojis out-of-the-box, say 👍😊😍🎉. In my opinion, however, the default emojis are simply not expressive enough in some cases. Since I use Discord a lot, I wanted to add support for inline emotes by simply using `:emote_name:` in the Markdown file for a blog post.

## Why bother?

Because I'm looking to extend my website with features that I like from other platforms, even if they are not exactly useful. In Discord, you can upload any image you want on a server, assign a name to it, and use it as a pseudo-emoji, commonly called emotes.

I wanted that same ability on my blog - upload an image as a static asset, map it to a name, and use it anywhere on this website.

## Implementation

Astro uses [remark](https://github.com/remarkjs/remark) under the hood to process Markdown files. This processor works by parsing Markdown into a so-called Abstract Syntax Tree (AST) which is basically a structured representation of the document. This tree can be further transformed by remark plugins before finally being rendered as HTML.

So for my use case, I created a new remark plugin called `remarkEmotes.mjs` and placed it under `src/plugins/`:

```mjs
import { visit } from "unist-util-visit";

// Matches :emote_name: pattern
const EMOTE_REGEX = /:([a-zA-Z0-9_]+):/g;

export function remarkEmotes(emoteMap) {
  return (tree) => {
    // Walk all text nodes in the Markdown AST
    visit(tree, "text", (node, index, parent) => {
      const matches = [...node.value.matchAll(EMOTE_REGEX)];
      if (!matches.length) return;

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [full, name] = match;
        const emote = emoteMap[name];

        // Preserve text before the emote
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index),
          });
        }

        // Replace supported emotes with associated image, otherwise keep as text
        if (emote) {
          children.push({
            type: "html",
            value: `<span class="emote-container">
              <img src="${emote}" alt="${name}" class="emote" />
              <span class="emote-tooltip">:${name}:</span>
            </span>`,
          });
        } else {
          children.push({ type: "text", value: full });
        }

        // Update lastIndex to the end of the current match
        lastIndex = match.index + full.length;
      }

      // Preserve text after the last emote
      if (lastIndex < node.value.length) {
        children.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      // Replace the original text nodes with the new children
      parent.children.splice(index, 1, ...children);
    });
  };
}
```

The next step for me was to add the emotes as static images to the `public/` folder. To keep the emote name to image path mapping isolated and make it easy to find, I created a new file under `src/config/` called `emotes.mjs`:

```mjs
export const emoteMap = {
  joemad: "/emotes/joemad.webp",
  kekw: "/emotes/kekw.webp",
};
```

I then imported this mapping in `astro.config.mjs` so it can be passed to the new plugin when it is added to remark:

```mjs
...
import { emoteMap } from "./src/config/emotes.mjs";
import { remarkEmotes } from "./src/plugins/remarkEmotes.mjs";

export default defineConfig({
  ...
  markdown: {
    remarkPlugins: [[remarkEmotes, emoteMap]],
  },
  ...
});
```

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

## Result

With the above custom plugin, I can now simply type `:kekw:` or `:joemad:` in the post Markdown file which Astro renders as :kekw: and :joemad: respectively. The number of emotes can simply be extended by adding more images to the `/public/emotes/` folder and mapping them to a name in `src/config/emotes.mjs`. I'm especially pleased with the tooltip which shows the exact name of the emote and can provide context on the meaning of the emote.

To wrap this up, I also added `:aaaaaa:`, `:bruh:`, `:clueless:`, `:pog:`, and `:sotrue:` - which render as :aaaaaa: :bruh: :clueless: :pog: :sotrue: respectively. Admittedly, I will probably never use these again to avoid turning this blog into a Twitch chat.
