import { CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY } from '../../events/EventHelper';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function ScriptTaskBehavior(simulator, eventBus, activityBehavior, scriptRunner, dataTokenSimulation, dataNotifications) {
  this._activityBehavior = activityBehavior;
  this._scriptRunner = scriptRunner;
  this._dataTokenSimulation = dataTokenSimulation;
  this._dataNotifications = dataNotifications;

  this.active = false;

  simulator.registerBehavior('bpmn:ScriptTask', this);

  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this.active = true;
  });


  // TODO: To remove when we will show data simulation results
  simulator.on('trace', (event) => {
    const {
      scope,
      action,
      element
    } = event;

    if (scope) {
      const {
        initiator,
        data,
        element: scopeElement
      } = scope;

      console.log(`${action}ing element ${scopeElement.id} with data ${JSON.stringify([...data], null, 2)}`);
    }

    console.log(`${action} for element ${element.id}`);

  });
}

ScriptTaskBehavior.prototype.signal = function(context) {
  this._activityBehavior.signal(context);
};

ScriptTaskBehavior.prototype.enter = function(context) {
  if (this.active) {
    const { element, scope } = context;
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