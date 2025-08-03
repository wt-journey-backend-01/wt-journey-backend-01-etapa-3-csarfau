import express from 'express';
import { casosController } from '../controllers/casosController.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   responses:
 *     BadRequest:
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
 *                   titulo: "O campo 'titulo' deve ser uma string."
 *                   descricao: "O campo 'descricao' deve ser uma string."
 *                   status: "O campo 'status' deve ser somente 'aberto' ou 'solucionado'."
 *                   agente_id: "O campo 'agente_id' deve ser um UUID válido."
 *                   q: "O termo de busca deve ser uma string."
 *     NotFound:
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
 *                   agente_id: "Agente não encontrado."
 *                   caso_id: "Caso não encontrado."
 *                   query: "Não foram encontrados casos com os parâmetros informados."
 *     ServerError:
 *       description: Erro interno do servidor
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 500
 *               message:
 *                 type: string
 *                 example: "Erro interno do servidor."
 *
 *   schemas:
 *     CasoBase:
 *       type: object
 *       required:
 *         - titulo
 *         - descricao
 *         - status
 *         - agente_id
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título do caso
 *         descricao:
 *           type: string
 *           description: Descrição do caso
 *         status:
 *           type: string
 *           description: Status do caso
 *           enum: [aberto, solucionado]
 *         agente_id:
 *           type: string
 *           format: uuid
 *           description: ID do agente responsável pelo caso
 *
 *     NewCaso:
 *       allOf:
 *         - $ref: '#/components/schemas/CasoBase'
 *       example:
 *         titulo: homicidio
 *         descricao: Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.
 *         status: aberto
 *         agente_id: 401bccf5-cf9e-489d-8412-446cd169a0f1
 *
 *     Caso:
 *       allOf:
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: ID gerado automaticamente para um caso
 *         - $ref: '#/components/schemas/CasoBase'
 *       example:
 *         id: f5fb2ad5-22a8-4cb4-90f2-8733517a0d46
 *         titulo: homicidio
 *         descricao: Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.
 *         status: aberto
 *         agente_id: 401bccf5-cf9e-489d-8412-446cd169a0f1
 */

/**
 * @openapi
 * tags:
 *   name: Casos
 *   description: Gerenciamento de casos
 */

/**
 * @openapi
 * /casos:
 *   get:
 *     summary: Retorna uma lista de todos os casos
 *     tags: [Casos]
 *     parameters:
 *       - in: query
 *         name: agente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de um agente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberto, solucionado]
 *         description: Status do caso
 *     responses:
 *       200:
 *         description: Lista de casos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Caso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', casosController.index);

/**
 * @openapi
 * /casos/search:
 *   get:
 *     summary: Retorna uma lista de todos os casos com filtro pelo título ou descrição
 *     tags: [Casos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Palavra ou frase filtrada
 *     responses:
 *       200:
 *         description: Lista de casos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Caso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/search', casosController.search);

/**
 * @openapi
 * /casos/{id}:
 *   get:
 *     summary: Retorna um caso específico pelo ID
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do caso desejado
 *     responses:
 *       200:
 *         description: Caso específico retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', casosController.show);

/**
 * @openapi
 * /casos/{id}/agente:
 *   get:
 *     summary: Retorna as informações do agente responsável pelo caso especificado
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do caso que o agente é responável
 *     responses:
 *       200:
 *         description: Informações do agente responsável retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/agente', casosController.showResponsibleAgente);

/**
 * @openapi
 * /casos:
 *   post:
 *     summary: Cria um novo caso
 *     tags: [Casos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCaso'
 *     responses:
 *       201:
 *         description: Caso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', casosController.create);

/**
 * @openapi
 * /casos/{id}:
 *   put:
 *     summary: Atualiza um caso completamente
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do caso que o agente é responável
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCaso'
 *     responses:
 *       200:
 *         description: Caso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', casosController.update);

/**
 * @openapi
 * /casos/{id}:
 *   patch:
 *     summary: Atualiza parcialmente um caso
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [aberto, solucionado]
 *               agente_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Caso atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id', casosController.patch);

/**
 * @openapi
 * /casos/{id}:
 *   delete:
 *     summary: Remove um caso do sistema
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso a ser removido
 *     responses:
 *       204:
 *         description: Caso removido com sucesso (sem conteúdo)
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', casosController.remove);

export const casosRouter = router;
