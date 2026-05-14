module.exports = {
  default: {
    require: ['tests/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['@cucumber/pretty-formatter'],
    paths: ['tests/**/*.feature'],
    publishQuiet: true,
    worldParameters: {}
  }
};

// Tell ts-node to use the cucumber-specific tsconfig
process.env.TS_NODE_PROJECT = 'tsconfig.cucumber.json';

