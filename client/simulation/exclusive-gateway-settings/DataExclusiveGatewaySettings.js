import { is } from 'bpmn-js-token-simulation/lib/util/ElementHelper';
import {
  ELEMENT_CHANGED_EVENT,
  RESET_SIMULATION_EVENT,
  TOGGLE_MODE_EVENT
} from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { LOW_PRIORITY, TOGGLE_DATA_SIMULATION_EVENT } from '../../events/EventHelper';

const STYLE = getComputedStyle(document.documentElement);
const DEFAULT_COLOR = STYLE.getPropertyValue('--token-simulation-grey-darken-30');

export default function DataExclusiveGatewaySettings(eventBus, elementRegistry, exclusiveGatewaySettings, contextPads) {
  this._elementRegistry = elementRegistry;
  this._exclusiveGatewaySettings = exclusiveGatewaySettings;
  this._contextPads = contextPads;

  this.active = false;
  eventBus.on(TOGGLE_MODE_EVENT, LOW_PRIORITY, context => {
    if (context.active) {
      this.active = context.active;
      const exclusiveGateways = this._elementRegistry.filter(element => {
        return is(element, 'bpmn:ExclusiveGateway');
      });
      this.resetSequenceFlows(exclusiveGateways);
    }
  });
  eventBus.on(TOGGLE_DATA_SIMULATION_EVENT, context => {
    this.active = context.active;

    const exclusiveGateways = this._elementRegistry.filter(element => {
      return is(element, 'bpmn:ExclusiveGateway');
    });
    if (this.active) {
      this.resetSequenceFlows(exclusiveGateways);
    } else {
      this._exclusiveGatewaySettings.setSequenceFlowsDefault();
      exclusiveGateways.forEach(exclusiveGateway => {
        contextPads.openElementContextPads(exclusiveGateway);
      });
    }
  });

  eventBus.on(ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {
    const {
      element
    } = event;

    if (this.active && is(element, 'bpmn:ExclusiveGateway')) {
      contextPads.closeElementContextPads(element);
    }
  });
  eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
    if (this.active) {
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
    this._contextPads.closeElementContextPads(exclusiveGateway);
    // set colors
    exclusiveGateway.outgoing.forEach(outgoing => {
      this._exclusiveGatewaySettings.setColor(outgoing, DEFAULT_COLOR);
    });
  });
};

DataExclusiveGatewaySettings.$inject = ['eventBus', 'elementRegistry', 'exclusiveGatewaySettings', 'contextPads'];