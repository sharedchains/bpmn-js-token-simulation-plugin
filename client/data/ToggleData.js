import {
  classes as domClasses,
  domify,
  event as domEvent
} from 'min-dom';

import { ChartBarIcon } from '../icons';

import { CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, TOGGLE_DATA_SIMULATION_EVENT } from '../events/EventHelper';

/**
 * Draws a button for Data Mode, integrated to the existing palette
 * @param eventBus
 * @param tokenSimulationPalette
 * @constructor
 */
export default function ToggleData(eventBus, tokenSimulationPalette) {
  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;

  this._active = false;
  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this._active = true;

    this._init();
  });
}

ToggleData.prototype._init = function() {
  this.paletteEntry = domify(`
    <div class="bts-entry active" title="Toggle data">
      ${ ChartBarIcon() }
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