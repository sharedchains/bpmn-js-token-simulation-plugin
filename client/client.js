import {
  registerBpmnJSPlugin
} from 'camunda-modeler-plugin-helpers';

import TokenSimulationModule from 'bpmn-js-token-simulation';
import HideModelerElements from './HideModelerElements';
import TokenPropertiesProvider from './propertiesProvider';

const TokenSimulationPluginModule = {
  __depends__: [
    TokenPropertiesProvider
  ],
  __init__: ['hideModelerElements'],
  hideModelerElements: ['type', HideModelerElements]
};

registerBpmnJSPlugin(TokenSimulationModule);
registerBpmnJSPlugin(TokenSimulationPluginModule);
