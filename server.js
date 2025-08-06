import express from 'express';
import { agentesRouter } from './routes/agentesRoutes.js';
import { casosRouter } from './routes/casosRoutes.js';
import { errorHandler } from './utils/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/agentes', agentesRouter);
app.use('/casos', casosRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor do Departamento de Polícia rodando em: http://localhost:${PORT}`);
});
