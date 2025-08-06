import config from '../knexfile.js';
import knex from 'knex';

export const db = knex(config.development);
