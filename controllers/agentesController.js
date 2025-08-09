import * as z from 'zod';
import { agentesRepository } from '../repositories/agentesRepository.js';
import { createError } from '../utils/errorHandler.js';
import { formatZodErrors } from '../utils/formatZodErrors.js';

const newAgenteSchema = z
  .object({
    nome: z.string("O campo 'nome' deve ser uma string.").min(1, "O campo 'nome' é obrigatório."),
    dataDeIncorporacao: z
      .string("O campo 'dataDeIncorporacao' deve ser uma string.")
      .nonempty("O campo 'dataDeIncorporacao' é obrigatório.")
      .refine((data) => /^\d{4}-\d{2}-\d{2}$/.test(data), {
        message: "O campo 'dataDeIncorporacao' deve estar no formato YYYY-MM-DD.",
      })
      .refine((data) => !isNaN(Date.parse(data)), {
        message: 'A data informada é inválida.',
      })
      .refine((data) => new Date(data) <= new Date(), {
        message: 'A data de incorporação não pode ser maior que a data atual.',
      }),
    cargo: z.string("O campo 'cargo' deve ser uma string.").min(1, "O campo 'cargo' é obrigatório."),
  })
  .strict();

const searchQuerySchema = z.object({
  cargo: z.string("O parâmetro 'cargo' deve ser uma string.").optional(),
  sort: z
    .enum(
      ['dataDeIncorporacao', '-dataDeIncorporacao'],
      "O parâmetro 'sort' deve ser somente 'dataDeIncorporacao' ou '-dataDeIncorporacao'.",
    )
    .optional(),
});

/** Retorna todos os agentes salvos
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function index(req, res, next) {
  try {
    const filtros = searchQuerySchema.parse(req.query);

    let agentes = await agentesRepository.findAll(filtros);

    if (agentes.length < 1) {
      return next(createError(404, { agentes: 'Nenhum agente encontrado.' }));
    }

    res.status(200).json(agentes);
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(createError(400, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Encontra um agente específico
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function show(req, res, next) {
  try {
    const { id: agenteId } = z
      .object({
        id: z.coerce.number("O parâmetro 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const agente = await agentesRepository.findById(agenteId);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente não encontrado.` }));
    }

    return res.status(200).json(agente);
  } catch (err) {
    console.log(err.issues);

    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'id';
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Cria um novo agente
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function create(req, res, next) {
  try {
    let newAgenteData = newAgenteSchema.parse(req.body);

    const newAgente = await agentesRepository.create(newAgenteData);

    return res.status(201).json(newAgente);
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(createError(400, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Atualiza todas as informações de um agente
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function update(req, res, next) {
  try {
    const { id: agenteId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const agente = await agentesRepository.findById(agenteId);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente com o ID: ${agenteId} não encontrado.` }));
    }

    if (req.body.id) {
      return next(createError(400, { agente_id: 'Não é possível atualizar o ID do agente.' }));
    }

    const newAgenteData = newAgenteSchema.parse(req.body);
    delete newAgenteData.id;

    const updatedAgente = await agentesRepository.update(newAgenteData, agenteId);
    return res.status(200).json(updatedAgente);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'id';
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Atualiza informações parciais de um agente
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function patch(req, res, next) {
  if (!req.body || Object.keys(req.body).length < 1) {
    return next(createError(400, { body: 'Informe pelo menos 1 campo para ser atualizado.' }));
  }

  try {
    const { id: agenteId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const agente = await agentesRepository.findById(agenteId);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente não encontrado.` }));
    }

    if (req.body.id) {
      return next(createError(400, { agente_id: 'Não é possível atualizar o ID do agente.' }));
    }

    const agenteDataToUpdate = newAgenteSchema.partial().strict().parse(req.body);

    const updatedAgente = await agentesRepository.update(agenteDataToUpdate, agenteId);
    return res.status(200).json(updatedAgente);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'id';
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Remove um agente
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function remove(req, res, next) {
  try {
    const { id: agenteId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const agente = await agentesRepository.findById(agenteId);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente não encontrado.` }));
    }

    await agentesRepository.remove(agenteId);

    res.status(204).send();
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'id';
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

export const agentesController = {
  index,
  show,
  create,
  update,
  patch,
  remove,
};
