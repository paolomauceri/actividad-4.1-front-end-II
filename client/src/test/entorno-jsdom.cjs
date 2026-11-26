// Entorno jsdom para Jest con las APIs web que trae Node (Response, Headers…)
// y que jsdom no implementa. Las pruebas simulan fetch devolviendo Response reales.
const { TestEnvironment } = require('jest-environment-jsdom');

const DESDE_NODE = [
  'Response',
  'Request',
  'Headers',
  'ReadableStream',
  'TextEncoder',
  'TextDecoder',
  'structuredClone',
];

class EntornoJsdomConFetch extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    for (const nombre of DESDE_NODE) {
      if (this.global[nombre] === undefined && globalThis[nombre] !== undefined) {
        this.global[nombre] = globalThis[nombre];
      }
    }
  }
}

module.exports = EntornoJsdomConFetch;
