import { config } from '../knexfile';
import { knex } from 'knex';

export const db = knex(config.development);
