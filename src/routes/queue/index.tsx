import { component$ } from '@builder.io/qwik';
import {
    useContext
} from '@builder.io/qwik';
import { storesContext } from '../layout';

export default component$(() => {
    const {queue, state} = useContext(storesContext);
    return (
      <>
        {/* Aquí puedes usar props.state y props.queue */}
        <div>Volumen en Child: {state.volume}</div>
        <div>Canción actual: {queue.currentSong}</div>

      </>
    );
  }
);
