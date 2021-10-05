import {
  classes as domClasses,
  delegate as domDelegate,
  domify,
  event as domEvent,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  RESET_SIMULATION_EVENT,
  SCOPE_DESTROYED_EVENT,
  TOGGLE_MODE_EVENT
} from 'bpmn-js-token-simulation/lib/util/EventHelper';

import {
  CODE_EDITOR_PLUGIN_PRESENT_EVENT,
  LOW_PRIORITY,
  SET_DATA_EDITABLE_EVENT,
  SET_DATA_NOT_EDITABLE_EVENT,
  TOGGLE_DATA_SIMULATION_EVENT,
  UPDATED_DATA_EVENT
} from '../events/EventHelper';

/**
 * Draws a panel on simulation mode, if data mode is active
 *
 * @param simulator
 * @param eventBus
 * @param canvas
 * @param dataTokenSimulation
 * @constructor
 */
export default function DataPanel(simulator, eventBus, canvas, dataTokenSimulation) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._dataTokenSimulation = dataTokenSimulation;

  this.editing = false;
  this._active = false;
  this.waitingElements = [];

  /**
   * Event received if Code Editor Plugin is present
   */
  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this._active = true;
  });

  /**
   * On Simulation mode toggle active, activate panel if data mode is active
   */
  this._eventBus.on(TOGGLE_MODE_EVENT, context => {
    let active = context.active;

    let dataPanel = domQuery('.data-panel');
    if (!active) {
      domClasses(dataPanel).add('hidden');
    } else if (this._active) {
      domClasses(dataPanel).remove('hidden');
    }
  });

  /**
   * On data mode toggle, activate data panel [Data mode activation is in {@link ./ToggleData.js|ToggleData module}]
   */
  this._eventBus.on(TOGGLE_DATA_SIMULATION_EVENT, context => {
    this._active = context.active;

    let dataPanel = domQuery('.data-panel');
    if (this._active) {
      domClasses(dataPanel).remove('hidden');
    } else {
      domClasses(dataPanel).add('hidden');
    }
  });

  this._eventBus.on('import.done', () => this._init());

  /**
   * Set data panel in view mode
   */
  this._eventBus.on([SET_DATA_NOT_EDITABLE_EVENT, RESET_SIMULATION_EVENT], (context) => {
    this.editing = false;
    this.waitingElements = context && context.element ? this.waitingElements.filter((element) => element.id !== context.element.id) : [];
  });

  /**
   * Set data panel in edit mode
   */
  this._eventBus.on(SET_DATA_EDITABLE_EVENT, (context) => {
    this.waitingElements.push(context.element);

    let dataVariables = domQueryAll('.variable-value');
    let dataVariableInputs = domQueryAll('.variable-value-input');

    if (dataVariables.length > 0 && dataVariableInputs.length > 0) {
      this.editing = true;

      for (const variable of dataVariables.values()) {
        if (!domClasses(variable).has('hidden')) {
          domClasses(variable).add('hidden');
        }
      }
      for (const variable of dataVariableInputs.values()) {
        domClasses(variable).remove('hidden');
      }
    }
  });

  this._eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
    let dataProperties = domQuery('.data-properties');
    dataProperties.textContent = '';
  });

  /**
   * Builds the data panel on simulation SCOPE_DESTROYED_EVENT
   */
  this._eventBus.on(SCOPE_DESTROYED_EVENT, LOW_PRIORITY, () => {
    if (this._active) {
      let data = this._dataTokenSimulation.getDataSimulation();
      this.container.textContent = '';

      data.forEach((simObject) => {
        let section = domify(`<div class="section"></div>`);
        for (const [id, simulationData] of Object.entries(simObject)) {
          let title = `<div class="sectionTitle">
            <div class="token" style="background-color: ${simulationData.simulation && simulationData.simulation.size ? simulationData.colors.primary : '#999'}"></div>
            <h4 class="participant">${id}</h4>
        </div>`;
          if (simulationData.simulation && simulationData.simulation.size) {
            section.style.borderColor = String(simulationData.colors.primary);
          }
          let domTitle = domify(title);
          section.appendChild(domTitle);
          if (simulationData.simulation) {
            for (const [key, variable] of simulationData.simulation.entries()) {
              let row = domify(`<p class="variable">
                                        <strong>${key}</strong>
                                        &nbsp;&nbsp;:&nbsp;&nbsp;
                                        <span class="variable-value ${this.editing ? 'hidden' : ''}">${variable.value}</span>
                                        <input type="text" class="variable-value-input ${this.editing ? '' : 'hidden'}" value="${variable.value}" />
                                        </p>`);
              domDelegate.bind(row, '.variable-value-input', 'change', event => {
                let newVariable = Object.assign({}, variable, { value: event.target.value });
                this._dataTokenSimulation.updateDataElementSimulation(id, newVariable);

                let scopes = simulator.findScopes((scope) => {
                  return scope.parent?.element.id === id &&
                    this.waitingElements.some(element => element.id === scope.element.id);
                });

                scopes.forEach(scope => {
                  this._eventBus.fire(UPDATED_DATA_EVENT, {
                    participantId: id,
                    variable: newVariable,
                    element: scope.element
                  });
                });
              });
              section.append(row);
            }
          }
        }
        this.container.appendChild(section);
      });
    }
  });
}

DataPanel.prototype._init = function() {
  this.panel = domify('<div class="data-panel hidden"><h5>Data Simulation</h5></div>');
  this.container = domify('<div class="data-properties"></div>');

  this.panel.appendChild(this.container);
  this._canvas.getContainer().appendChild(this.panel);

  domEvent.bind(this.panel, 'wheel', event => {
    event.stopPropagation();
  });
  domEvent.bind(this.panel, 'mousedown', event => {
    event.stopPropagation();
  });
};

DataPanel.$inject = ['simulator', 'eventBus', 'canvas', 'dataTokenSimulation'];