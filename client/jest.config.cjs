// Configuración de Jest para las pruebas unitarias de los componentes React.
// Babel solo se usa aquí (Vite compila la app con su propio plugin de React).
module.exports = {
  testEnvironment: '<rootDir>/src/test/entorno-jsdom.cjs',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },
  moduleNameMapper: {
    // CSS Modules: devuelve el nombre de la clase tal cual (styles.card → "card")
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.(css)$': '<rootDir>/src/test/archivo-estatico.js',
    '\\.(svg|png|jpg|jpeg|webp|ico|woff2?)$': '<rootDir>/src/test/archivo-estatico.js',
  },
  clearMocks: true,
};
