// Sirve la especificación OpenAPI (server/openapi.yaml) con Swagger UI.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const specPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'openapi.yaml');
export const openApiSpec = YAML.parse(readFileSync(specPath, 'utf8'));

export const docsRouter = Router();

docsRouter.get('/openapi.json', (req, res) => res.json(openApiSpec));
docsRouter.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'Podio API — Documentación',
    swaggerOptions: { persistAuthorization: true },
  }),
);
