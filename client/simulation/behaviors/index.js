import ScriptTaskBehavior from './ScriptTaskBehavior';
import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';

export default {
  __init__: ['dataScriptTaskBehavior', 'dataExclusiveGatewayBehavior'],
  dataScriptTaskBehavior: ['type', ScriptTaskBehavior],
  dataExclusiveGatewayBehavior: ['type', ExclusiveGatewayBehavior]
};