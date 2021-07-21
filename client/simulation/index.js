import DataBehaviour from './DataBehaviour';
import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';

export default {
  __init__: ['dataBehaviour', 'dataExclusiveGatewayBehavior'],
  dataBehaviour: ['type', DataBehaviour],
  dataExclusiveGatewayBehavior: ['type', ExclusiveGatewayBehavior]
};