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
