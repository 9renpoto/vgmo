import type { Meta, StoryObj } from "@storybook/preact-vite";
import Footer from "./";

const meta: Meta<typeof Footer> = {
  component: Footer,
};

export default meta;

const sampleMenus = [
  {
    title: "Documentation",
    children: [
      { name: "Getting Started", href: "#" },
      { name: "Guide", href: "#" },
      { name: "API", href: "#" },
      { name: "Showcase", href: "#" },
      { name: "Pricing", href: "#" },
    ],
  },
  {
    title: "Links",
    children: [
      { name: "Forum", href: "#" },
      { name: "Discord", href: "#" },
    ],
  },
];

export const Basic: StoryObj<typeof Footer> = {
  args: {
    menus: sampleMenus,
  },
};
