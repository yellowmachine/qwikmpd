import type { Meta, StoryObj } from "storybook-framework-qwik";
import { SongList, type SongListProps } from "./SongList";
import type { Song as TSong } from "~/lib/song";

const meta: Meta<SongListProps> = {
  component: SongList,
};

type Story = StoryObj<SongListProps>;

export default meta;

export const List: Story = {
  args: {
    songs: [
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        time: '05:00',
      },
      {
        title: 'Enjoy the silence',
        artist: 'Depeche Mode',
        time: '03:30',
      }
    ]

  },
  render: (props: { songs: TSong[] }) => (
    <SongList songs={props.songs} />
  )
};