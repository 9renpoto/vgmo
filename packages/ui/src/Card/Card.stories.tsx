import type { Meta, StoryObj } from "@storybook/preact-vite";
import type { CardProps } from "./";
import Card from "./";

const meta: Meta<typeof Card> = {
  component: Card,
  argTypes: {
    title: { control: "text" },
    imageUrl: { control: "text" },
    date: { control: "text" },
    time: { control: "text" },
    location: { control: "text" },
    description: { control: "text" },
    tags: { control: "object" },
    buttonText: { control: "text" },
    buttonUrl: { control: "text" },
  },
};

export default meta;

const defaultArgs: CardProps = {
  title: "ファイナルファンタジー オーケストラコンサート 2024",
  imageUrl: "", // No image url, so it will show the placeholder
  date: "2024年3月15日(金)",
  time: "19:00開演",
  location: "東京国際フォーラム ホールA",
  description: "ファイナルファンタジーシリーズの名曲を東京フィルハーモニー交響楽団が演奏",
  tags: ["ファイナルファンタジー", "オーケストラ", "東京"],
  buttonText: "詳細・チケット情報",
  buttonUrl: "#",
};

export const Default: StoryObj<typeof Card> = {
  args: defaultArgs,
};

export const MobileView: StoryObj = {
  render: () => (
    <div class="grid grid-cols-1 gap-4 p-4">
      <Card {...defaultArgs} />
    </div>
  ),
};

export const DesktopView: StoryObj = {
  render: () => (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <Card {...defaultArgs} title="コンサート1" />
      <Card {...defaultArgs} title="コンサート2" />
      <Card {...defaultArgs} title="コンサート3" />
    </div>
  ),
};
