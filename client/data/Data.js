import { SCOPE_CREATE_EVENT, RESET_SIMULATION_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { findRootElementsByType } from 'bpmn-js-properties-panel/lib/Utils';

export default class Data {

  constructor(eventBus) {
    this._data = [];

    eventBus.on('import.done', () => {
      this._data = [];
    });

    eventBus.on(RESET_SIMULATION_EVENT, 500, () => {
      this._data.forEach(dataObject => dataObject.simulation = undefined);
    });

    eventBus.on(SCOPE_CREATE_EVENT, event => {
      const {
        scope
      } = event;

      const {
        element,
        initiator
      } = scope;

      scope.data = undefined;
      if (initiator && initiator.type === 'bpmn:MessageFlow') {
        // We need to pass the scope from the "source" process to the "target" process
        const { source, target } = element;
        let sDataObject = this.getSimulationData(source).find(Boolean) || this.getDataElements(getProcessOrParticipantElement(source)).find(Boolean) || [];
        let processOrParticipantElement = getProcessOrParticipantElement(target);
        let tDataObject = this.getSimulationData(processOrParticipantElement).find(Boolean) || this.getDataElements(processOrParticipantElement).find(Boolean) || [];
        scope.data = new Map([...sDataObject, ...tDataObject]);

        let oldData = this._data.find(dataObject => dataObject.element.id === processOrParticipantElement.id);
        if (oldData) {
          oldData.simulation = new Map([...scope.data]);
        }

      } else {
        let processOrParticipantElement = getProcessOrParticipantElement(element);
        let dataObject = this.getSimulationData(processOrParticipantElement).find(Boolean) || this.getDataElements(processOrParticipantElement).find(Boolean) || [];
        scope.data = new Map([...dataObject]);

        let oldData = this._data.find(obj => obj.element.id === processOrParticipantElement.id);
        if (oldData) {
          oldData.simulation = new Map([...scope.data]);
        }
      }

    });

    function getProcessOrParticipantElement(element) {
      let bo = getBusinessObject(element);

      if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
        return bo;
      }

      let rootProcess = getRootProcess(bo);
      let collaboration = findRootElementsByType(bo, 'bpmn:Collaboration');

      if (collaboration.length > 0) {
        let participants = collaboration[0].participants.filter(participant => participant.processRef.id === rootProcess.id);
        return participants[0];
      } else {
        return rootProcess;
      }
    }

    function getRootProcess(businessObject) {
      var parent = businessObject;
      while (parent.$parent && !is(parent, 'bpmn:Process')) {
        parent = parent.$parent;
      }
      return parent;
    }
  }

  addDataElement(element) {

    let dataObject = this.getDataElements(element);
    let map;
    if (dataObject.length > 0) {
      map = dataObject[0];
    } else {
      map = new Map();
      this._data.push({ element, data: map, simulation: undefined });
    }
    map.set('', {});
  }

  getDataElements(element) {
    return this._data.filter(dataObject => dataObject.element.id === element.id).map(dataObject => dataObject.data);
  }

  getSimulationData(element) {
    return this._data.filter(dataObject => dataObject.element.id === element.id).map(dataObject => dataObject.simulation);
  }

  updateDataElement(element, value, index) {
    let dataObject = this.getDataElements(element);
    if (dataObject.length === 0) {
      return;
    }
    let map = dataObject[0];
    let keyMap = Array.from(map.keys())[index];
    map.delete(keyMap);
    map.set(value['name'], value);
  }

  removeDataElement(element, index) {
    let dataObject = this.getDataElements(element);
    if (dataObject.length === 0) {
      return;
    }
    let map = dataObject[0];
    let keyMap = Array.from(map.keys())[index];
    map.delete(keyMap);
  }

}

Data.$inject = ['eventBus'];