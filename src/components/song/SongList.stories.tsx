import type { Meta, StoryObj } from "storybook-framework-qwik";
import { SongList, type SongListProps } from "./SongList";

const meta: Meta<SongListProps> = {
  component: SongList,
};

type Story = StoryObj<SongListProps>;

export default meta;

export const List: Story = {
  args: {
    playThis: () => {},
    songs: [
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

  },
  render: (props : SongListProps) => (
    <SongList {...props} currentSong={null} />
  )
};