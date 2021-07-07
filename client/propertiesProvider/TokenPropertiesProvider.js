import dataProps from './parts/DataProps';

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

  constructor(propertiesPanel, translate, dataTokenSimulation) {
    this._translate = translate;
    this._dataTokenSimulation = dataTokenSimulation;

    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getTabs(element) {
    const translate = this._translate;
    const dataTokenSimulation = this._dataTokenSimulation;

    return function(entries) {
      const tokenTab = {
        id: 'token',
        label: 'Token',
        groups: createTokenTabGroup(translate, element, dataTokenSimulation)
      };
      entries.push(tokenTab);
      return entries;
    };
  };
}

TokenPropertiesProvider.$inject = ['propertiesPanel', 'translate', 'dataTokenSimulation'];