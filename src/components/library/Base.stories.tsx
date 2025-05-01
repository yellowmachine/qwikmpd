import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Base, type BaseProps } from "./Base";
import { $ } from "@builder.io/qwik";

const meta: Meta<BaseProps> = {
  component: Base,
};

type Story = StoryObj<BaseProps>;

export default meta;

export const Primary: Story = {
  args: {
    history: [''],
    directories: [
      'depeche-mode',
      'led-zeppelin'
    ],
    files: [
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        time: '05:00',
        uri: 'led-zeppelin/stairway-to-heaven'
      },
      {
        title: 'Enjoy the silence',
        artist: 'Depeche Mode',
        time: '03:30',
        uri: 'depeche-mode/enjoy-the-silence'
      }
    ],
    goPath: $(() => {}),
    goBack: $(() => {})
  },
  render: (props: BaseProps) => {
    return <Base {...props} />;
}};
