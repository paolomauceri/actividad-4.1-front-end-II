import { destinoPorRol } from '../destinos.js';

describe('destinoPorRol', () => {
  it('lleva a cada rol a su panel', () => {
    expect(destinoPorRol('ADMIN')).toBe('/admin');
    expect(destinoPorRol('JUEZ')).toBe('/juez');
    expect(destinoPorRol('ATLETA')).toBe('/atleta');
  });

  it('manda al inicio si el rol no se conoce', () => {
    expect(destinoPorRol('OTRO')).toBe('/');
    expect(destinoPorRol(undefined)).toBe('/');
  });
});
