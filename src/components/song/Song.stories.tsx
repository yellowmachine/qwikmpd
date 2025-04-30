import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Song, type SongProps } from "./Song";
import type { Song as TSong } from "~/lib/song";

const meta: Meta<SongProps> = {
  component: Song,
};

type Story = StoryObj<SongProps>;

export default meta;

export const Item: Story = {
  args: {
    song: {
      title: 'Cancion',
      artist: 'Artista',
      time: '00:00',
    }
  },
  render: (props: { song: TSong; }) => (
    <Song song={props.song} />
  )
};