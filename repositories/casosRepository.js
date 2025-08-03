const casos = [];

/** Busca todos os casos salvos.
 *
 * @returns { string[] } Todos os casos
 */
function findAll() {
  return casos;
}

/** Busca um caso específico pelo ID.
 *
 * @param { string } casoId - ID do caso buscado
 * @returns { string[] }
 */
function findById(casoId) {
  return casos.find((caso) => caso.id === casoId);
}

/** Cria um novo caso
 *
 * @param { string[] } newCasoData - Dados para criar um novo caso
 * @returns { string[] }
 */
function create(newCaso) {
  casos.push(newCaso);
  return newCaso;
}

/** Atualiza um caso completo ou parcialmente
 *
 * @param { string[] } casoDataToUpdate - Dados do caso atualizado
 * @param { string } casoId - ID do caso a ser atualizado
 * @returns { string[] }
 */
function update(casoDataToUpdate, casoId) {
  const casoIndex = casos.findIndex((caso) => caso.id === casoId);

  return (casos[casoIndex] = {
    ...casos[casoIndex],
    ...casoDataToUpdate,
  });
}

/** Remove um caso
 *
 * @param { string } casoId - ID do caso a ser removido
 * @returns { string[] }
 */
function remove(casoId) {
  const casoIndex = casos.findIndex((caso) => caso.id === casoId);
  return casos.splice(casoIndex, 1);
}

export const casosRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};
