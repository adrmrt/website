# Personal Website

Personal website and blog built with [Astro 5](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/).

Based on the Astro template [Astro Starter Pro](https://github.com/devgelo-labs/astro-starter-pro) by [Angelo Pescetto](https://github.com/devgelo-labs).

## Setup

```bash
git clone https://github.com/adrmrt/website.git
cd website
npm install
npm run dev
```

## Configuration

All global site information is managed in `src/config/site.ts`. Update this file with your data:

```typescript
// src/config/site.ts
export const siteConfig = {
  name: "Astro Starter Pro",
  description: "Your SEO description",
  url: "https://astrostarterpro.com",
  author: "Angelo Pescetto",
  // ...
};
```

## Commands

| Command             | Action                                             |
| :------------------ | :------------------------------------------------- |
| `npm run dev`       | Starts the development server at `localhost:4321`. |
| `npm run build`     | Generates the static site in the `dist/` folder.   |
| `npm run preview`   | Previews the production build locally.             |
| `npm run lint`      | Runs ESLint to ensure code quality.                |
| `npm run format`    | Formats code with Prettier.                        |
| `npm run fix`       | Runs format and lint auto-fix.                     |
| `npm run check`     | Runs astro check for diagnostics.                  |
| `npm run typecheck` | Verifies TypeScript types.                         |

## License

This project is under the MIT license. See the [LICENSE](./LICENSE) file for more details.
