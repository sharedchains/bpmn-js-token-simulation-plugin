import dataProps from './parts/DataProps';
import { CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY } from '../events/EventHelper';

// Return elements entries in the custom tab
function createTokenTabGroup(translate, element, dataTokenSimulation, dataTypes) {
  const tokenGroup = {
    id: 'token-data-group',
    label: 'Data',
    entries: []
  };

  dataProps(translate, tokenGroup, element, dataTokenSimulation, dataTypes);

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

    eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, (event, ctx) => {
      this.active = true;
      this.dataTypes = ctx.dataTypes;
    });
  }

  getTabs(element) {
    const translate = this._translate;
    const dataTokenSimulation = this._dataTokenSimulation;
    const active = this.active;
    const dataTypes = this.dataTypes;

    return function(entries) {

      // Data feature works only if our code editor is installed
      if (active) {
        const tokenTab = {
          id: 'data-token-simulation-tab',
          label: 'Data simulation',
          groups: createTokenTabGroup(translate, element, dataTokenSimulation, dataTypes)
        };
        entries.push(tokenTab);
      }
      return entries;
    };
  };
}

TokenPropertiesProvider.$inject = ['eventBus', 'propertiesPanel', 'translate', 'dataTokenSimulation'];