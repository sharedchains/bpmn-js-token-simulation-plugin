import dataProps from './parts/DataProps';
import { CODE_EDITOR_PLUGIN_PRESENT } from '../events/EventHelper';

const LOW_PRIORITY = 500;

// Return elements entries in the custom tab
function createTokenTabGroup(translate, element, dataTokenSimulation) {
  const tokenGroup = {
    id: 'token-data-group',
    label: 'Data',
    entries: []
  };

  dataProps(translate, tokenGroup, element, dataTokenSimulation);

  return [
    tokenGroup
  ];
}

export default class TokenPropertiesProvider {
  // Register our properties provider.
  // Use a lower priority to ensure it is loaded after the basic BPMN properties.

  constructor(eventBus, propertiesPanel, translate, dataTokenSimulation) {
    this._eventBus = eventBus;
    this._translate = translate;
    this._dataTokenSimulation = dataTokenSimulation;
    this.active = false;

    propertiesPanel.registerProvider(LOW_PRIORITY, this);

    eventBus.on(CODE_EDITOR_PLUGIN_PRESENT, LOW_PRIORITY, () => {
      this.active = true;
    });
  }

  getTabs(element) {
    const translate = this._translate;
    const dataTokenSimulation = this._dataTokenSimulation;
    const active = this.active;

    return function(entries) {

      // Data feature works only if our code editor is installed
      if (active) {
        const tokenTab = {
          id: 'token',
          label: 'Token',
          groups: createTokenTabGroup(translate, element, dataTokenSimulation)
        };
        entries.push(tokenTab);
      }
      return entries;
    };
  };
}

TokenPropertiesProvider.$inject = ['eventBus', 'propertiesPanel', 'translate', 'dataTokenSimulation'];