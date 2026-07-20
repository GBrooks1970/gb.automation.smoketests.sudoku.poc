const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    files: ["app_src/**/*.ts", "tests/**/*.ts", "tooling/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.cucumber.json",
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "default",
          "format": ["camelCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "variable",
          "format": ["camelCase", "UPPER_CASE", "PascalCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "import",
          "format": ["camelCase", "PascalCase"]
        },
        {
          "selector": "parameter",
          "format": ["camelCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        },
        {
          "selector": "memberLike",
          "format": ["camelCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "property",
          "format": ["camelCase", "UPPER_CASE", "PascalCase"],
          "leadingUnderscore": "allow"
        }
      ]
    }
  },
  prettierConfig
];
