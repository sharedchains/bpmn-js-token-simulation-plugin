import ActivityBehavior from './ActivityBehavior';
import ScriptTaskBehavior from './ScriptTaskBehavior';
import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';

export default {
  __init__: ['dataActivityBehavior', 'dataScriptTaskBehavior', 'dataExclusiveGatewayBehavior'],
  dataActivityBehavior: ['type', ActivityBehavior],
  dataScriptTaskBehavior: ['type', ScriptTaskBehavior],
  dataExclusiveGatewayBehavior: ['type', ExclusiveGatewayBehavior]
};