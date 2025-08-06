/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('casos').del();
  await knex('casos').insert([
    {
      agente_id: 1,
      titulo: 'Investigação do roubo no banco central',
      descricao: 'Caso envolve invasão ao cofre e roubo de milhões.',
      status: 'aberto',
    },
    {
      agente_id: 2,
      titulo: 'Desaparecimento misterioso no centro',
      descricao: 'Morador sumiu sem deixar vestígios.',
      status: 'aberto',
    },
    {
      agente_id: 3,
      titulo: 'Operação em favela termina em prisão',
      descricao: 'Agente Gabriel liderou operação bem-sucedida.',
      status: 'solucionado',
    },
  ]);
}
