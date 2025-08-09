/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('casos').del();
  await knex('agentes').del();
  await knex('agentes').insert([
    { nome: 'Cesar', dataDeIncorporacao: '2018-02-01', cargo: 'Coronel' },
    { nome: 'Arthur', dataDeIncorporacao: '2020-05-10', cargo: 'Xerife' },
    { nome: 'Gabriel', dataDeIncorporacao: '2023-09-24', cargo: 'Investigador' },
  ]);
}
