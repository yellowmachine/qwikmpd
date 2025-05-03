import { $, component$, type QRL } from '@builder.io/qwik';
import { routeLoader$, server$, useNavigate } from '@builder.io/qwik-city';
import type { InitialValues, SubmitHandler } from '@modular-forms/qwik';
import { useForm, valiForm$ } from '@modular-forms/qwik';
import { Host as SetupSchema } from '~/server/schemas'; 
import * as v from 'valibot';
import { getDb } from '~/server/db';
//import { encrypt } from '~/server/crypt';


type SetupForm = v.InferInput<typeof SetupSchema>;

export const useFormLoader = routeLoader$<InitialValues<SetupForm>>(() => ({
  ip: '',
  username: '',
  password: '',
}));
 
const setup = server$(async function(values){
  const db = await getDb();

  //const keyHex = this.env.get('SECRET')!;
  //const key = Buffer.from(keyHex, 'hex');
  const password = "secret"; //encrypt(key, values.password);
  return await db.setSetupDone({...values, password});
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
      navigate('/queue');  
    }
  });
 
  return (
    <div class="flex flex-col items-center justify-center h-screen">
    <Form onSubmit$={handleSubmit} class="border border-brand-300 border-2 px-4 py-8">
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