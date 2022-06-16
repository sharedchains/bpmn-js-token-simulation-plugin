import DataNotificationsModule from './data-notifications';
import BehaviorsModule from './behaviors';
import ScriptRunnerModule from './script-runner';
import SettingsModule from './exclusive-gateway-settings';

export default {
  __depends__: [
    BehaviorsModule,
    ScriptRunnerModule,
    DataNotificationsModule,
    SettingsModule
  ]
};