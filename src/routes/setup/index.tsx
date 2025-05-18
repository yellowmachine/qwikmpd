import { $, component$, type QRL } from '@builder.io/qwik';
import { routeLoader$, server$, useNavigate } from '@builder.io/qwik-city';
import type { InitialValues, SubmitHandler } from '@modular-forms/qwik';
import { useForm, valiForm$ } from '@modular-forms/qwik';
import { Host as SetupSchema } from '~/server/schemas'; 
import * as v from 'valibot';
import { getDb } from '~/server/db.server';


type SetupForm = v.InferInput<typeof SetupSchema>;

export const useFormLoader = routeLoader$<InitialValues<SetupForm>>(() => ({
  ip: ''
}));
 
const setup = server$(async function(values){
  const db = await getDb();
  return await db.setSetupDone({...values});
})
 
export default component$(() => {
  const navigate = useNavigate();

  const [, { Form, Field }] = useForm<SetupForm>({
    loader: useFormLoader(),
    validate: valiForm$(SetupSchema),
  });

  const handleSubmit: QRL<SubmitHandler<SetupForm>> = $(async (values, event) => {
    event.preventDefault();
    
    const result = v.safeParse(SetupSchema, values);
    if(result.success){
      await setup(values);
      navigate('/');  
    }
  });
 
  return (
    <div class="flex flex-col items-center justify-center h-screen">
    <Form onSubmit$={handleSubmit} class="border border-brand-300 border-2 px-4 py-8">
      <h1 class="text-brand-500 text-3xl">Setup: IP del servidor mpd</h1>
      <Field name="ip">
        {(field, props) => (
          <div>
            <label for="ip" class="block text-brand-500">IP</label>
            <input {...props} id="ip" type="text" value={field.value} class="border border-brand-300 border-2 mb-4" />
            <span class="text-red-500">{field.error && <div>{field.error}</div>}</span>
          </div>
        )}
      </Field>
      <button class="bg-brand-500 text-white mt-4 p-2" type="submit">Setup</button>
    </Form>
    </div>
  );
});