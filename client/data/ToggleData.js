import {
  classes as domClasses,
  domify,
  event as domEvent
} from 'min-dom';
import { CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, TOGGLE_DATA_SIMULATION_EVENT } from '../events/EventHelper';

export default function ToggleData(eventBus, tokenSimulationPalette) {
  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;

  this._active = false;
  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this._active = true;
  });

  this._init();
}

ToggleData.prototype._init = function() {
  this.paletteEntry = domify(`
    <div class="entry active" title="Toggle data">
      <i class="fa fa-bar-chart"></i>
    </div>
  `);

  domEvent.bind(this.paletteEntry, 'click', () => {
    domClasses(this.paletteEntry).toggle('active');
    this._active = domClasses(this.paletteEntry).has('active');

    this._eventBus.fire(TOGGLE_DATA_SIMULATION_EVENT, { active: this._active });
  });

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 4);
};

ToggleData.$inject = ['eventBus', 'tokenSimulationPalette'];