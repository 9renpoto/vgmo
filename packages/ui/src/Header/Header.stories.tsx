import type { Meta, StoryObj } from "@storybook/preact-vite";
import Header from "./index.js";

const meta: Meta<typeof Header> = {
  component: Header,
};

export default meta;

export const Basic: StoryObj<typeof Header> = {
  args: {
    active: "Home",
  },
};

export const WithSearchValue: StoryObj<typeof Header> = {
  args: {
    active: "Home",
    searchQuery: "FF",
  },
};

export const WithoutSearch: StoryObj<typeof Header> = {
  args: {
    active: "Home",
    showSearch: false,
  },
};
