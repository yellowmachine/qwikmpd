import type { Meta, StoryObj } from "storybook-framework-qwik";
import PlayHere from "./PlayHere";


const meta: Meta = {
  component: PlayHere,
};

type Story = StoryObj;

export default meta;

export const Item: Story = {
  args: {
    
  },
  render: () => (
    <PlayHere path="https://www.youtube.com/watch?v=dQw4w9WgXcQ"  />
  )
};