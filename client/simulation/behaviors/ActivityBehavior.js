import {
  CODE_EDITOR_PLUGIN_PRESENT_EVENT,
  LOW_PRIORITY,
  SET_DATA_EDITABLE_EVENT,
  SET_DATA_NOT_EDITABLE_EVENT
} from '../../events/EventHelper';

export default function ActivityBehavior(simulator, eventBus, activityBehavior) {
  this._simulator = simulator;
  this._eventBus = eventBus;
  this._activityBehavior = activityBehavior;

  this.active = false;

  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this.active = true;
  });

  const elements = [
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ];

  for (const element of elements) {
    simulator.registerBehavior(element, this);
  }
}

ActivityBehavior.prototype.signal = function(context) {
  if (this.active) {
    this._eventBus.fire(SET_DATA_NOT_EDITABLE_EVENT);
  }
  this._activityBehavior.signal(context);
};

ActivityBehavior.prototype.enter = function(context) {
  const { element } = context;
  const { wait } = this._simulator.getConfig(element);

  if (wait && this.active) {
    this._eventBus.fire(SET_DATA_EDITABLE_EVENT);
  }
  this._activityBehavior.enter(context);
};

ActivityBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ActivityBehavior.$inject = ['simulator', 'eventBus', 'activityBehavior'];