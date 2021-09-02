import {
  CODE_EDITOR_PLUGIN_PRESENT_EVENT,
  HIGH_PRIORITY,
  LOW_PRIORITY,
  SET_DATA_EDITABLE_EVENT,
  SET_DATA_NOT_EDITABLE_EVENT,
  TOGGLE_DATA_SIMULATION_EVENT,
  UPDATED_DATA_EVENT
} from '../../events/EventHelper';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

export default function ScriptTaskBehavior(simulator, eventBus, activityBehavior, scriptRunner, dataTokenSimulation, dataNotifications) {
  this._simulator = simulator;
  this._eventBus = eventBus;
  this._activityBehavior = activityBehavior;
  this._scriptRunner = scriptRunner;
  this._dataTokenSimulation = dataTokenSimulation;
  this._dataNotifications = dataNotifications;

  this.active = false;
  this.dataScopeUpdated = [];

  simulator.registerBehavior('bpmn:ScriptTask', this);

  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this.active = true;
  });
  eventBus.on(TOGGLE_DATA_SIMULATION_EVENT, context => {
    this.active = context.active;
  });

  eventBus.on(UPDATED_DATA_EVENT, HIGH_PRIORITY, (context) => {
    const { element, participantId, variable } = context;

    if (is(element, 'bpmn:ScriptTask')) {
      this.dataScopeUpdated.push({ element, participantId, variable });
    }
  });
}

ScriptTaskBehavior.prototype.signal = async function(context) {
  const { element, scope } = context;
  if (this.active) {
    let dataScope = this.dataScopeUpdated.find(dScope => dScope.element.id === element.id);
    // if data simulation has changed (by user), I need to re-run the script
    if (dataScope) {
      scope.data.set(dataScope.variable.name, dataScope.variable);
      await this.enter(context);

      this.dataScopeUpdated = this.dataScopeUpdated.filter(dScope => dScope.element.id !== element.id);
    }
    this._activityBehavior.signal(context);
    this._eventBus.fire(SET_DATA_NOT_EDITABLE_EVENT, { element });
  } else {
    this._activityBehavior.signal(context);
  }
};

ScriptTaskBehavior.prototype.enter = function(context) {
  const { element, scope } = context;
  const { wait } = this._simulator.getConfig(element);

  if (wait && this.active && !this.dataScopeUpdated.some(dScope => dScope.element.id === element.id)) {
    this._eventBus.fire(SET_DATA_EDITABLE_EVENT, { element });
  }
  if (this.active) {
    let bo = getBusinessObject(element);

    if (bo.scriptFormat !== 'groovy') {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Script format is not groovy'
      });
      return;
    }

    if (!bo.resultVariable) {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Missing result variable for data simulation'
      });
      return;
    }

    if (!bo.scriptResultVariableType) {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Missing result variable type for data simulation'
      });
      return;
    }

    return this._scriptRunner.runScript(bo.script, scope.data)
      .then(results => {
        this._dataTokenSimulation.addDataElementSimulation(element, {
          name: bo.resultVariable,
          value: results.output,
          type: bo.scriptResultVariableType
        });
        this._activityBehavior.enter(context);
      })
      .catch(error => {
        const truncate = (input) => input.length > 200 ? `${input.substring(0, 200)}...` : input;
        this._dataNotifications.addElementNotification(context.element, {
          type: 'error',
          icon: 'fa-exclamation-triangle',
          text: truncate(error.error)
        });
      });
  } else {
    this._activityBehavior.enter(context);
  }
};

ScriptTaskBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ScriptTaskBehavior.$inject = ['simulator', 'eventBus', 'activityBehavior', 'scriptRunner', 'dataTokenSimulation', 'dataNotifications'];