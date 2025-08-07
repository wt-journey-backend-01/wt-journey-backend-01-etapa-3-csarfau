import { db } from '../db/db.js';

async function findAll({ cargo, sort } = {}) {
  const query = db('agentes');

  if (cargo) {
    query.where('cargo', 'ilike', cargo);
  }

  if (sort) {
    const column = 'dataDeIncorporacao';
    if (sort === 'dataDeIncorporacao') {
      query.orderBy(column, 'asc');
    } else if (sort === '-dataDeIncorporacao') {
      query.orderBy(column, 'desc');
    }
  }

  return await query;
}

/** Encontra um agente através do ID informado.
 *
 * @param { string } agenteId - ID do agente a ser buscado
 * @returns { Promise }
 */
async function findById(agenteId) {
  return await db('agentes').where({ id: agenteId }).first();
}

/** Cria um agente
 *
 * @param { string[] } newAgenteData - Dados do novo agente
 * @returns { Promise }
 */
async function create(newAgenteData) {
  const [agente] = await db('agentes').returning('*').insert(newAgenteData);
  return agente;
}

/** Atualiza um agente completo ou parcialmente
 *
 * @param { string[] } agenteDataToUpdate - Dados do agente atualizado
 * @param { string } agenteId - ID do agente a ser atualizado
 * @returns { Promise }
 */
async function update(agenteDataToUpdate, agenteId) {
  await db('agentes').where({ id: agenteId }).update(agenteDataToUpdate);
  const agente = await db('agentes').where({ id: agenteId }).first();
  return agente;
}

/** Remove um agente
 *
 * @param { string } agenteId - ID do agente a ser removido
 * @returns { Promise }
 */
async function remove(agenteId) {
  return await db('agentes').where({ id: agenteId }).delete();
}

export const agentesRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};
