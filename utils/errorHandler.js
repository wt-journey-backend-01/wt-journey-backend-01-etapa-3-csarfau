import * as z from 'zod';

const errorMessages = {
  400: 'Parâmetros inválidos.',
  404: 'Recurso não encontrado.',
  500: 'Erro interno do servidor.',
};

/** Gera um erro customizado
 *
 * @param { string } message
 * @param { string } status
 * @param { string[] } errors
 * @returns
 */
export function createError(status, errors = []) {
  return {
    status,
    errors,
    isCustom: true,
  };
}

/** Middleware para tratar os erros personalizados
 *
 * @param { Error } err - Array de erros encontrados
 * @param { Request } req - Requisição HTTP
 * @param { Response } res - Resposta HTTP
 * @returns { Response }
 */
export function errorHandler(err, req, res, next) {
  if (err.isCustom) {
    return res.status(err.status).json({
      status: err.status,
      message: errorMessages[err.status],
      errors: err.errors,
    });
  }

  return res.status(500).json({
    status: 500,
    message: errorMessages[500],
    errors: err.message,
  });
}
