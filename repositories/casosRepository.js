import { db } from '../db/db.js';

/** Busca todos os casos salvos.
 *
 * @returns { Promise } Todos os casos
 */
async function findAll({ agente_id, status, q } = {}) {
  const query = db('casos');

  if (agente_id) {
    query.where('agente_id', agente_id);
  }

  if (status) {
    query.where('status', status);
  }

  if (q) {
    query.andWhere(function () {
      this.whereILike('titulo', `%${q}%`).orWhereILike('descricao', `%${q}%`);
    });
  }

  return await query;
}

/** Busca um caso específico pelo ID.
 *
 * @param { string } casoId - ID do caso buscado
 * @returns { Promise }
 */
async function findById(casoId) {
  return await db('casos').where({ id: casoId }).first();
}

/** Cria um novo caso
 *
 * @param { string[] } newCasoData - Dados para criar um novo caso
 * @returns { Promise }
 */
async function create(newCaso) {
  const [caso] = await db('casos').returning('*').insert(newCaso);
  return caso;
}

/** Atualiza um caso completo ou parcialmente
 *
 * @param { string[] } casoDataToUpdate - Dados do caso atualizado
 * @param { string } casoId - ID do caso a ser atualizado
 * @returns { Promise }
 */
async function update(casoDataToUpdate, casoId) {
  await db('casos').where({ id: casoId }).update(casoDataToUpdate);
  const caso = await db('casos').where({ id: casoId }).first();
  return caso;
}

/** Remove um caso
 *
 * @param { string } casoId - ID do caso a ser removido
 * @returns { Promise }
 */
async function remove(casoId) {
  return await db('casos').where({ id: casoId }).delete();
}

export const casosRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};
