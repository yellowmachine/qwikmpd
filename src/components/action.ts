import { $ } from "@builder.io/qwik";

export const myClientAction = $(async () => {
    // lógica cliente, por ejemplo fetch, validaciones, etc.
    console.log('Action ejecutada en cliente');
    await new Promise((res) => setTimeout(res, 1000));
    // Para simular error:
    throw new Error('Error simulado');
})