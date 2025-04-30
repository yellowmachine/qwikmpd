import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ActionButton, type ActionButtonProps } from "./action-button";
import { $ } from "@builder.io/qwik";

const meta: Meta<ActionButtonProps> = {
  component: ActionButton,
};

type Story = StoryObj<ActionButtonProps>;

export default meta;

const ok = $(() => {});
const error = $(() => {
  throw 'error';
})

export const Success: Story = {
  args: {
    
  },
  render: (props) => (
    <ActionButton action={ok} successMessage="Action executed" {...props}>
        <button class="px-4 py-2 bg-orange-600 text-white rounded cursor-pointer">
            this will be ok!
        </button>
    </ActionButton>
  ) 
};

export const Error: Story = {
    args: {
      
    },
    render: (props) => (
      <ActionButton action={error} successMessage="Action executed" {...props}>
       <button class="px-4 py-2 bg-red-600 text-white rounded cursor-pointer">
       this will be an error!
        </button>
      </ActionButton>
    ) 
  };
  