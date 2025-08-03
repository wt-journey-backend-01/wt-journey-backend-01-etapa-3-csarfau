const agentes = [];

function findAll() {
  return agentes;
}

/** Encontra um agente através do ID informado.
 *
 * @param { string } agenteId - ID do agente a ser buscado
 * @returns { string[] }
 */
function findById(agenteId) {
  return agentes.find((agente) => agente.id === agenteId);
}

/** Cria um agente
 *
 * @param { string[] } newAgenteData - Dados do novo agente
 * @returns { string[] }
 */
function create(newAgenteData) {
  agentes.push(newAgenteData);
  return newAgenteData;
}

/** Atualiza um agente completo ou parcialmente
 *
 * @param { string[] } agenteDataToUpdate - Dados do agente atualizado
 * @param { string } agenteId - ID do agente a ser atualizado
 * @returns { string[] }
 */
function update(agenteDataToUpdate, agenteId) {
  const agenteIndex = agentes.findIndex((agente) => agente.id === agenteId);

  return (agentes[agenteIndex] = {
    ...agentes[agenteIndex],
    ...agenteDataToUpdate,
  });
}

/** Remove um agente
 *
 * @param { string } agenteId - ID do agente a ser removido
 * @returns { string[] }
 */
function remove(agenteId) {
  const agenteIndex = agentes.findIndex((agente) => agente.id === agenteId);
  return agentes.splice(agenteIndex, 1);
}

export const agentesRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};
