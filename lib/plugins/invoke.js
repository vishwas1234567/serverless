'use strict';

const _ = require('lodash');

class Invoke {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};

    this.commands = {
      invoke: {
        usage: 'Invoke a deployed function',
        configDependent: true,
        lifecycleEvents: ['invoke'],
        options: {
          function: {
            usage: 'The function name',
            required: true,
            shortcut: 'f',
          },
          stage: {
            usage: 'Stage of the service',
            shortcut: 's',
          },
          region: {
            usage: 'Region of the service',
            shortcut: 'r',
          },
          qualifier: {
            usage: 'Version number or alias to invoke',
            shortcut: 'q',
          },
          path: {
            usage: 'Path to JSON or YAML file holding input data',
            shortcut: 'p',
          },
          type: {
            usage: 'Type of invocation',
            shortcut: 't',
          },
          log: {
            usage: 'Trigger logging data output',
            shortcut: 'l',
          },
          data: {
            usage: 'Input data',
            shortcut: 'd',
          },
          raw: {
            usage: 'Flag to pass input data as a raw string',
          },
          context: {
            usage: 'Context of the service',
          },
          contextPath: {
            usage: 'Path to JSON or YAML file holding context data',
          },
        },
        commands: {
          local: {
            usage: 'Invoke function locally',
            lifecycleEvents: ['loadEnvVars', 'invoke'],
            options: {
              'function': {
                usage: 'Name of the function',
                shortcut: 'f',
                required: true,
              },
              'path': {
                usage: 'Path to JSON or YAML file holding input data',
                shortcut: 'p',
              },
              'data': {
                usage: 'input data',
                shortcut: 'd',
              },
              'raw': {
                usage: 'Flag to pass input data as a raw string',
              },
              'context': {
                usage: 'Context of the service',
                shortcut: 'c',
              },
              'contextPath': {
                usage: 'Path to JSON or YAML file holding context data',
                shortcut: 'x',
              },
              'env': {
                usage: 'Override environment variables. e.g. --env VAR1=val1 --env VAR2=val2',
                shortcut: 'e',
              },
              'docker': { usage: 'Flag to turn on docker use for node/python/ruby/java' },
              'docker-arg': {
                usage: 'Arguments to docker run command. e.g. --docker-arg "-p 9229:9229"',
              },
            },
          },
        },
      },
    };

    this.hooks = {
      'invoke:local:loadEnvVars': this.loadEnvVarsForLocal.bind(this),
      'after:invoke:invoke': this.trackInvoke.bind(this),
      'after:invoke:local:invoke': this.trackInvokeLocal.bind(this),
    };
  }

  trackInvoke() {
    return;
  }

  trackInvokeLocal() {
    return;
  }

  /**
   * Set environment variables for "invoke local" that are provider independent.
   */
  loadEnvVarsForLocal() {
    const defaultEnvVars = {
      IS_LOCAL: 'true',
    };

    _.merge(process.env, defaultEnvVars);

    // in some circumstances, setting these provider-independent environment variables is not enough
    // eg. in case of local 'docker' invocation, which relies on this module,
    // these provider-independent environment variables have to be propagated to the container
    this.serverless.service.provider.environment =
      this.serverless.service.provider.environment || {};
    const providerEnv = this.serverless.service.provider.environment;
    for (const [envVariableKey, envVariableValue] of Object.entries(defaultEnvVars)) {
      if (!Object.prototype.hasOwnProperty.call(providerEnv, envVariableKey)) {
        providerEnv[envVariableKey] = envVariableValue;
      }
    }

    // Turn zero or more --env options into an array
    //   ...then split --env NAME=value and put into process.env.
    [].concat(this.options.env || []).forEach((itm) => {
      const splitItm = itm.split('=');
      process.env[splitItm[0]] = splitItm[1] || '';
    });
  }
}

module.exports = Invoke;
