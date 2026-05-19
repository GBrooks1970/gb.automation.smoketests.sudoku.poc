module.exports = {
  default: {
    require: [
      'tests/screenplay/support/configure.ts',
      'tests/screenplay/step_definitions/**/*.ts',
    ],
    requireModule: ['ts-node/register'],
    format: ['@serenity-js/cucumber:.results/serenity-listener.ndjson', '@cucumber/pretty-formatter'],
    formatOptions: {
      specDirectory: 'tests/features',
    },
    paths: ['tests/features/**/*.feature'],
    publishQuiet: true,
  }
};

// Tell ts-node to use the cucumber-specific tsconfig
process.env.TS_NODE_PROJECT = 'tsconfig.cucumber.json';
