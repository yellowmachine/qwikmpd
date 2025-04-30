import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Player, type PlayerProps } from "./Player";
import { component$, useSignal } from "@builder.io/qwik";

const meta: Meta<PlayerProps> = {
  component: Player,
};

type Story = StoryObj<PlayerProps>;

export default meta;

export const Primary: Story = {
  args: {
    //currentElapsed: 30,
    total: 100
  },
  render: (props: PlayerProps) => {
    const StoreComponent = component$(() => {
      const currentElapsed = useSignal(30);
      return <Player {...props} currentElapsed={currentElapsed} />;
    });
    return <StoreComponent />;
}};

export const WithoutCurrentElapsed: Story = {
  args: {
    //currentElapsed: 30,
    total: 100
  },
  render: (props: PlayerProps) => {
    const StoreComponent = component$(() => {
      const currentElapsed = useSignal(null);
      return <Player {...props} currentElapsed={currentElapsed} />;
    });
    return <StoreComponent />;
}};