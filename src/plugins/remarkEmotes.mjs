import { visit } from "unist-util-visit";

const EMOTE_REGEX = /:([a-zA-Z0-9_]+):/g;

export function remarkEmotes(emoteMap) {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      const matches = [...node.value.matchAll(EMOTE_REGEX)];
      if (!matches.length) return;

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [full, name] = match;
        const emote = emoteMap[name];

        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index),
          });
        }

        if (emote) {
          children.push({
            type: "html",
            value: `<span class="relative inline-block group"><img src="${emote}" alt="${name}" width="24" height="24" class="not-prose inline-block align-middle" /><span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs rounded bg-card border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">:${name}:</span></span>`,
          });
        } else {
          children.push({ type: "text", value: full });
        }

        lastIndex = match.index + full.length;
      }

      if (lastIndex < node.value.length) {
        children.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
}
