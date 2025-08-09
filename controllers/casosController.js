import { casosRepository } from '../repositories/casosRepository.js';
import { createError } from '../utils/errorHandler.js';
import { agentesRepository } from '../repositories/agentesRepository.js';
import { formatZodErrors } from '../utils/formatZodErrors.js';
import * as z from 'zod';

const newCasoSchema = z.object({
  titulo: z.string("O campo 'titulo' deve ser uma string.").min(1, "O campo 'titulo' é obrigatório."),
  descricao: z.string("O campo 'descricao' deve ser uma string.").min(1, "O campo 'descricao' é obrigatório."),
  status: z.enum(['aberto', 'solucionado'], "O campo 'status' deve ser somente 'aberto' ou 'solucionado'."),
  agente_id: z.coerce.number("O campo 'agente_id' deve ser um número.").int().positive(),
});

const indexQuerySchema = z.object({
  agente_id: z.coerce.number("O campo 'agente_id' deve ser um número.").int().positive().optional(),
  status: z
    .enum(['aberto', 'solucionado'], "O parâmetro 'status' deve ser somente 'aberto' ou 'solucionado'.")
    .optional(),
});

const searchQuerySchema = z.object({
  q: z.string('O termo de busca deve ser uma string').optional(),
});

/** Retorna todos os casos salvos
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function index(req, res, next) {
  try {
    const filtros = indexQuerySchema.parse(req.query);

    let casos = await casosRepository.findAll(filtros);

    if (casos.length < 1) {
      return next(createError(404, { casos: 'Nenhum caso encontrado.' }));
    }

    res.status(200).json(casos);
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(createError(400, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Retorna os casos pela filtragem de nome ou titulo
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function search(req, res, next) {
  try {
    const filtros = searchQuerySchema.parse(req.query);

    let casos = await casosRepository.findAll(filtros);

    if (casos.length < 1) {
      return next(createError(404, { casos: 'Nenhum caso encontrado com a frase informada.' }));
    }

    res.status(200).json(casos);
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(createError(400, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Encontra um caso específico
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function show(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const caso = await casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    return res.status(200).json(caso);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'id';
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Cria um novo caso
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function create(req, res, next) {
  try {
    let newCasoData = newCasoSchema.parse(req.body);

    const agente = await agentesRepository.findById(newCasoData.agente_id);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente informado não existe.` }));
    }

    const newCaso = await casosRepository.create(newCasoData);

    return res.status(201).json(newCaso);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'agente_id';
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Atualiza todas as informações de um caso
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function update(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const caso = await casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    if (req.body.id) {
      return next(createError(400, { caso_id: 'Não é possível atualizar o ID do caso.' }));
    }

    const newCasoData = newCasoSchema.parse(req.body);
    delete newCasoData.id;
    const agente = await agentesRepository.findById(newCasoData.agente_id);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente não encontrado.` }));
    }

    const updatedCaso = await casosRepository.update(newCasoData, casoId);
    return res.status(200).json(updatedCaso);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && ['id', 'agente_id'].includes(err.issues[0].path[0]);
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Atualiza informações parciais de um caso
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
    const { id: casoId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const caso = await casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    if (req.body.id) {
      return next(createError(400, { caso_id: 'Não é possível atualizar o ID do caso.' }));
    }

    const casoDataToUpdate = newCasoSchema.partial().strict().parse(req.body);
    delete casoDataToUpdate.id;
    if (casoDataToUpdate.agente_id) {
      const agente = await agentesRepository.findById(casoDataToUpdate.agente_id);

      if (!agente) {
        return next(createError(404, { agente_id: `Agente não encontrado.` }));
      }
    }

    const updatedCaso = await casosRepository.update(casoDataToUpdate, casoId);
    return res.status(200).json(updatedCaso);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && ['id', 'agente_id'].includes(err.issues[0].path[0]);
      const statusCode = isInvalidId ? 404 : 400;
      return next(createError(statusCode, formatZodErrors(err)));
    }
    return next(err);
  }
}

/** Remove um caso
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function remove(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um número.").int().positive(),
      })
      .parse(req.params);

    const caso = await casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    await casosRepository.remove(casoId);

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

/** Exibe o agente responsável por um caso específico
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
async function showResponsibleAgente(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.coerce.number("O campo 'id' deve ser um numero.").int().positive(),
      })
      .parse(req.params);

    const caso = await casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    const agente = await agentesRepository.findById(caso.agente_id);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente não encontrado.` }));
    }

    return res.status(200).json(agente);
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(createError(400, formatZodErrors(err)));
    }
    return next(err);
  }
}

export const casosController = {
  index,
  show,
  create,
  update,
  patch,
  remove,
  showResponsibleAgente,
  search,
};
