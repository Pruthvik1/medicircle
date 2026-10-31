const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'components/ui/**'],
  },
  {
    rules: {
      // gluestack-ui components under components/ui are generated/vendored —
      // don't fight their lint issues, only lint our own code.
    },
  },
];
