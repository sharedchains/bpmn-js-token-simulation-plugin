import DataModule from './Data';
import DataPanelModule from './DataPanel';
import ToggleDataModule from './ToggleData';

import PaletteModule from 'bpmn-js-token-simulation/lib/features/palette';

export default {
  __depends__: [PaletteModule],
  __init__: [
    'dataTokenSimulation',
    'dataPanel',
    'toggleData'
  ],
  dataTokenSimulation: ['type', DataModule],
  dataPanel: ['type', DataPanelModule],
  toggleData: ['type', ToggleDataModule]
};