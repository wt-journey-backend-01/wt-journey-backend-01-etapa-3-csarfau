import { db } from '../db/db.js';

async function findAll() {
  return await db('agentes');
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
  return await db('agentes').returning('*').insert(newAgenteData);
}

/** Atualiza um agente completo ou parcialmente
 *
 * @param { string[] } agenteDataToUpdate - Dados do agente atualizado
 * @param { string } agenteId - ID do agente a ser atualizado
 * @returns { Promise }
 */
async function update(agenteDataToUpdate, agenteId) {
  return await db('agentes').where({ id: agenteId }).update(agenteDataToUpdate, '*');
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
