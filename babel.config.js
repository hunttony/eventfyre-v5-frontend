// @babel/preset-env with specific target for Jest
const isTest = String(process.env.NODE_ENV) === 'test';

module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: isTest ? { node: 'current' } : 'defaults',
      modules: isTest ? 'commonjs' : false,
    }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
