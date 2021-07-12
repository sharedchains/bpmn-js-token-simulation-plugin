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

    /*
     * TODO : Gateway sequenceflow order for evaluation
     *
     * If set default and more than 2 ways, with a 'cross-condition' evaluation, choose the first following flow-id order
     * i.e. flow-1 === default
     * [ flow-2, flow-3, flow-1] (like a switch-case instruction)
     *
     */

    return function(entries) {

      // TODO : Data feature works only if our code editor is installed
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