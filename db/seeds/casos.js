/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const agentes = await knex('agentes').select('id');
  await knex('casos').del();
  await knex('casos').insert([
    {
      agente_id: agentes[0].id,
      titulo: 'Investigação do roubo no banco central',
      descricao: 'Caso envolve invasão ao cofre e roubo de milhões.',
      status: 'aberto',
    },
    {
      agente_id: agentes[1].id,
      titulo: 'Desaparecimento misterioso no centro',
      descricao: 'Morador sumiu sem deixar vestígios.',
      status: 'aberto',
    },
    {
      agente_id: agentes[2].id,
      titulo: 'Operação em favela termina em prisão',
      descricao: 'Agente Gabriel liderou operação bem-sucedida.',
      status: 'solucionado',
    },
  ]);
}
