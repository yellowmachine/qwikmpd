import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Console } from './Console';

const meta: Meta = {
  component: Console,
};

type Story = StoryObj;

export default meta;

export const Primary: Story = {
  args: {
    
  },
  render: () => {
    return (
        <Console logs={
            [
                { type: 'stdout', data: 'Iniciando actualización...\n' },
                { type: 'stdout', data: 'Descargando código...\n' },
                { type: 'stderr', data: 'Error: No se pudo conectar al repositorio\n' },
                { type: 'stdout', data: 'Actualización completada.\n' },
            ]   
        } />
    )
  }
};