import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { InitialValues } from '@modular-forms/qwik';
import { formAction$, useForm, valiForm$ } from '@modular-forms/qwik';
import { Host as SetupSchema } from '~/server/schemas'; 
import * as v from 'valibot';

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
    <Form>
      <Field name="ip">
        {(field, props) => (
          <div>
            <input {...props} type="text" value={field.value} />
            {field.error && <div>{field.error}</div>}
          </div>
        )}
      </Field>
      <Field name="username">
        {(field, props) => (
          <div>
            <input {...props} type="text" value={field.value} />
            {field.error && <div>{field.error}</div>}
          </div>
        )}
      </Field>
      <Field name="password">
        {(field, props) => (
          <div>
            <input {...props} type="text" value={field.value} />
            {field.error && <div>{field.error}</div>}
          </div>
        )}
      </Field>
      <button type="submit">Setup</button>
    </Form>
  );
});