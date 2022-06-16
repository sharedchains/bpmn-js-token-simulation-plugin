import DataModule from '../data';
import SimulationModule from '../simulation';
import TokenPropertiesProvider from './TokenPropertiesProvider';

export default {
  __depends__: [
    DataModule,
    SimulationModule
  ],
  __init__: ['tokenPropertiesProvider'],
  tokenPropertiesProvider: ['type', TokenPropertiesProvider]
};