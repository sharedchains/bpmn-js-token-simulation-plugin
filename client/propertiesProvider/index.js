import DataModule from '../data';
import DataBehaviorModule from '../simulation';
import TokenPropertiesProvider from './TokenPropertiesProvider';

export default {
  __depends__: [
    DataModule,
    DataBehaviorModule
  ],
  __init__: ['tokenPropertiesProvider'],
  tokenPropertiesProvider: ['type', TokenPropertiesProvider]
};