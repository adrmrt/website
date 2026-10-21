export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

export const tools: Tool[] = [
  {
    slug: "tatami",
    title: "Tatami",
    description: "Arrange and stitch screenshots into a single image.",
    icon: "tabler:layout-grid",
    href: "/tools/tatami",
  },
];
