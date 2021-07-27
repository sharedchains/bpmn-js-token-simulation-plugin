import DataNotificationsModule from './data-notifications';
import BehaviorsModule from './behaviors';
import ScriptRunnerModule from './script-runner';

export default {
  __depends__: [
    BehaviorsModule,
    ScriptRunnerModule,
    DataNotificationsModule
  ]
};