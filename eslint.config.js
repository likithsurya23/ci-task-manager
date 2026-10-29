const globals = {
  console: "readonly",
  process: "readonly",
  module: "readonly",
  require: "readonly",
  __dirname: "readonly",
  fetch: "readonly",
  URL: "readonly",
  setTimeout: "readonly"
};

module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "double", { avoidEscape: true }],
      "eqeqeq": "error"
    }
  }
];
