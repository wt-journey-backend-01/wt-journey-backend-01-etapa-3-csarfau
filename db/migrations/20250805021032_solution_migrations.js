/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('agentes', function (table) {
      table.increments('id');
      table.string('nome').notNullable();
      table.date('dataDeIncorporacao').notNullable();
      table.string('cargo').notNullable();
    })
    .createTable('casos', function (table) {
      table.increments('id');
      table.integer('agente_id').unsigned().references('id').inTable('agentes').notNullable();
      table.string('titulo').notNullable();
      table.string('descricao').notNullable();
      table.enu('status', ['aberto', 'solucionado']).notNullable();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists('casos').dropTableIfExists('agentes');
}
