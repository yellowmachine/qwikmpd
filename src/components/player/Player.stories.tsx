import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Player, type PlayerProps } from "./Player";

const meta: Meta<PlayerProps> = {
  component: Player,
};

type Story = StoryObj<PlayerProps>;

export default meta;

export const Primary: Story = {
  args: {
    currentElapsed: 30,
    total: 100
  },
  render: (props: PlayerProps) => (
    <Player  {...props} />
  )
};

export const WithoutProgress: Story = {
    args: {
      currentElapsed: null,
      total: 100
    },
    render: (props: PlayerProps) => (
      <Player  {...props} />
    )
  };