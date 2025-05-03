import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Song, type SongProps } from "./Song";

const meta: Meta<SongProps> = {
  component: Song,
};

type Story = StoryObj<SongProps>;

export default meta;

export const ItemEqualsCurrentSong: Story = {
  args: {
    song: {
      title: 'Never let me down',
      artist: 'Depeche Mode',
      time: '05:30',
      uri: 'depeche-mode/never-let-me-down'
    },
    currentSong: {
      uri: 'depeche-mode/never-let-me-down',
      elapsed: 30,
      total: 100
    }
  },
  render: (props: SongProps) => (
    <Song song={props.song} currentSong={props.currentSong} pos={0} />
  )
};

export const ItemNotEqualsCurrentSong: Story = {
  args: {
    song: {
      title: 'Never let me down',
      artist: 'Depeche Mode',
      time: '05:30',
      uri: 'depeche-mode/never-let-me-down'
    },
    currentSong: null
  },
  render: (props: SongProps) => (
    <Song song={props.song} currentSong={props.currentSong} pos={0} />
  )
};