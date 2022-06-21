import dataProps from './parts/DataProps';
import { CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY } from '../events/EventHelper';

import { ListGroup } from '@bpmn-io/properties-panel';
import { is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Extend the existing properties provider with our data tab
 */
export default class TokenPropertiesProvider {
  // Register our properties provider.
  // Use a lower priority to ensure it is loaded after the basic BPMN properties.

  constructor(propertiesPanel, injector) {
    this._injector = injector;
    this._eventBus = injector.get('eventBus');
    this.active = false;

    propertiesPanel.registerProvider(LOW_PRIORITY, this);

    this._eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, (_event, ctx) => {
      this.active = true;
      this.dataTypes = ctx.dataTypes;
    });
  }

  getGroups(element) {
    const injector = this._injector;
    const dataTypes = this.dataTypes;
    const active = this.active;

    return groups => {
      // Data feature works only if our code editor is installed
      if (active) {
        const translate = injector.get('translate');

        if (is(element, 'bpmn:Process')
          || is(element, 'bpmn:Participant')
          || is(element, 'bpmn:SubProcess')) {
          groups.push({
            id: 'data-simulation-variables',
            label: translate('Data simulation'),
            component: ListGroup,
            ...dataProps({ element, injector, dataTypes })
          });
        }
      }

      return groups;
    };
  }
}

TokenPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];