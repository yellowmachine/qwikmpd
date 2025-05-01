import type { Meta, StoryObj } from "storybook-framework-qwik";
import {Library} from "./Library";

const meta: Meta = {
  component: Library,
};

type Story = StoryObj;

export default meta;

export const Primary: Story = {
  args: {
    
  },
  render: () => {
    return (
        <Library  />
    )
  }
};