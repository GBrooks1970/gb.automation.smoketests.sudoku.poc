const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["app_src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
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
          "format": ["camelCase", "UPPER_CASE"],
          "leadingUnderscore": "allow"
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
          "format": ["camelCase"],
          "leadingUnderscore": "allow"
        }
      ]
    }
  }
];
