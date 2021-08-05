import { RESET_SIMULATION_EVENT, SCOPE_CREATE_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { findRootElementsByType } from 'bpmn-js-properties-panel/lib/Utils';
import { GET_RESULT_VARIABLE_TYPE_EVENT, LOW_PRIORITY, SET_RESULT_VARIABLE_TYPE_EVENT } from '../events/EventHelper';

export default class Data {

  constructor(eventBus) {
    this._data = [];

    eventBus.on('import.done', () => {
      this._data = [];
    });

    eventBus.on(RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
      this._data.forEach(dataObject => {
        dataObject.simulation = undefined;
        dataObject.colors = undefined;
      });
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
        let sDataObject = this.getDataElementSimulation(this.#getProcessOrParticipantElement(source)) || this.getDataElements(this.#getProcessOrParticipantElement(source)) || [];
        let processOrParticipantElement = this.#getProcessOrParticipantElement(target);
        let tDataObject = this.getDataElementSimulation(processOrParticipantElement) || this.getDataElements(processOrParticipantElement) || [];
        scope.data = this.#destructureMaps(new Map([...sDataObject, ...tDataObject]));

        let oldData = this._data.find(dataObject => dataObject.element.id === processOrParticipantElement.id);
        if (oldData) {

          oldData.simulation = this.#destructureMaps(scope.data);
        } else {
          this.setDataSimulationMap(processOrParticipantElement, this.#destructureMaps(scope.data));
        }
      } else {
        let processOrParticipantElement = this.#getProcessOrParticipantElement(element);
        let dataObject = this.getDataElementSimulation(processOrParticipantElement) || this.getDataElements(processOrParticipantElement) || [];
        scope.data = this.#destructureMaps(dataObject);

        let oldData = this._data.find(obj => obj.element.id === processOrParticipantElement.id);
        if (oldData) {
          oldData.simulation = this.#destructureMaps(scope.data);
          oldData.colors = scope.colors;
        } else {
          this.setDataSimulationMap(processOrParticipantElement, this.#destructureMaps(scope.data));
        }
      }

    });

    eventBus.on(GET_RESULT_VARIABLE_TYPE_EVENT, (event, ctx) => {
      return this.getResultVariableType(ctx.element, ctx.resultVariable);
    });
    eventBus.on(SET_RESULT_VARIABLE_TYPE_EVENT, (event, ctx) => {
      let elem = this.#getProcessOrParticipantElement(ctx.element);
      let dataObject = this.getDataObject(elem);
      if (!dataObject) {
        dataObject = { element: elem, data: new Map(), simulation: new Map(), resultVariables: {} };
        this._data.push(dataObject);
      }
      dataObject.resultVariables[ctx.resultVariable] = ctx.resultVariableType;
    });
  }

  getResultVariableType(element, resultVariable) {
    return this.getDataObject(this.#getProcessOrParticipantElement(element))?.resultVariables[resultVariable];
  }

  #destructureMaps(...maps) {
    let newMap = new Map();
    maps.forEach(map => {
      for (const [key, value] of map.entries()) {
        newMap.set(key, {...value});
      }
    });
    return newMap;
  }

  #getProcessOrParticipantElement(element) {
    let bo = getBusinessObject(element);

    if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
      return bo;
    }

    let rootProcess = this.#getRootProcess(bo);
    let collaboration = findRootElementsByType(bo, 'bpmn:Collaboration');

    if (collaboration.length > 0) {
      let participants = collaboration[0].participants.filter(participant => participant.processRef.id === rootProcess.id);
      return participants[0];
    } else {
      return rootProcess;
    }
  }

  #getRootProcess(businessObject) {
    let parent = businessObject;
    while (parent.$parent && !is(parent, 'bpmn:Process')) {
      parent = parent.$parent;
    }
    return parent;
  }

  getDataObject(element) {
    return this._data.find(obj => obj.element.id === element.id);
  }

  setDataSimulationMap(element, map) {
    let elem = this.#getProcessOrParticipantElement(element);
    let index = this._data.findIndex(obj => obj.element.id === elem.id);
    if (index !== -1) {
      this._data[index].simulation = map;
    } else {
      this._data.push({ element: elem, data: undefined, simulation: map, resultVariables: {} });
    }
  }

  addDataElement(element) {
    let elem = this.#getProcessOrParticipantElement(element);
    let map = this.getDataElements(elem);
    if (!map || map.length === 0) {
      map = new Map();
      this._data.push({ element: elem, data: map, simulation: undefined, resultVariables: {} });
    }
    map.set('', {});
  }

  getDataElements(element) {
    let elem = this.#getProcessOrParticipantElement(element);
    if (elem) {
      return this.getDataObject(elem)?.data;
    } else {
      return [];
    }
  }

  getDataElementSimulation(element) {
    let elem = this.#getProcessOrParticipantElement(element);
    if (elem) {
      return this.getDataObject(elem)?.simulation;
    } else {
      return [];
    }
  }

  addDataElementSimulation(element, value) {
    let elem = this.#getProcessOrParticipantElement(element);
    let dataObject = this.getDataObject(elem);
    if (!dataObject.simulation) {
      dataObject.simulation = new Map([...dataObject.data]);
    }
    dataObject.simulation.set(value['name'], { ...value });
  }

  updateDataElementSimulation(idParticipant, value) {
    let dataObject = this._data.find(obj => obj.element.id === idParticipant);
    dataObject.simulation.set(value['name'], { ...value });
  }

  updateDataElement(element, value, index) {
    let elem = this.#getProcessOrParticipantElement(element);
    let map = this.getDataElements(elem);
    if (!map || map.length === 0) {
      return;
    }
    let keyMap = Array.from(map.keys())[index];
    map.delete(keyMap);
    map.set(value['name'], { ...value });
  }

  removeDataElement(element, index) {
    let elem = this.#getProcessOrParticipantElement(element);
    let map = this.getDataElements(elem);
    if (!map || map.length === 0) {
      return;
    }
    let keyMap = Array.from(map.keys())[index];
    map.delete(keyMap);
  }

  getDataSimulation() {
    return this._data.map(data => {
      let obj = {};
      const colors = data.colors || {
        primary: '#999',
        auxiliary: '#999'
      };
      let newMap = data.simulation? new Map([...data.simulation]) : new Map();
      obj[data.element.id] = {
        colors: colors,
        simulation: newMap
      };
      return obj;
    });
  }

}

Data.$inject = ['eventBus'];