import type { Meta, StoryObj } from "storybook-framework-qwik";
import Admin from "./Admin";


const meta: Meta = {
  component: Admin,
};

type Story = StoryObj;

export default meta;


export const Primary: Story = {
  args: {
    
  },
  render: () => (
    <Admin />
  ) 
};
