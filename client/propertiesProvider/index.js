import DataModule from '../data';
import TokenPropertiesProvider from './TokenPropertiesProvider';

export default {
  __depends__: [
    DataModule
  ],
  __init__: ['tokenPropertiesProvider'],
  tokenPropertiesProvider: ['type', TokenPropertiesProvider]
};