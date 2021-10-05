import { RESET_SIMULATION_EVENT, SCOPE_CREATE_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { findRootElementsByType } from 'bpmn-js-properties-panel/lib/Utils';
import { LOW_PRIORITY } from '../events/EventHelper';

export default class Data {

  /**
   * Data class, keeps scope data for simulation
   *
   * @param eventBus
   */
  constructor(eventBus) {

    /**
     * @typedef DataObject
     * @type {Object}
     * @property {ModdleElement} element bpmn-js Moddle Element
     * @property {DataMap} data Variable Map Object
     * @property {SimulationMap|undefined} simulation Variable Map Object
     * @property {Colors} [colors]
     */

    /**
     * @typedef Colors
     * @type {Object}
     *
     * @property {String} primary
     * @property {String} auxiliary
     *
     */

    /**
     * @typedef DataMap
     * @typedef SimulationMap
     *
     * Keeps a map for the detected variables of the simulation.
     * Key is the variable name
     * @type {Map<String, CamundaVariable>}
     *
     */

    /**
     * @typedef CamundaVariable
     * @type {Object}
     *
     * @property {String} name
     * @property {*} value
     * @property {String} type
     */

    /**
     * @typedef SimulationObject
     * @type {Object}
     *
     * @property {SimulationMap} simulation
     * @property {Colors} colors map
     */

    /**
     * We will keep an array of objects for each participant/process of the model.
     * @type {Array.<DataObject>}
     * @private
     */
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

    /*
    * Every time the simulation token enters into an object, a SCOPE_CREATE_EVENT event is fired.
    * We decorate the scope of the element with the data accumulated:
    *  + from simulation, if present
    *  + from its participant/process (which is the owner of every data object)
    *
    * */
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
        /*
        * The token is moving from a participant to another,
        * we need to pass the scope from the "source" process to the "target" process
        * */
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

  }

  /**
   *  Returns a new instance of map, to avoid references from the old structures that could 'false data'
   *
   * @param maps
   * @returns {Map<any, any>}
   */
  #destructureMaps(...maps) {
    let newMap = new Map();
    maps.forEach(map => {
      for (const [key, value] of map.entries()) {
        newMap.set(key, { ...value });
      }
    });
    return newMap;
  }

  /**
   * Returns the business object of the Process element, or Participant if model is a Collaboration
   * @param element the starting ModdleElement
   * @returns {{$parent}|*|ModdleElement}
   */
  #getProcessOrParticipantElement(element) {
    let bo = getBusinessObject(element);
    if (!bo) {
      return;
    }

    if (is(element, 'bpmn:Process')
      || is(element, 'bpmn:Participant')) {
      return bo;
    }

    let rootProcess = Data.#getRootProcess(bo);
    let collaboration = findRootElementsByType(bo, 'bpmn:Collaboration');

    if (collaboration.length > 0) {
      let participants = collaboration[0].participants.filter(participant => participant.processRef?.id === rootProcess.id);
      return participants[0];
    } else {
      return rootProcess;
    }
  }

  /**
   * Cycles bpmn model until it finds the parent Process element
   * @param businessObject
   * @returns {{$parent}|*}
   */
  static #getRootProcess(businessObject) {
    let parent = businessObject;
    if (!businessObject) {
      return;
    }
    while (parent.$parent && !is(parent, 'bpmn:Process')) {
      parent = parent.$parent;
    }
    return parent;
  }

  /**
   * Returns the DataObject relative to the rootElementParam
   * @param rootElement Process or Participant
   * @returns {DataObject|undefined}
   */
  getDataObject(rootElement) {
    return this._data.find(obj => obj.element.id === rootElement.id);
  }

  /**
   * Replaces the simulation variables map for the provided element
   *
   * @param {ModdleElement} element
   * @param {SimulationMap} map
   */
  setDataSimulationMap(element, map) {
    let elem = this.#getProcessOrParticipantElement(element);
    let index = this._data.findIndex(obj => obj.element.id === elem.id);
    if (index !== -1) {
      this._data[index].simulation = map;
    } else {
      this._data.push({ element: elem, data: new Map(), simulation: map });
    }
  }

  /**
   * Creates a new {@link DataObject} for the provided element, pushing it to the private array
   * @param {ModdleElement} element
   */
  addDataElement(element) {
    let elem = this.#getProcessOrParticipantElement(element);
    let map = this.getDataElements(elem);
    if (!map || map.length === 0) {
      map = new Map();
      this._data.push({ element: elem, data: map, simulation: undefined });
    }
    map.set('', {});
  }

  /**
   * Returns the variable data map for the provided element
   * @param element
   * @returns {DataMap|*[]}
   */
  getDataElements(element) {
    let elem = this.#getProcessOrParticipantElement(element);
    if (elem) {
      return this.getDataObject(elem)?.data;
    } else {
      return [];
    }
  }

  /**
   * Returns the variable simulation map for the provided element
   * @param element
   * @returns {*[]|SimulationMap|undefined}
   */
  getDataElementSimulation(element) {
    let elem = this.#getProcessOrParticipantElement(element);
    if (elem) {
      return this.getDataObject(elem)?.simulation;
    } else {
      return [];
    }
  }

  /**
   * Add a new variable to the {@link SimulationMap} for the provided element
   * @param {ModdleElement} element
   * @param {CamundaVariable} value
   */
  addDataElementSimulation(element, value) {
    let elem = this.#getProcessOrParticipantElement(element);
    let dataObject = this.getDataObject(elem);
    if (!dataObject.simulation) {
      dataObject.simulation = new Map([...dataObject.data]);
    }
    dataObject.simulation.set(value['name'], { ...value });
  }

  /**
   * Updates an existing variable in the {@link SimulationMap} for the provided participant
   * @param {String} idParticipant
   * @param {CamundaVariable} value
   */
  updateDataElementSimulation(idParticipant, value) {
    let dataObject = this._data.find(obj => obj.element.id === idParticipant);
    dataObject.simulation.set(value['name'], { ...value });
  }

  /**
   * Updates an existing variable value in the {@link DataMap} for the provided element
   * @param {ModdleElement} element
   * @param {CamundaVariable} value
   * @param {number} index
   */
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

  /**
   * Removes an existing variable at the provided index
   * @param {ModdleElement} element
   * @param {number} index
   */
  removeDataElement(element, index) {
    let elem = this.#getProcessOrParticipantElement(element);
    let map = this.getDataElements(elem);
    if (!map || map.length === 0) {
      return;
    }
    let keyMap = Array.from(map.keys())[index];
    map.delete(keyMap);
  }

  /**
   * Returns an array of objects for each process/participant of the model, containing a {@link SimulationObject}
   * @returns { Array.<SimulationObject>}
   */
  getDataSimulation() {
    return this._data.map(data => {
      let obj = {};
      const colors = data.colors || {
        primary: '#999',
        auxiliary: '#999'
      };
      let newMap = data.simulation ? new Map([...data.simulation]) : new Map();
      obj[data.element.id] = {
        colors: colors,
        simulation: newMap
      };
      return obj;
    });
  }

}

Data.$inject = ['eventBus'];