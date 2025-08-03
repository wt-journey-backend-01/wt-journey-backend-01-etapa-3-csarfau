import { casosRepository } from '../repositories/casosRepository.js';
import { v4 as uuidv4 } from 'uuid';
import { createError } from '../utils/errorHandler.js';
import { agentesRepository } from '../repositories/agentesRepository.js';
import { formatZodErrors } from '../utils/formatZodErrors.js';
import * as z from 'zod';

const newCasoSchema = z.object({
  titulo: z.string("O campo 'titulo' deve ser uma string.").min(1, "O campo 'titulo' é obrigatório."),
  descricao: z.string("O campo 'descricao' deve ser uma string.").min(1, "O campo 'descricao' é obrigatório."),
  status: z.enum(['aberto', 'solucionado'], "O campo 'status' deve ser somente 'aberto' ou 'solucionado'."),
  agente_id: z.uuid("O campo 'agente_id' deve ser um UUID válido."),
});

const indexQuerySchema = z.object({
  agente_id: z.uuid("O campo 'agente_id' deve ser um UUID válido.").optional(),
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
function index(req, res, next) {
  try {
    const { agente_id, status } = indexQuerySchema.parse(req.query);

    let casos = casosRepository.findAll();

    if (agente_id) {
      casos = casos.filter((c) => c.agente_id === agente_id);
    }

    if (status) {
      casos = casos.filter((c) => c.status === status);
    }

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
function search(req, res, next) {
  try {
    const { q } = searchQuerySchema.parse(req.query);

    let casos = casosRepository.findAll();

    if (q) {
      const termo = q.toLowerCase();
      casos = casos.filter((c) => c.titulo.toLowerCase().includes(termo) || c.descricao.toLowerCase().includes(termo));
    }

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
function show(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.uuid("O campo 'id' deve ser um UUID válido."),
      })
      .parse(req.params);

    const caso = casosRepository.findById(casoId);

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
    next(err);
  }
}

/** Cria um novo caso
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
function create(req, res, next) {
  try {
    let newCasoData = newCasoSchema.parse(req.body);

    const agente = agentesRepository.findById(newCasoData.agente_id);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente informado não existe.` }));
    }

    newCasoData = { id: uuidv4(), agente_id: agente.id, ...newCasoData };

    const newCaso = casosRepository.create(newCasoData);

    return res.status(201).json(newCaso);
  } catch (err) {
    const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === 'agente_id';
    const statusCode = isInvalidId ? 404 : 400;
    return next(createError(statusCode, formatZodErrors(err)));
  }
}

/** Atualiza todas as informações de um caso
 *
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @param { NextFunction } next - Próximo middleware
 * @returns { Response }
 */
function update(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.uuid("O campo 'id' deve ser um UUID válido."),
      })
      .parse(req.params);

    const caso = casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    if (req.body.id) {
      return next(createError(400, { caso_id: 'Não é possível atualizar o ID do caso.' }));
    }

    const newCasoData = newCasoSchema.parse(req.body);
    delete newCasoData.id;
    const agente = agentesRepository.findById(newCasoData.agente_id);

    if (!agente) {
      return next(createError(404, { agente_id: `Agente não encontrado.` }));
    }

    const updatedCaso = casosRepository.update(newCasoData, casoId);
    return res.status(200).json(updatedCaso);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === ('id' || 'agente_id');
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
function patch(req, res, next) {
  if (!req.body || Object.keys(req.body).length < 1) {
    return next(createError(400, { body: 'Informe pelo menos 1 campo para ser atualizado.' }));
  }

  try {
    const { id: casoId } = z
      .object({
        id: z.uuid("O campo 'id' deve ser um UUID válido."),
      })
      .parse(req.params);

    const caso = casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    if (req.body.id) {
      return next(createError(400, { caso_id: 'Não é possível atualizar o ID do caso.' }));
    }

    const casoDataToUpdate = newCasoSchema.partial().strict().parse(req.body);
    delete casoDataToUpdate.id;
    if (casoDataToUpdate.agente_id) {
      const agente = agentesRepository.findById(casoDataToUpdate.agente_id);

      if (!agente) {
        return next(createError(404, { agente_id: `Agente não encontrado.` }));
      }
    }

    const updatedCaso = casosRepository.update(casoDataToUpdate, casoId);
    return res.status(200).json(updatedCaso);
  } catch (err) {
    if (err.name === 'ZodError') {
      const isInvalidId = err.issues.length === 1 && err.issues[0].path[0] === ('id' || 'agente_id');
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
function remove(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.uuid("O campo 'id' deve ser um UUID válido."),
      })
      .parse(req.params);

    const caso = casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    casosRepository.remove(casoId);

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
function showResponsibleAgente(req, res, next) {
  try {
    const { id: casoId } = z
      .object({
        id: z.uuid("O campo 'id' deve ser um UUID válido."),
      })
      .parse(req.params);

    const caso = casosRepository.findById(casoId);

    if (!caso) {
      return next(createError(404, { caso_id: `Caso não encontrado.` }));
    }

    const agente = agentesRepository.findById(caso.agente_id);

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
