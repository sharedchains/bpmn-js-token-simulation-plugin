import { classes as domClasses, domify, query as domQuery } from 'min-dom';
import { SCOPE_DESTROYED_EVENT, TOGGLE_MODE_EVENT } from '../../../bpmn-js-token-simulation/lib/util/EventHelper';

export default function DataPanel(eventBus, canvas, dataTokenSimulation) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._dataTokenSimulation = dataTokenSimulation;

  this._eventBus.on('import.done', () => this._init());

  this._eventBus.on(TOGGLE_MODE_EVENT, context => {
    let active = context.active;

    let dataPanel = domQuery('.data-panel');
    if (active) {
      domClasses(dataPanel).remove('hidden');
    } else {
      domClasses(dataPanel).add('hidden');
    }
  });

  this._eventBus.on(SCOPE_DESTROYED_EVENT, () => {
    let data = this._dataTokenSimulation.getDataSimulation();
    this.container.textContent = '';

    data.forEach((element) => {
      let section = domify('<div></div>');
      for (const [id, simulationData] of Object.entries(element)) {
        let parent = domify(`<h4 class="participant">${id}</h4>`);
        section.appendChild(parent);
        if (simulationData) {
          for (const [key, variable] of simulationData.entries()) {
            let row = domify(`<p class="variable"><strong>${key}</strong>&nbsp;&nbsp;:&nbsp;&nbsp;${variable.value}</p>`);
            section.append(row);
          }
        }
      }
      this.container.appendChild(section);
    });
  });
}

DataPanel.prototype._init = function() {
  this.panel = domify('<div class="data-panel hidden"><h5>Data Simulation</h5></div>');
  this.container = domify('<div class="data-properties"></div>');

  this.panel.appendChild(this.container);
  this._canvas.getContainer().appendChild(this.panel);
};

DataPanel.$inject = ['eventBus', 'canvas', 'dataTokenSimulation'];