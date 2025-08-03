import express from 'express';
import { agentesController } from '../controllers/agentesController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   responses:
 *     AgenteBadRequest:
 *       description: Parâmetros inválidos
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 400
 *               message:
 *                 type: string
 *                 example: "Parâmetros inválidos."
 *               errors:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 example:
 *                   nome: "O campo 'nome' deve ser uma string."
 *                   dataDeIncorporacao: "O campo 'dataDeIncorporacao' é obrigatório."
 *                   cargo: "O parâmetro 'cargo' deve ser uma string."
 *                   sort: "O parâmetro 'sort' deve ser somente 'dataDeIncorporacao' ou '-dataDeIncorporacao'."
 *     AgenteNotFound:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 404
 *               message:
 *                 type: string
 *                 example: "Recurso não encontrado."
 *               errors:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 example:
 *                   query: "Não foram encontrados agentes com os parâmetros informados."
 *                   agentes: "Nenhum agente encontrado."
 *                   agente_id: "Agente não encontrado."
 *     AgenteEmptyResult:
 *       description: Nenhum agente encontrado com os parâmetros informados
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 404
 *               message:
 *                 type: string
 *                 example: "Nenhum agente encontrado."
 *               errors:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 example:
 *                   query: "Não foram encontrados agentes com os parâmetros informados."
 *
 *   schemas:
 *     AgenteBase:
 *       type: object
 *       required:
 *         - nome
 *         - dataDeIncorporacao
 *         - cargo
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do agente
 *         dataDeIncorporacao:
 *           type: string
 *           format: date
 *           description: Data de incorporação do agente
 *         cargo:
 *           type: string
 *           description: Cargo do agente
 *
 *     NewAgente:
 *       allOf:
 *         - $ref: '#/components/schemas/AgenteBase'
 *       example:
 *         nome: "Rommel Carneiro"
 *         dataDeIncorporacao: "1992-10-04"
 *         cargo: "delegado"
 *
 *     Agente:
 *       allOf:
 *          - type:
 *            properties:
 *              id:
 *                type: string
 *                format: uuid
 *                description: ID gerado automaticamente para um agente
 *          - $ref: '#/components/schemas/AgenteBase'
 *       example:
 *         id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
 *         nome: "Rommel Carneiro"
 *         dataDeIncorporacao: "1992-10-04"
 *         cargo: "delegado"
 *
 */

/**
 * @openapi
 * tags:
 *   name: Agentes
 *   description: Gerenciamento de agentes
 */

/**
 * @openapi
 * /agentes:
 *   get:
 *     summary: Retornar uma lista com todos os agentes
 *     tags: [Agentes]
 *     parameters:
 *       - in: query
 *         name: cargo
 *         schema:
 *           type: string
 *         description: Filtro por cargo de agente
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [dataDeIncorporacao, -dataDeIncorporacao]
 *         description: >
 *           Ordena os agentes pela data de incorporação:
 *             * `dataDeIncorporacao` - Crescente (mais antigo primeiro)
 *             * `-dataDeIncorporacao` - Decrescente (mais recente primeiro)
 *     responses:
 *       200:
 *         description: Lista de agentes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agente'
 *       400:
 *         $ref: '#/components/responses/AgenteBadRequest'
 *       404:
 *         $ref: '#/components/responses/AgenteNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', agentesController.index);

/**
 * @openapi
 * /agentes/{id}:
 *   get:
 *     summary: Retorna um agente específico pelo ID
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agente
 *     responses:
 *       200:
 *         description: Agente encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         $ref: '#/components/responses/AgenteBadRequest'
 *       404:
 *         $ref: '#/components/responses/AgenteNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', agentesController.show);

/**
 * @openapi
 * /agentes:
 *   post:
 *     summary: Cria um novo agente
 *     tags: [Agentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewAgente'
 *     responses:
 *       201:
 *         description: Agente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         $ref: '#/components/responses/AgenteBadRequest'
 *       404:
 *         $ref: '#/components/responses/AgenteNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', agentesController.create);

/**
 * @openapi
 * /agentes/{id}:
 *   put:
 *     summary: Atualiza um agente completamente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewAgente'
 *     responses:
 *       200:
 *         description: Caso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         $ref: '#/components/responses/AgenteBadRequest'
 *       404:
 *         $ref: '#/components/responses/AgenteNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', agentesController.update);

/**
 * @openapi
 * /agentes/{id}:
 *   patch:
 *     summary: Atualiza parcialmente um agente
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               dataDeIncorporacao:
 *                 type: string
 *                 format: date
 *               cargo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         $ref: '#/components/responses/AgenteBadRequest'
 *       404:
 *         $ref: '#/components/responses/AgenteNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id', agentesController.patch);

/**
 * @openapi
 * /agentes/{id}:
 *   delete:
 *     summary: Remove um agente pelo ID
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do agente
 *     responses:
 *       204:
 *         description: Agente removido com sucesso (Sem conteúdo)
 *       400:
 *         $ref: '#/components/responses/AgenteBadRequest'
 *       404:
 *         $ref: '#/components/responses/AgenteNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', agentesController.remove);

export const agentesRouter = router;
