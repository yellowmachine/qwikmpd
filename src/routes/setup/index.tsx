import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { InitialValues } from '@modular-forms/qwik';
import { formAction$, useForm, valiForm$ } from '@modular-forms/qwik';
import { Host as SetupSchema } from '~/server/schemas'; 
import type * as v from 'valibot';

type SetupForm = v.InferInput<typeof SetupSchema>;

export const useFormLoader = routeLoader$<InitialValues<SetupForm>>(() => ({
  ip: '',
  username: '',
  password: '',
}));
 
export const useFormAction = formAction$((values) => {
  // Runs on server
  return values;
}, valiForm$(SetupSchema));
 
export default component$(() => {
  const [, { Form, Field }] = useForm<SetupForm>({
    loader: useFormLoader(),
    action: useFormAction(),
    validate: valiForm$(SetupSchema),
  });
 
  return (
    <div class="flex flex-col items-center justify-center h-screen">
    <Form class="border border-brand-300 border-2 px-4 py-8">
      <h1 class="text-brand-500 text-3xl">Setup</h1>
      <Field name="ip">
        {(field, props) => (
          <div>
            <label for="ip" class="block text-brand-500">IP</label>
            <input {...props} id="ip" type="text" value={field.value} class="border border-brand-300 border-2 mb-4" />
            <span class="text-red-500">{field.error && <div>{field.error}</div>}</span>
          </div>
        )}
      </Field>
      <Field name="username">
        {(field, props) => (
          <div>
            <label for="username" class="block text-brand-500">Username</label>
            <input {...props} id="username" type="text" value={field.value} class="border border-brand-300 border-2 mb-4" />
            <span class="text-red-500">{field.error && <div>{field.error}</div>}</span>
          </div>
        )}
      </Field>
      <Field name="password">
        {(field, props) => (
          <div>
            <label for="password" class="block text-brand-500">Password</label>
            <input {...props} id="password" type="text" value={field.value} class="border border-brand-300 border-2 mb-4" />
            <span class="text-red-500">{field.error && <div>{field.error}</div>}</span>
          </div>
        )}
      </Field>
      <button class="bg-brand-500 text-white mt-4 p-2" type="submit">Setup</button>
    </Form>
    </div>
  );
});