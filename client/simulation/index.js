import DataNotifications from './DataNotifications';
import ExclusiveGatewayBehavior from './ExclusiveGatewayBehavior';

export default {
  __init__: ['dataNotifications', 'dataExclusiveGatewayBehavior'],
  dataNotifications: ['type', DataNotifications],
  dataExclusiveGatewayBehavior: ['type', ExclusiveGatewayBehavior]
};