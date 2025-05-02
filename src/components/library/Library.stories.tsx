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
        <Library  initialData={
            {
                file: [
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
                directory: ['depeche-mode', 'led-zeppelin']
            } 
        } />
    )
  }
};