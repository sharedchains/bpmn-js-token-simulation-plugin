export * from 'bpmn-js/test/helper';

import {
  insertCSS
} from 'bpmn-js/test/helper';

insertCSS('style.css', [
  '@import "base/client/assets/bpmn-js-token-simulation/css/normalize.css";',
  '@import "base/client/assets/bpmn-js-token-simulation/css/bpmn-js-token-simulation.css"'
].join('\n'));

insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

insertCSS('bpmn-font.css', require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'));

insertCSS('diagram-js-testing.css',
  'body .test-container { height: auto }' +
  'body .test-container .test-content-container { height: 90vmin; }'
);