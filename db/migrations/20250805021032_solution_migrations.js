/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('agentes', function (table) {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.date('dataDeIncorporacao').notNullable();
    table.string('cargo').notNullable();
  });

  await knex.schema.createTable('casos', function (table) {
    table.increments('id').primary();
    table.integer('agente_id').unsigned().references('id').inTable('agentes').onDelete('CASCADE');
    table.string('titulo').notNullable();
    table.string('descricao').notNullable();
    table.enum('status', ['aberto', 'solucionado']).notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('casos').dropTableIfExists('agentes');
}
