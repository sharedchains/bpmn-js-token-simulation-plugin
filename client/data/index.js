import DataModule from './Data';
import DataPanelModule from './DataPanel';

export default {
  __init__: [
    'dataTokenSimulation',
    'dataPanel'
  ],
  dataTokenSimulation: ['type', DataModule],
  dataPanel: ['type', DataPanelModule]
};