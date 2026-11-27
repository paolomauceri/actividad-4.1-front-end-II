import '@testing-library/jest-dom';
// IndexedDB en memoria (la cola offline del juez la usa)
import 'fake-indexeddb/auto';
import { TextDecoder, TextEncoder } from 'node:util';
import { cleanup } from '@testing-library/react';

// jsdom no trae TextEncoder/TextDecoder y React Router los necesita
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
