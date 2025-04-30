import type { Meta, StoryObj } from "storybook-framework-qwik";
import { IsPlaying, type IsPlayingProps } from "./IsPlaying";

const meta: Meta<IsPlayingProps> = {
  component: IsPlaying,
};

type Story = StoryObj<IsPlayingProps>;

export default meta;

export const showIsPlaying: Story = {
  args: {
    isPlaying: true
  },
  render: (props: { isPlaying: boolean; }) => (
    <IsPlaying isPlaying={props.isPlaying} />
  )
};