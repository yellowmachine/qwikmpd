import { $, component$, type QRL } from '@builder.io/qwik';
import { useForm, valiForm$, type SubmitHandler, insert, remove } from '@modular-forms/qwik';
import { SettingsSchema, type SettingsForm } from '~/lib/schemas';
import { server$ } from '@builder.io/qwik-city';
import { getDb } from '~/server/db.server';
import { useSettingsLoader } from '~/routes/(app)/admin';
import * as v from 'valibot';


export const saveSettings = server$(async (values: SettingsForm) => {
  const db = await getDb();
  await db.setData(values);
});

export default component$(() => {
  const [form, { Form, Field, FieldArray }] = useForm<SettingsForm>({
    loader: useSettingsLoader(),
    validate: valiForm$(SettingsSchema),
    fieldArrays: ['clients']
  });

  const handleSubmit: QRL<SubmitHandler<SettingsForm>> = $(async (values, event) => {
    event.preventDefault();
        
    const result = v.safeParse(SettingsSchema, values);
    if(result.success){
      await saveSettings(values);
      alert('Configuración guardada correctamente');  
    }
  });

  return (
    <div>
    <Form onSubmit$={handleSubmit} class="p-4 border rounded max-w-3xl mx-auto text-brand-500">
      <h2 class="text-2xl mb-6">Configuración General</h2>

      {/* Server IP */}
      <Field name="server.ip">
        {(field, props) => (
          <div class="mb-4">
            <label class="block mb-1 font-semibold">IP del servidor</label>
            <input {...props} type="text" value={field.value} class="border p-2 w-full" />
            {field.error && <p class="text-red-600 mt-1">{field.error}</p>}
          </div>
        )}
      </Field>

      <Field name='setupDone' type="boolean">
        {(field, props) => (
          <div class="mb-4">
            <label class="block mb-1 font-semibold">Setup hecho?</label>
            <input {...props} type="checkbox" checked={field.value} class="border p-2 w-full" />
            {field.error && <p class="text-red-600 mt-1">{field.error}</p>}
          </div>
        )}
    </Field>

      <FieldArray name="clients">
        {(fieldArray) =>
            fieldArray.items.map((item, index) => (
              <>
              <div key={item}>
                  <Field name={`clients.${index}.ip`}>
                      {(field, props) => (
                          <div class="mb-4">
                          <label class="block mb-1 font-semibold">IP del cliente</label>
                          <input {...props} type="text" value={field.value} class="border p-2 w-full" />
                          {field.error && <p class="text-red-600 mt-1">{field.error}</p>}
                        </div>
                      )}
                  </Field>
              </div>
              <button type="button" class="bg-red-300 text-white px-6 py-2 rounded mt-4" 
                onClick$={() => remove(form, 'clients', {at: index})}>
                  Eliminar
              </button>
            </>
            ))
        }
      </FieldArray>

      <button type="button" class="bg-brand-600 text-white px-6 py-2 rounded mt-4 float-right" 
        onClick$={() => insert(form, 'clients', {value: { ip: '' }})} >
          Añadir
      </button>


      {/* Volume */}
      <Field name="volume" type="number">
        {(field, props) => (
          <div class="mb-4">
            <label class="block mb-1 font-semibold">Volumen</label>
            <input {...props} type="number" value={field.value} class="border p-2 w-full" min={0} max={100} />
            {field.error && <p class="text-red-600 mt-1">{field.error}</p>}
          </div>
        )}
      </Field>

      {/* Latency */}
      <Field name="latency" type="number">
        {(field, props) => (
          <div class="mb-4">
            <label class="block mb-1 font-semibold">Latencia (ms)</label>
            <input {...props} type="number" value={field.value} class="border p-2 w-full" min={0} />
            {field.error && <p class="text-red-600 mt-1">{field.error}</p>}
          </div>
        )}
      </Field>

      <button type="submit" class="bg-brand-600 text-white px-6 py-2 rounded mt-4 cursor-pointer">
          Guardar Configuración
      </button>
    </Form>
    </div>
  );
});
