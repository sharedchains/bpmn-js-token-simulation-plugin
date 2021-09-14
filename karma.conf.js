'use strict';
var path = require('path');
var absoluteBasePath = path.resolve(__dirname);

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers =
  (process.env.TEST_BROWSERS || 'ChromeHeadless')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g)
    .map(function(browser) {
      if (browser === 'ChromeHeadless') {
        process.env.CHROME_BIN = require('puppeteer').executablePath();
      }

      return browser;
    });

var suite = 'test/suite.js';


module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'sinon-chai',
      'webpack'
    ],

    files: [
      { pattern: 'client/assets/**/*', included: false, served: true },
      suite
    ],

    preprocessors: {
      [suite]: [ 'webpack' ]
    },

    reporters: [ 'progress' ],

    browsers: browsers,
    browserNoActivityTimeout: 30000,

    autoWatch: false,
    singleRun: true,

    client: {
      mocha: {
        timeout: 10000
      }
    },

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(css|bpmn)$/,
            use: 'raw-loader'
          },
          {
            test: /\.png$/,
            use: 'url-loader'
          }
        ]
      },
      resolve: {
        mainFields: [
          'dev:module',
          'browser',
          'module',
          'main'
        ],
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      }
    }
  });
};
