import { SCOPE_CREATE_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { findRootElementsByType } from 'bpmn-js-properties-panel/lib/Utils';

export default class Data {

  constructor(eventBus) {
    this._data = [];

    eventBus.on('import.done', () => {
      this._data = [];
    });

    eventBus.on(SCOPE_CREATE_EVENT, event => {
      const {
        scope
      } = event;

      const {
        element
      } = scope;

      let dataObject = this.getDataElements(getProcessOrParticipantElement(element));
      scope.data = undefined;
      if (dataObject.length > 0) {
        scope.data = dataObject[0];
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
      this._data.push({ element, data: map });
    }
    map.set('', {});
  }

  getDataElements(element) {
    return this._data.filter(dataObject => dataObject.element.id === element.id).map(dataObject => dataObject.data);
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