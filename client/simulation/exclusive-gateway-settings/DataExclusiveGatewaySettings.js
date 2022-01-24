import { is } from 'bpmn-js-token-simulation/lib/util/ElementHelper';
import {
  ELEMENT_CHANGED_EVENT,
  RESET_SIMULATION_EVENT,
  TOGGLE_MODE_EVENT
} from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, TOGGLE_DATA_SIMULATION_EVENT } from '../../events/EventHelper';

const DEFAULT_COLOR = '--token-simulation-grey-darken-30';

/**
 * Extends default ExclusiveGatewaySettings on Simulator. This module removes the default elementContextPads if data mode is active.
 * @param eventBus
 * @param elementRegistry
 * @param elementColors
 * @param simulationStyles
 * @param exclusiveGatewaySettings
 * @param contextPads
 * @constructor
 */
export default function DataExclusiveGatewaySettings(eventBus, elementRegistry, elementColors, simulationStyles, exclusiveGatewaySettings, contextPads) {
  this._elementRegistry = elementRegistry;
  this._elementColors = elementColors;
  this._simulationStyles = simulationStyles;
  this._exclusiveGatewaySettings = exclusiveGatewaySettings;
  this._contextPads = contextPads;

  this.dataActive = false;
  this.active = false;

  eventBus.on(CODE_EDITOR_PLUGIN_PRESENT_EVENT, LOW_PRIORITY, () => {
    this.dataActive = true;
    this.active = true;
  });

  eventBus.on(TOGGLE_MODE_EVENT, LOW_PRIORITY, context => {
    if (context.active && this.dataActive) {
      const exclusiveGateways = this._elementRegistry.filter(element => {
        return is(element, 'bpmn:ExclusiveGateway');
      });
      if (context.active && this.active) {
        this.resetSequenceFlows(exclusiveGateways);
      }
    }
  });

  eventBus.on(TOGGLE_DATA_SIMULATION_EVENT, context => {
    if (this.dataActive) {
      this.active = context.active;

      const exclusiveGateways = this._elementRegistry.filter(element => {
        return is(element, 'bpmn:ExclusiveGateway');
      });
      if (this.active) {
        this.resetSequenceFlows(exclusiveGateways);
      } else {
        this._exclusiveGatewaySettings.setSequenceFlowsDefault();
        exclusiveGateways.forEach(exclusiveGateway => {
          // Show context pad
          for (const handler of contextPads.getHandlers(exclusiveGateway)) {
            const handlerHash = `${exclusiveGateway.id}------${handler.hash}`;
            contextPads._addOverlay(exclusiveGateway, { handlerHash, html: '<div></div>' })
            contextPads.updateElementContextPads(exclusiveGateway);
          }
        });
      }
    }
  });

  eventBus.on(ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {
    const {
      element
    } = event;

    if (this.dataActive && this.active && is(element, 'bpmn:ExclusiveGateway')) {
      // Hide context pad
      closeContextPads(this._contextPads, element);
    }
  });
  eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
    if (this.dataActive && this.active) {
      const exclusiveGateways = this._elementRegistry.filter(element => {
        return is(element, 'bpmn:ExclusiveGateway');
      });
      this.resetSequenceFlows(exclusiveGateways);
    }
  });
}

DataExclusiveGatewaySettings.prototype.resetSequenceFlows = function(exclusiveGateways) {
  this._exclusiveGatewaySettings.resetSequenceFlows();

  exclusiveGateways.forEach(exclusiveGateway => {
    // Hide context pad
    closeContextPads(this._contextPads, exclusiveGateway);

    const stroke = this._simulationStyles.get(DEFAULT_COLOR);
    // set colors
    exclusiveGateway.outgoing.forEach(outgoing => {
      this._elementColors.set(outgoing, { stroke });
    });
  });
};

function closeContextPads(contextPads, exclusiveGateway) {
  for (const handler of contextPads.getHandlers(exclusiveGateway)) {
    const handlerHash = `${exclusiveGateway.id}------${handler.hash}`;
    const existingOverlays = contextPads._getOverlays(handlerHash);
    for (const existingOverlay of existingOverlays) {
      contextPads._removeOverlay(existingOverlay);
    }
  }

}

DataExclusiveGatewaySettings.$inject = ['eventBus', 'elementRegistry', 'elementColors', 'simulationStyles', 'exclusiveGatewaySettings', 'contextPads'];