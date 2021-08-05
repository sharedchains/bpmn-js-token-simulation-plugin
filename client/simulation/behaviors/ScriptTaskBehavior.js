import {
  CODE_EDITOR_PLUGIN_PRESENT_EVENT,
  LOW_PRIORITY,
  SET_DATA_EDITABLE_EVENT, SET_DATA_NOT_EDITABLE_EVENT,
  UPDATED_DATA_EVENT
} from '../../events/EventHelper';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function ScriptTaskBehavior(simulator, eventBus, activityBehavior, scriptRunner, dataTokenSimulation, dataNotifications) {
  this._simulator = simulator;
  this._eventBus = eventBus;
  this._activityBehavior = activityBehavior;
  this._scriptRunner = scriptRunner;
  this._dataTokenSimulation = dataTokenSimulation;
  this._dataNotifications = dataNotifications;

  this.active = false;
  this.dataScopeUpdated = false;

  simulator.registerBehavior('bpmn:ScriptTask', this);

  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this.active = true;
  });

  eventBus.on(UPDATED_DATA_EVENT, () => { this.dataScopeUpdated = true; });
}

ScriptTaskBehavior.prototype.signal = function(context) {

  if (this.active && this.dataScopeUpdated) {
    // if data simulation has changed (by user), I need to re-run the script
    // TODO: I probably need to change scope data :|
    this.enter(context);
    this._eventBus.fire(SET_DATA_NOT_EDITABLE_EVENT);
    this.dataScopeUpdated = false;
  }
  this._activityBehavior.signal(context);
};

ScriptTaskBehavior.prototype.enter = function(context) {
  const { element, scope } = context;
  const { wait } = this._simulator.getConfig(element);

  if (wait && this.active && !this.dataScopeUpdated) {
    this._eventBus.fire(SET_DATA_EDITABLE_EVENT);
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

    let resultVariableType = this._dataTokenSimulation.getResultVariableType(element, bo.resultVariable);
    if (!resultVariableType) {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Missing result variable type for data simulation'
      });
      return;
    }

    this._scriptRunner.runScript(bo.script, scope.data)
      .then(results => {
        this._dataTokenSimulation.addDataElementSimulation(element, {
          name: bo.resultVariable,
          value: results.output,
          type: resultVariableType
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