import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Base, type BaseProps } from "./Base";
import { $, component$, useSignal } from "@builder.io/qwik";
import { type AudioFileMetadata } from "~/server/mpd";


const meta: Meta<BaseProps> = {
  component: Base,
};

type Story = StoryObj<BaseProps>;

export default meta;

const directoriesData = [
    'depeche-mode',
    'led-zeppelin'
  ]

const filesData: AudioFileMetadata[] = [
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
]


export const Primary: Story = {
  args: {
  },
  render: () => {
    return <Wrapper />;
}};

const Wrapper = component$(() => {
    const history = useSignal<string[]>(['', 'depeche-mode']);
    const files = useSignal<AudioFileMetadata[]>(filesData);
    const directories = useSignal<string[]>(directoriesData);

    const goBack = $(() => {
        history.value = history.value.slice(0, -1);
    })
    const goPath = $(() => {})

    return (
        <Base 
            history={history.value} 
            directories={directories.value} 
            files={files.value} 
            goPath={goPath}
            goBack={goBack} />
    );

})