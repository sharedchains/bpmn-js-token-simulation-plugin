/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./client/HideModelerElements.js":
/*!***************************************!*\
  !*** ./client/HideModelerElements.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ HideModelerElements)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bpmn-js-token-simulation/lib/util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");





function HideModelerElements(eventBus, toggleMode) {
  var css = '.properties.hidden { display: none; } .tabs .tab.hidden { display: none; }',
      head = document.head,
      style = document.createElement('style');

  style.type = 'text/css';

  style.appendChild(document.createTextNode(css));

  head.appendChild(style);

  eventBus.on('saveXML.start', 5000, function() {
    // disable simulation before saving
    if (toggleMode.active) {
      toggleMode.toggleMode();
    }
  });

  eventBus.on(bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, function(context) {
    var active = context.active;

    var propertiesPanel = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.query)('.properties');

    if (active) {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(propertiesPanel).add('hidden');
    } else {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(propertiesPanel).remove('hidden');
    }
  });
}

HideModelerElements.$inject = [
  'eventBus',
  'toggleMode'
];

/***/ }),

/***/ "./client/data/Data.js":
/*!*****************************!*\
  !*** ./client/data/Data.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Data)
/* harmony export */ });
/* harmony import */ var bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bpmn-js-token-simulation/lib/util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js");
/* harmony import */ var bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bpmn-js-properties-panel/lib/Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js");
/* harmony import */ var _events_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../events/EventHelper */ "./client/events/EventHelper.js");





class Data {

  constructor(eventBus) {
    this._data = [];

    eventBus.on('import.done', () => {
      this._data = [];
    });

    eventBus.on(bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.RESET_SIMULATION_EVENT, _events_EventHelper__WEBPACK_IMPORTED_MODULE_1__.LOW_PRIORITY, () => {
      this._data.forEach(dataObject => {
        dataObject.simulation = undefined;
        dataObject.colors = undefined;
      });
    });

    eventBus.on(bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.SCOPE_CREATE_EVENT, event => {
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

    eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_1__.GET_RESULT_VARIABLE_TYPE_EVENT, (event, ctx) => {
      return this.getResultVariableType(ctx.element, ctx.resultVariable);
    });
    eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_1__.SET_RESULT_VARIABLE_TYPE_EVENT, (event, ctx) => {
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
    let bo = (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.getBusinessObject)(element);

    if ((0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:Process') || (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:Participant')) {
      return bo;
    }

    let rootProcess = this.#getRootProcess(bo);
    let collaboration = (0,bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_0__.findRootElementsByType)(bo, 'bpmn:Collaboration');

    if (collaboration.length > 0) {
      let participants = collaboration[0].participants.filter(participant => participant.processRef.id === rootProcess.id);
      return participants[0];
    } else {
      return rootProcess;
    }
  }

  #getRootProcess(businessObject) {
    let parent = businessObject;
    while (parent.$parent && !(0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.is)(parent, 'bpmn:Process')) {
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

/***/ }),

/***/ "./client/data/DataPanel.js":
/*!**********************************!*\
  !*** ./client/data/DataPanel.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DataPanel)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bpmn-js-token-simulation/lib/util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");
/* harmony import */ var _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../events/EventHelper */ "./client/events/EventHelper.js");






function DataPanel(simulator, eventBus, canvas, dataTokenSimulation) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._dataTokenSimulation = dataTokenSimulation;

  this.editing = false;
  this.waitingElements = [];

  this._eventBus.on(bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_MODE_EVENT, context => {
    let active = context.active;

    let dataPanel = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('.data-panel');
    if (active) {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(dataPanel).remove('hidden');
    } else {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(dataPanel).add('hidden');
    }
  });

  this._eventBus.on('import.done', () => this._init());

  this._eventBus.on([_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SET_DATA_NOT_EDITABLE_EVENT, bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.RESET_SIMULATION_EVENT], (context) => {
    this.editing = false;
    this.waitingElements = context && context.element ? this.waitingElements.filter((element) => element.id !== context.element.id) : [];
  });

  this._eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SET_DATA_EDITABLE_EVENT, (context) => {
    this.waitingElements.push(context.element);

    let dataVariables = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.queryAll)('.variable-value');
    let dataVariableInputs = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.queryAll)('.variable-value-input');

    if (dataVariables.length > 0 && dataVariableInputs.length > 0) {
      this.editing = true;

      for (const variable of dataVariables.values()) {
        if (!(0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(variable).has('hidden')) {
          (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(variable).add('hidden');
        }
      }
      for (const variable of dataVariableInputs.values()) {
        (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(variable).remove('hidden');
      }
    }
  });

  this._eventBus.on(bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.RESET_SIMULATION_EVENT, _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.LOW_PRIORITY, () => {
    let dataProperties = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('.data-properties');
    dataProperties.textContent = '';
  });

  this._eventBus.on(bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.SCOPE_DESTROYED_EVENT, _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.LOW_PRIORITY, () => {
    let data = this._dataTokenSimulation.getDataSimulation();
    this.container.textContent = '';

    data.forEach((simObject) => {
      let section = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(`<div class="section"></div>`);
      for (const [id, simulationData] of Object.entries(simObject)) {
        let title = `<div class="sectionTitle">
            <div class="token" style="background-color: ${simulationData.simulation && simulationData.simulation.size ? simulationData.colors.primary : '#999'}"></div>
            <h4 class="participant">${id}</h4>
        </div>`;
        if (simulationData.simulation && simulationData.simulation.size) {
          section.style.borderColor = String(simulationData.colors.primary);
        }
        let domTitle = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(title);
        section.appendChild(domTitle);
        if (simulationData.simulation) {
          for (const [key, variable] of simulationData.simulation.entries()) {
            let row = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(`<p class="variable">
                                        <strong>${key}</strong>
                                        &nbsp;&nbsp;:&nbsp;&nbsp;
                                        <span class="variable-value ${this.editing ? 'hidden' : ''}">${variable.value}</span>
                                        <input type="text" class="variable-value-input ${this.editing ? '' : 'hidden'}" value="${variable.value}" />
                                        </p>`);
            min_dom__WEBPACK_IMPORTED_MODULE_2__.delegate.bind(row, '.variable-value-input', 'change', event => {
              let newVariable = Object.assign({}, variable, { value: event.target.value });
              this._dataTokenSimulation.updateDataElementSimulation(id, newVariable);

              let scopes = simulator.findScopes((scope) => {
                return scope.parent?.element.id === id &&
                  this.waitingElements.some(element => element.id === scope.element.id)
              });

              scopes.forEach(scope => {
                this._eventBus.fire(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.UPDATED_DATA_EVENT, {
                  participantId: id,
                  variable: newVariable,
                  element: scope.element
                });
              });
            });
            section.append(row);
          }
        }
      }
      this.container.appendChild(section);
    });
  });
}

DataPanel.prototype._init = function() {
  this.panel = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)('<div class="data-panel hidden"><h5>Data Simulation</h5></div>');
  this.container = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)('<div class="data-properties"></div>');

  this.panel.appendChild(this.container);
  this._canvas.getContainer().appendChild(this.panel);

  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this.panel, 'wheel', event => {
    event.stopPropagation();
  });
  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this.panel, 'mousedown', event => {
    event.stopPropagation();
  });
};

DataPanel.$inject = ['simulator', 'eventBus', 'canvas', 'dataTokenSimulation'];

/***/ }),

/***/ "./client/data/index.js":
/*!******************************!*\
  !*** ./client/data/index.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Data */ "./client/data/Data.js");
/* harmony import */ var _DataPanel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DataPanel */ "./client/data/DataPanel.js");



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'dataTokenSimulation',
    'dataPanel'
  ],
  dataTokenSimulation: ['type', _Data__WEBPACK_IMPORTED_MODULE_0__.default],
  dataPanel: ['type', _DataPanel__WEBPACK_IMPORTED_MODULE_1__.default]
});

/***/ }),

/***/ "./client/events/EventHelper.js":
/*!**************************************!*\
  !*** ./client/events/EventHelper.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SET_RESULT_VARIABLE_TYPE_EVENT": () => (/* binding */ SET_RESULT_VARIABLE_TYPE_EVENT),
/* harmony export */   "GET_RESULT_VARIABLE_TYPE_EVENT": () => (/* binding */ GET_RESULT_VARIABLE_TYPE_EVENT),
/* harmony export */   "SET_DATA_EDITABLE_EVENT": () => (/* binding */ SET_DATA_EDITABLE_EVENT),
/* harmony export */   "SET_DATA_NOT_EDITABLE_EVENT": () => (/* binding */ SET_DATA_NOT_EDITABLE_EVENT),
/* harmony export */   "UPDATED_DATA_EVENT": () => (/* binding */ UPDATED_DATA_EVENT),
/* harmony export */   "CODE_EDITOR_PLUGIN_PRESENT_EVENT": () => (/* binding */ CODE_EDITOR_PLUGIN_PRESENT_EVENT),
/* harmony export */   "RUN_CODE_EVALUATION_EVENT": () => (/* binding */ RUN_CODE_EVALUATION_EVENT),
/* harmony export */   "GET_DATA_TYPES_EVENT": () => (/* binding */ GET_DATA_TYPES_EVENT),
/* harmony export */   "LOW_PRIORITY": () => (/* binding */ LOW_PRIORITY),
/* harmony export */   "DEFAULT_PRIORITY": () => (/* binding */ DEFAULT_PRIORITY),
/* harmony export */   "MID_HIGH_PRIORITY": () => (/* binding */ MID_HIGH_PRIORITY),
/* harmony export */   "HIGH_PRIORITY": () => (/* binding */ HIGH_PRIORITY)
/* harmony export */ });
const SET_RESULT_VARIABLE_TYPE_EVENT = 'tokenSimulation.resultVariableType.set';
const GET_RESULT_VARIABLE_TYPE_EVENT = 'tokenSimulation.resultVariableType.get';
const SET_DATA_EDITABLE_EVENT = 'tokenSimulation.data.setEditable';
const SET_DATA_NOT_EDITABLE_EVENT = 'tokenSimulation.data.unsetEditable';
const UPDATED_DATA_EVENT = 'tokenSimulation.data.update';

const CODE_EDITOR_PLUGIN_PRESENT_EVENT = 'codeEditor.init';
const RUN_CODE_EVALUATION_EVENT = 'codeEditor.run';
const GET_DATA_TYPES_EVENT = 'codeEditor.getTypes';

const LOW_PRIORITY = 500;
const DEFAULT_PRIORITY = 1000;
const MID_HIGH_PRIORITY = 6000;
const HIGH_PRIORITY = 10000;



/***/ }),

/***/ "./client/propertiesProvider/TokenPropertiesProvider.js":
/*!**************************************************************!*\
  !*** ./client/propertiesProvider/TokenPropertiesProvider.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TokenPropertiesProvider)
/* harmony export */ });
/* harmony import */ var _parts_DataProps__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parts/DataProps */ "./client/propertiesProvider/parts/DataProps.js");
/* harmony import */ var _events_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../events/EventHelper */ "./client/events/EventHelper.js");



// Return elements entries in the custom tab
function createTokenTabGroup(translate, element, dataTokenSimulation, dataTypes) {
  const tokenGroup = {
    id: 'token-data-group',
    label: 'Data',
    entries: []
  };

  (0,_parts_DataProps__WEBPACK_IMPORTED_MODULE_0__.default)(translate, tokenGroup, element, dataTokenSimulation, dataTypes);

  return [
    tokenGroup
  ];
}

class TokenPropertiesProvider {
  // Register our properties provider.
  // Use a lower priority to ensure it is loaded after the basic BPMN properties.

  constructor(eventBus, propertiesPanel, translate, dataTokenSimulation) {
    this._eventBus = eventBus;
    this._translate = translate;
    this._dataTokenSimulation = dataTokenSimulation;
    this.active = false;

    propertiesPanel.registerProvider(_events_EventHelper__WEBPACK_IMPORTED_MODULE_1__.LOW_PRIORITY, this);

    eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_1__.CODE_EDITOR_PLUGIN_PRESENT_EVENT, _events_EventHelper__WEBPACK_IMPORTED_MODULE_1__.LOW_PRIORITY, (event, ctx) => {
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

/***/ }),

/***/ "./client/propertiesProvider/index.js":
/*!********************************************!*\
  !*** ./client/propertiesProvider/index.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../data */ "./client/data/index.js");
/* harmony import */ var _simulation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../simulation */ "./client/simulation/index.js");
/* harmony import */ var _TokenPropertiesProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TokenPropertiesProvider */ "./client/propertiesProvider/TokenPropertiesProvider.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _data__WEBPACK_IMPORTED_MODULE_0__.default,
    _simulation__WEBPACK_IMPORTED_MODULE_1__.default
  ],
  __init__: ['tokenPropertiesProvider'],
  tokenPropertiesProvider: ['type', _TokenPropertiesProvider__WEBPACK_IMPORTED_MODULE_2__.default]
});

/***/ }),

/***/ "./client/propertiesProvider/parts/DataProps.js":
/*!******************************************************!*\
  !*** ./client/propertiesProvider/parts/DataProps.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var bpmn_js_properties_panel_lib_factory_EntryFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bpmn-js-properties-panel/lib/factory/EntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFactory.js");
/* harmony import */ var bpmn_js_properties_panel_lib_factory_EntryFactory__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(bpmn_js_properties_panel_lib_factory_EntryFactory__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bpmn-js-properties-panel/lib/Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js");
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js");







/**
 * @license
 * Copyright 2017 bpmn.io
 * SPDX-License-Identifier: MIT
 */
// Rewriting row layout got by TableEntryFactory.js
const TABLE_ROW_DIV_SNIPPET = '<div class="bpp-field-wrapper bpp-table-row bpp-table-row-select">';
const DELETE_ROW_BUTTON_SNIPPET = '<button class="action-button clear" data-action="deleteElement">' +
  '<span>X</span>' +
  '</button>';

function getContainer(node) {
  return (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('div[data-list-entry-container]', node);
}

function createInputRowTemplate(dataTypes, properties, canRemove) {
  let template = TABLE_ROW_DIV_SNIPPET;
  template += createInputTemplate(dataTypes, properties, canRemove);
  template += canRemove ? DELETE_ROW_BUTTON_SNIPPET : '';
  template += '</div>';

  return template;
}

function createInputTemplate(dataTypes, properties, canRemove) {
  let columns = properties.length;
  let template = '';
  properties.forEach(function(prop, idx) {

    if (prop === 'type') {
      template += '<select class="bpp-table-row-columns-' + columns + ' ' +
        (canRemove ? 'bpp-table-row-removable' : '') + '" ' +
        'id="camunda-table-row-cell-input-value-' + idx + '" ' +
        'name="' + (0,bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)(prop) + '"' +
        ' data-value>';
      dataTypes.map(option => {
        template +=
          '<option value="' + (0,bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)(option.value) + '">' +
            (0,bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)(option.name) +
          '</option>';
      });
      template += '</select>';
    } else {
      template += '<input class="bpp-table-row-columns-' + columns + ' ' +
        (canRemove ? 'bpp-table-row-removable' : '') + '" ' +
        'id="camunda-table-row-cell-input-value-' + idx + '" ' +
        'type="text" ' +
        'name="' + (0,bpmn_js_properties_panel_lib_Utils__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)(prop) + '" />';
    }
  });
  return template;
}

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(translate, group, element, data, dataTypes) {

  // Table
  let modelProperties = ['name', 'value', 'type'];
  let canRemove = true;

  if ((0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:Process')
    || (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:Participant')
    || (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:SubProcess')) { // Is this needed?
    let tableEntry = bpmn_js_properties_panel_lib_factory_EntryFactory__WEBPACK_IMPORTED_MODULE_0___default().table(translate, {
      id: 'data',
      labels: ['Name', 'Value', 'Type'],
      modelProperties,
      addElement: function(el, _node) {
        data.addDataElement(el);
        return [];
      },
      getElements: function(el, _node) {
        let dataMap = data.getDataElements(el);
        if (!dataMap || dataMap.length === 0) {
          return [];
        }
        let result = [];
        for (let value of dataMap.values()) {
          result.push(value);
        }
        return result;
      },
      updateElement: function(el, value, node, idx) {
        data.updateDataElement(el, value, idx);
        return [];
      },
      removeElement: function(el, node, idx) {
        data.removeDataElement(el, idx);
        return [];
      }

      // TODO: Validation
    });

    // Need to rewrite addElement and createListEntryTemplate (and, of course createInputRowTemplate, to create data type select)
    tableEntry.addElement = function(el, node, _event, _scopeNode) {
      let template = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(createInputRowTemplate(dataTypes, modelProperties, canRemove));

      let container = getContainer(node);
      container.appendChild(template);

      this.__action = {
        id: 'add-element'
      };

      return true;
    };
    tableEntry.createListEntryTemplate = function() {
      return createInputRowTemplate(dataTypes, modelProperties, canRemove);
    };

    group.entries.push(tableEntry);
  }
}


/***/ }),

/***/ "./client/simulation/behaviors/ActivityBehavior.js":
/*!*********************************************************!*\
  !*** ./client/simulation/behaviors/ActivityBehavior.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ActivityBehavior)
/* harmony export */ });
/* harmony import */ var _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../events/EventHelper */ "./client/events/EventHelper.js");


function ActivityBehavior(simulator, eventBus, activityBehavior) {
  this._simulator = simulator;
  this._eventBus = eventBus;
  this._activityBehavior = activityBehavior;

  this.active = false;

  eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.CODE_EDITOR_PLUGIN_PRESENT_EVENT, _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.LOW_PRIORITY, () => {
    this.active = true;
  });

  const elements = [
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ];

  for (const element of elements) {
    simulator.registerBehavior(element, this);
  }
}

ActivityBehavior.prototype.signal = function(context) {
  if (this.active) {
    const { element } = context;
    this._eventBus.fire(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SET_DATA_NOT_EDITABLE_EVENT, { element });
  }
  this._activityBehavior.signal(context);
};

ActivityBehavior.prototype.enter = function(context) {
  const { element } = context;
  const { wait } = this._simulator.getConfig(element);

  if (wait && this.active) {
    this._eventBus.fire(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SET_DATA_EDITABLE_EVENT, { element });
  }
  this._activityBehavior.enter(context);
};

ActivityBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ActivityBehavior.$inject = ['simulator', 'eventBus', 'activityBehavior'];

/***/ }),

/***/ "./client/simulation/behaviors/ExclusiveGatewayBehavior.js":
/*!*****************************************************************!*\
  !*** ./client/simulation/behaviors/ExclusiveGatewayBehavior.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExclusiveGatewayBehavior)
/* harmony export */ });
/* harmony import */ var bpmn_js_token_simulation_lib_simulator_behaviors_ModelUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js");
/* harmony import */ var _script_runner_ScriptRunner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../script-runner/ScriptRunner */ "./client/simulation/script-runner/ScriptRunner.js");




function ExclusiveGatewayBehavior(simulator, scriptRunner, exclusiveGatewayBehavior, dataNotifications) {
  this._simulator = simulator;
  this._scriptRunner = scriptRunner;
  this._exclusiveGatewayBehavior = exclusiveGatewayBehavior;
  this._dataNotifications = dataNotifications;

  simulator.registerBehavior('bpmn:ExclusiveGateway', this);
}

ExclusiveGatewayBehavior.prototype.sortSequenceFlows = function(element, defaultFlow) {
  /*
   * Gateway sequence flow order for evaluation
   *
   * If set default and more than 2 ways, with a 'cross-condition' evaluation, choose the first following flow-id order
   * i.e. flow-1 === default
   * [ flow-2, flow-3, flow-1] (like a switch-case instruction)
   *
   */
  return (0,bpmn_js_token_simulation_lib_simulator_behaviors_ModelUtil__WEBPACK_IMPORTED_MODULE_1__.filterSequenceFlows)(element.outgoing).sort((first, second) => {
    let firstId = first.id.toUpperCase();
    let secondId = second.id.toUpperCase();

    if (first.id === defaultFlow) {
      return 1;
    } else if (second.id === defaultFlow) {
      return -1;
    }
    if (firstId < secondId) {
      return -1;
    }
    if (firstId > secondId) {
      return 1;
    }

    // ids must be equal
    return 0;
  });
};

ExclusiveGatewayBehavior.prototype.enter = function(context) {
  const { element, scope } = context;

  // TODO: base logic to "toggle data handling"
  if (scope.data?.size) {

    let bo = (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_2__.getBusinessObject)(element);
    const defaultFlow = bo.default?.id;

    const outgoings = this.sortSequenceFlows(element, defaultFlow);

    const promises = [];

    outgoings.every(async outgoing => {
      let outgoingBo = (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_2__.getBusinessObject)(outgoing);
      const conditionExpression = outgoingBo.conditionExpression;
      if (conditionExpression) {
        const expression = conditionExpression.body;
        let code;

        if (conditionExpression?.language === 'groovy') {
          code = expression;
        } else if (_script_runner_ScriptRunner__WEBPACK_IMPORTED_MODULE_0__.isExpressionPattern.test(expression)) {

          // Expression
          const expressionMatch = expression.match(_script_runner_ScriptRunner__WEBPACK_IMPORTED_MODULE_0__.expressionPattern);
          code = expressionMatch[1];
        } else {
          this._dataNotifications.addElementNotification(outgoing, {
            type: 'error',
            icon: 'fa-exclamation-triangle',
            text: 'Script language is not groovy or is not a valid expression'
          });
          return false;
        }

        // Script
        promises.push(this._scriptRunner.runScript(code, scope.data, { outgoing, context }));
      } else if (outgoing.id === defaultFlow) {
        promises.push(Promise.resolve({ output: 'true', outgoing, context }));
      } else {
        this._dataNotifications.addElementNotification(outgoing, {
          type: 'error',
          icon: 'fa-exclamation-triangle',
          text: 'Missing condition'
        });
        return false;
      }
      return true;
    });

    this.evaluatePromises(promises);

  } else {
    this._exclusiveGatewayBehavior.enter(context);
  }
};

ExclusiveGatewayBehavior.prototype.evaluatePromises = function(promises) {
  Promise.all(promises).then(executions => {
    executions.every(execution => {
      if (execution.output &&
        execution.output === 'true') {
        this._simulator.setConfig(execution.context.element, { activeOutgoing: execution.outgoing });
        this._exclusiveGatewayBehavior.enter(execution.context);
        return false;
      }
      return true;
    });
  }).catch(error => {
    this._dataNotifications.addElementNotification(context.element, {
      type: 'error',
      icon: 'fa-exclamation-triangle',
      text: error.error
    });
  });
};

ExclusiveGatewayBehavior.prototype.exit = function(context) {
  return this._exclusiveGatewayBehavior.exit(context);
};

ExclusiveGatewayBehavior.$inject = ['simulator', 'scriptRunner', 'exclusiveGatewayBehavior', 'dataNotifications'];

/***/ }),

/***/ "./client/simulation/behaviors/ScriptTaskBehavior.js":
/*!***********************************************************!*\
  !*** ./client/simulation/behaviors/ScriptTaskBehavior.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ScriptTaskBehavior)
/* harmony export */ });
/* harmony import */ var _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../events/EventHelper */ "./client/events/EventHelper.js");
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js");



function ScriptTaskBehavior(simulator, eventBus, activityBehavior, scriptRunner, dataTokenSimulation, dataNotifications) {
  this._simulator = simulator;
  this._eventBus = eventBus;
  this._activityBehavior = activityBehavior;
  this._scriptRunner = scriptRunner;
  this._dataTokenSimulation = dataTokenSimulation;
  this._dataNotifications = dataNotifications;

  this.active = false;
  this.dataScopeUpdated = [];

  simulator.registerBehavior('bpmn:ScriptTask', this);

  eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.CODE_EDITOR_PLUGIN_PRESENT_EVENT, _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.LOW_PRIORITY, () => {
    this.active = true;
  });

  eventBus.on(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.UPDATED_DATA_EVENT, (context) => {
    const { element, participantId, variable } = context;

    if ((0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_1__.is)(element, 'bpmn:ScriptTask')) {
      this.dataScopeUpdated.push({ element, participantId, variable });
    }
  });
}

ScriptTaskBehavior.prototype.signal = function(context) {
  const { element, scope } = context;
  if (this.active) {
    let dataScope = this.dataScopeUpdated.find(dScope => dScope.element.id === element.id);
    // if data simulation has changed (by user), I need to re-run the script
    if (dataScope) {
      scope.data.set(dataScope.variable.name, dataScope.variable);
      this.enter(context);

      this.dataScopeUpdated = this.dataScopeUpdated.filter(dScope => dScope.element.id !== element.id);
    }
    this._eventBus.fire(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SET_DATA_NOT_EDITABLE_EVENT, { element });
  }
  this._activityBehavior.signal(context);
};

ScriptTaskBehavior.prototype.enter = function(context) {
  const { element, scope } = context;
  const { wait } = this._simulator.getConfig(element);

  if (wait && this.active && !this.dataScopeUpdated.some(dScope => dScope.element.id === element.id)) {
    this._eventBus.fire(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SET_DATA_EDITABLE_EVENT, { element });
  }
  if (this.active) {
    let bo = (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_1__.getBusinessObject)(element);

    if (bo.scriptFormat !== 'groovy') {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Script format is not groovy'
      });
      return;
    }

    if (!bo.resultVariable) {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Missing result variable for data simulation'
      });
      return;
    }

    let resultVariableType = this._dataTokenSimulation.getResultVariableType(element, bo.resultVariable);
    if (!resultVariableType) {
      this._dataNotifications.addElementNotification(element, {
        type: 'error',
        icon: 'fa-exclamation-triangle',
        text: 'Missing result variable type for data simulation'
      });
      return;
    }

    this._scriptRunner.runScript(bo.script, scope.data)
      .then(results => {
        this._dataTokenSimulation.addDataElementSimulation(element, {
          name: bo.resultVariable,
          value: results.output,
          type: resultVariableType
        });
        this._activityBehavior.enter(context);
      })
      .catch(error => {
        const truncate = (input) => input.length > 200 ? `${input.substring(0, 200)}...` : input;
        this._dataNotifications.addElementNotification(context.element, {
          type: 'error',
          icon: 'fa-exclamation-triangle',
          text: truncate(error.error)
        });
      });
  } else {
    this._activityBehavior.enter(context);
  }
};

ScriptTaskBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ScriptTaskBehavior.$inject = ['simulator', 'eventBus', 'activityBehavior', 'scriptRunner', 'dataTokenSimulation', 'dataNotifications'];

/***/ }),

/***/ "./client/simulation/behaviors/index.js":
/*!**********************************************!*\
  !*** ./client/simulation/behaviors/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ActivityBehavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActivityBehavior */ "./client/simulation/behaviors/ActivityBehavior.js");
/* harmony import */ var _ScriptTaskBehavior__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ScriptTaskBehavior */ "./client/simulation/behaviors/ScriptTaskBehavior.js");
/* harmony import */ var _ExclusiveGatewayBehavior__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ExclusiveGatewayBehavior */ "./client/simulation/behaviors/ExclusiveGatewayBehavior.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: ['dataActivityBehavior', 'dataScriptTaskBehavior', 'dataExclusiveGatewayBehavior'],
  dataActivityBehavior: ['type', _ActivityBehavior__WEBPACK_IMPORTED_MODULE_0__.default],
  dataScriptTaskBehavior: ['type', _ScriptTaskBehavior__WEBPACK_IMPORTED_MODULE_1__.default],
  dataExclusiveGatewayBehavior: ['type', _ExclusiveGatewayBehavior__WEBPACK_IMPORTED_MODULE_2__.default]
});

/***/ }),

/***/ "./client/simulation/data-notifications/DataNotifications.js":
/*!*******************************************************************!*\
  !*** ./client/simulation/data-notifications/DataNotifications.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DataNotifications)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bpmn-js-token-simulation/lib/util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");
/**
 * @license ElementNotifications.js
 * Copyright 2017 bpmn.io
 * SPDX-License-Identifier: MIT
 */





const OFFSET_TOP = -15;
const OFFSET_LEFT = 15;

function DataNotifications(overlays, eventBus) {
  this._overlays = overlays;

  eventBus.on([
    bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT,
    bpmn_js_token_simulation_lib_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT
  ], () => {
    this.clear();
  });
}

DataNotifications.prototype.addElementNotification = function(element, options) {
  const position = {
    top: OFFSET_TOP,
    left: OFFSET_LEFT
  };

  const {
    type,
    icon,
    text,
  } = options;

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(`
    <div class="data-notification ${ type || '' }">
      ${ icon ? `<i class="fa ${ icon }"></i>` : '' }
      <span class="text">${ text }</span>
    </div>
  `);

  this._overlays.add(element, 'data-notification', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

DataNotifications.prototype.clear = function() {
  this._overlays.remove({ type: 'data-notification' });
};

DataNotifications.prototype.removeElementNotification = function(element) {
  this._overlays.remove({ element: element });
};

DataNotifications.$inject = [ 'overlays', 'eventBus' ];

/***/ }),

/***/ "./client/simulation/data-notifications/index.js":
/*!*******************************************************!*\
  !*** ./client/simulation/data-notifications/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _DataNotifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DataNotifications */ "./client/simulation/data-notifications/DataNotifications.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: ['dataNotifications'],
  dataNotifications: ['type', _DataNotifications__WEBPACK_IMPORTED_MODULE_0__.default]
});

/***/ }),

/***/ "./client/simulation/index.js":
/*!************************************!*\
  !*** ./client/simulation/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _data_notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data-notifications */ "./client/simulation/data-notifications/index.js");
/* harmony import */ var _behaviors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./behaviors */ "./client/simulation/behaviors/index.js");
/* harmony import */ var _script_runner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./script-runner */ "./client/simulation/script-runner/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _behaviors__WEBPACK_IMPORTED_MODULE_1__.default,
    _script_runner__WEBPACK_IMPORTED_MODULE_2__.default,
    _data_notifications__WEBPACK_IMPORTED_MODULE_0__.default
  ]
});

/***/ }),

/***/ "./client/simulation/script-runner/ScriptRunner.js":
/*!*********************************************************!*\
  !*** ./client/simulation/script-runner/ScriptRunner.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isExpressionPattern": () => (/* binding */ isExpressionPattern),
/* harmony export */   "expressionPattern": () => (/* binding */ expressionPattern),
/* harmony export */   "default": () => (/* binding */ ScriptRunner)
/* harmony export */ });
/* harmony import */ var _events_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../events/EventHelper */ "./client/events/EventHelper.js");


const isExpressionPattern = /^\${(.+?)}$/;
const expressionPattern = /\${(.+?)}/;

function ScriptRunner(eventBus) {
  this._eventBus = eventBus;
}

ScriptRunner.prototype.runScript = async function(code, data, additionalData) {
  const eventBus = this._eventBus;

  const fireScriptRun = async (c, d) => {
    return eventBus.fire(_events_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RUN_CODE_EVALUATION_EVENT, c, Array.from(d.values()));
  };

  return fireScriptRun(code, data).then(results => {
    let newResults = { ...results, ...additionalData };
    if (newResults.error) {
      return Promise.reject(newResults);
    } else {
      return Promise.resolve(newResults);
    }
  });
};

ScriptRunner.$inject = ['eventBus'];

/***/ }),

/***/ "./client/simulation/script-runner/index.js":
/*!**************************************************!*\
  !*** ./client/simulation/script-runner/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ScriptRunner__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ScriptRunner */ "./client/simulation/script-runner/ScriptRunner.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: ['scriptRunner'],
  scriptRunner: ['type', _ScriptRunner__WEBPACK_IMPORTED_MODULE_0__.default]
});

/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/Utils.js":
/*!************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/Utils.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query,
    domClear = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").clear,
    domClasses = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").classes,
    is = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js").is,
    forEach = __webpack_require__(/*! lodash/forEach */ "./node_modules/lodash/forEach.js"),
    domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify,
    Ids = __webpack_require__(/*! ids */ "./node_modules/ids/dist/index.esm.js").default;

var SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
var QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

// for ID validation as per BPMN Schema (QName - Namespace)
var ID_REGEX = /^[a-z_][\w-.]*$/i;

var HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};

function selectedOption(selectBox) {
  if (selectBox.selectedIndex >= 0) {
    return selectBox.options[selectBox.selectedIndex].value;
  }
}

module.exports.selectedOption = selectedOption;


function selectedType(elementSyntax, inputNode) {
  var typeSelect = domQuery(elementSyntax, inputNode);
  return selectedOption(typeSelect);
}

module.exports.selectedType = selectedType;


/**
 * Retrieve the root element the document this
 * business object is contained in.
 *
 * @return {ModdleElement}
 */
function getRoot(businessObject) {
  var parent = businessObject;
  while (parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
}

module.exports.getRoot = getRoot;


/**
 * filters all elements in the list which have a given type.
 * removes a new list
 */
function filterElementsByType(objectList, type) {
  var list = objectList || [];
  var result = [];
  forEach(list, function(obj) {
    if (is(obj, type)) {
      result.push(obj);
    }
  });
  return result;
}

module.exports.filterElementsByType = filterElementsByType;


function findRootElementsByType(businessObject, referencedType) {
  var root = getRoot(businessObject);

  return filterElementsByType(root.rootElements, referencedType);
}

module.exports.findRootElementsByType = findRootElementsByType;


function removeAllChildren(domElement) {
  while (domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
}

module.exports.removeAllChildren = removeAllChildren;


/**
 * adds an empty option to the list
 */
function addEmptyParameter(list) {
  return list.push({ 'label': '', 'value': '', 'name': '' });
}

module.exports.addEmptyParameter = addEmptyParameter;


/**
 * returns a dropdown option label depending on the defined event attributes
 */
function getOptionLabel(obj) {
  var label = obj.name || '';

  if (obj.errorCode)
    label += ' (code=' + obj.errorCode + ')';
  if (obj.escalationCode)
    label += ' (code=' + obj.escalationCode + ')';

  return label;
}

/**
 * returns a list with all root elements for the given parameter 'referencedType'
 */
function refreshOptionsModel(businessObject, referencedType) {
  var model = [];
  var referableObjects = findRootElementsByType(businessObject, referencedType);
  forEach(referableObjects, function(obj) {
    model.push({
      label: getOptionLabel(obj),
      value: obj.id,
      name: obj.name
    });
  });
  return model;
}

module.exports.refreshOptionsModel = refreshOptionsModel;


/**
 * fills the drop down with options
 */
function updateOptionsDropDown(domSelector, businessObject, referencedType, entryNode) {
  var options = refreshOptionsModel(businessObject, referencedType);
  addEmptyParameter(options);
  var selectBox = domQuery(domSelector, entryNode);
  domClear(selectBox);

  forEach(options, function(option) {
    var optionEntry = domify('<option value="' + escapeHTML(option.value) + '">' + escapeHTML(option.label) + '</option>');
    selectBox.appendChild(optionEntry);
  });
  return options;
}

module.exports.updateOptionsDropDown = updateOptionsDropDown;


/**
 * checks whether the id value is valid
 *
 * @param {ModdleElement} bo
 * @param {String} idValue
 * @param {Function} translate
 *
 * @return {String} error message
 */
function isIdValid(bo, idValue, translate) {
  var assigned = bo.$model.ids.assigned(idValue);

  var idExists = assigned && assigned !== bo;

  if (!idValue || idExists) {
    return translate('Element must have an unique id.');
  }

  return validateId(idValue, translate);
}

module.exports.isIdValid = isIdValid;


function validateId(idValue, translate) {

  if (containsSpace(idValue)) {
    return translate('Id must not contain spaces.');
  }

  if (!ID_REGEX.test(idValue)) {

    if (QNAME_REGEX.test(idValue)) {
      return translate('Id must not contain prefix.');
    }

    return translate('Id must be a valid QName.');
  }
}

module.exports.validateId = validateId;


function containsSpace(value) {
  return SPACE_REGEX.test(value);
}

module.exports.containsSpace = containsSpace;

/**
 * generate a semantic id with given prefix
 */
function nextId(prefix) {
  var ids = new Ids([32,32,1]);

  return ids.nextPrefixed(prefix);
}

module.exports.nextId = nextId;


function triggerClickEvent(element) {
  var evt;
  var eventType = 'click';

  if (document.createEvent) {
    try {

      // Chrome, Safari, Firefox
      evt = new MouseEvent((eventType), { view: window, bubbles: true, cancelable: true });
    } catch (e) {

      // IE 11, PhantomJS (wat!)
      evt = document.createEvent('MouseEvent');

      evt.initEvent((eventType), true, true);
    }
    return element.dispatchEvent(evt);
  } else {

    // Welcome IE
    evt = document.createEventObject();

    return element.fireEvent('on' + eventType, evt);
  }
}

module.exports.triggerClickEvent = triggerClickEvent;


function escapeHTML(str) {
  str = '' + str;

  return str && str.replace(/[&<>"']/g, function(match) {
    return HTML_ESCAPE_MAP[match];
  });
}

module.exports.escapeHTML = escapeHTML;

function createDropdown(dropdown) {
  var menu = dropdown.menu;

  var dropdownNode = domify(
    '<div class="group__dropdown">' +
      '<button class="group__dropdown-button">' +
      '<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path fill="currentColor" d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"></path></svg>' +
      '</button>' +
      '<div class="group__dropdown-menu"></div>' +
    '</div>'
  );

  var buttonNode = domQuery('.group__dropdown-button', dropdownNode),
      menuNode = domQuery('.group__dropdown-menu', dropdownNode);

  buttonNode.addEventListener('click', function(event) {
    domClasses(dropdownNode).toggle('group__dropdown--open');

    createOnGlobalClick(event);
  });

  forEach(menu, function(menuItem) {
    var menuItemNode = domify('<div class="group__dropdown-menu-item" data-dropdown-action="' +
      menuItem.id +
      '">' + escapeHTML(menuItem.label) + '</div>');

    menuItemNode.addEventListener('click', function() {
      menuItem.onClick();

      domClasses(dropdownNode).remove('group__dropdown--open');
    });

    menuNode.appendChild(menuItemNode);
  });

  var _onGlobalClick;

  function createOnGlobalClick(_event) {
    function onGlobalClick(event) {
      if (event === _event) {
        return;
      }

      var target = event.target;

      if (menuNode !== target && !menuNode.contains(target)) {
        domClasses(dropdownNode).remove('group__dropdown--open');

        document.removeEventListener('click', onGlobalClick);
      }
    }

    if (_onGlobalClick) {
      document.removeEventListener('click', _onGlobalClick);
    }

    document.addEventListener('click', onGlobalClick);

    _onGlobalClick = onGlobalClick;
  }

  return dropdownNode;
}

module.exports.createDropdown = createDropdown;

/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/AutoSuggestTextBoxFactory.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/AutoSuggestTextBoxFactory.js ***!
  \****************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domClasses = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").classes,
    domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify,
    domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query;

var assign = __webpack_require__(/*! min-dash */ "./node_modules/min-dash/dist/index.esm.js").assign,
    find = __webpack_require__(/*! min-dash */ "./node_modules/min-dash/dist/index.esm.js").find,
    forEach = __webpack_require__(/*! min-dash */ "./node_modules/min-dash/dist/index.esm.js").forEach,
    debounce = __webpack_require__(/*! min-dash */ "./node_modules/min-dash/dist/index.esm.js").debounce;

var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");

var CLASS_ACTIVE = 'active';

var FOCUS_LEAVE_DELAY = '150';

var TEXT_NODE_NAME = '#text';

var SUGGESTION_LIST_BOX_THRESHOLD = 15;

var noop = function() {};


var autoSuggestTextBox = function(translate, options, defaultParameters) {

  var resource = defaultParameters,
      label = options.label || resource.id,
      canBeShown = !!options.show && typeof options.show === 'function',
      description = options.description;

  resource.html =
    domify('<label ' +
      'for="camunda-' + escapeHTML(resource.id) + '" ' +
      (canBeShown ? 'data-show="isShown"' : '') +
      '>' + label + '</label>' +
    '<div class="bpp-field-wrapper" ' +
      (canBeShown ? 'data-show="isShown"' : '') +
    '>' +
      '<div ' +
        'contenteditable="true"' +
        'id="camunda-' + escapeHTML(resource.id) + '" ' +
        'name="' + escapeHTML(options.modelProperty) + '" ' +
        'data-auto-suggest="suggestItems"' +
        'data-blur="handleFocusLeave"' +
      '></div>' +
      '<div class="bpp-autosuggest-list"></div>' +
    '</div>');

  if (description) {
    domQuery('.bpp-field-wrapper', resource.html).appendChild(entryFieldDescription(translate, description));
  }

  if (canBeShown) {
    resource.isShown = function() {
      return options.show.apply(resource, arguments);
    };
  }

  /**
   * Ensure selected item got recognized before list got hidden
   */
  resource.handleFocusLeave = debounce(function(element, entryNode) {
    clearSuggestionList(entryNode);
    hideSuggestionList(entryNode);
  }, FOCUS_LEAVE_DELAY);

  /**
   * Fill the suggestion list relative to the current word under the cursor.
   *
   * @param {djs.model.Base} element
   * @param {HTMLElement} entryNode
   * @param {Event} event
   */
  resource.suggestItems = function(element, entryNode, event) {
    var editorNode = event.delegateTarget,
        range = getSelectionRange(),
        focusNode = range.focusNode,
        caretPosition = getCaretPosition(range.range),
        canSuggest = options.canSuggest || noop,
        getItems = options.getItems;

    function updateSuggestionList(items) {
      var listNode = domQuery('.bpp-autosuggest-list', entryNode);

      // (1) clear list before
      clearSuggestionList(entryNode);

      // (2) keep list invisible if no items
      if (!items.length) {
        return;
      }

      domClasses(listNode).add(CLASS_ACTIVE);

      // (3) create new items
      forEach(items, function(item) {
        createSuggestionItem(listNode, item);
      });

      // (4) place list relative to cursor
      var position = getSuggestionListPosition(listNode, document.body).position;
      setPosition(listNode, position.x, position.y);
    }

    function createSuggestionItem(parentNode, value) {
      var itemNode = domify('<div class="bpp-autosuggest-item"></div>');
      itemNode.innerText = escapeHTML(value);

      parentNode.appendChild(itemNode);

      itemNode.addEventListener('click', handleItemClick);
    }

    function handleItemClick(event) {
      var value = event.target.innerText,
          wordIndex = currentWord.index,
          start = wordIndex,
          end = wordIndex + currentWord[0].length;

      selectRange(focusNode, start, end);

      document.execCommand('insertText', false, value);

      clearSuggestionList(entryNode);
      hideSuggestionList(entryNode);
    }

    hideSuggestionList(entryNode);

    var currentWord = (getWordUnderCursor(focusNode, caretPosition) || []);

    if (currentWord && canSuggest(currentWord, editorNode, focusNode)) {
      var items = getItems(element, entryNode),
          results = [],
          value = currentWord[0];

      // sort matches by
      // (1) item starts with value (case insensitive)
      // (2) value is inside suggested item (case insensitive)
      forEach(items, function(item) {
        var itemLowerCase = item.toLowerCase(),
            valueLowerCase = value && value.toLowerCase();

        if (itemLowerCase.indexOf(valueLowerCase) === 0) {
          results.push(item);
        }
      });

      forEach(items, function(item) {
        var itemLowerCase = item.toLowerCase(item),
            valueLowerCase = value && value.toLowerCase();

        if (itemLowerCase.indexOf(valueLowerCase) >= 1) {
          results.push(item);
        }
      });

      updateSuggestionList(results);
    }
  };

  /**
  * Calculates the position coordinates of the suggestion list,
  * dependant on position of cursor
  *
  * @return {Object} coordinates
  */
  function getSuggestionListPosition(listNode, container) {
    var range = getSelectionRange().range,
        cursorBounds = range.getBoundingClientRect(),
        clientBounds = container.getBoundingClientRect(),
        listBounds = listNode.getBoundingClientRect();

    var coordinates = {
      'top-left': {
        x: cursorBounds.right - listBounds.width,
        y: cursorBounds.top - listBounds.height
      },
      'top-right': {
        x: cursorBounds.right,
        y: cursorBounds.top - listBounds.height
      },
      'bottom-left': {
        x: cursorBounds.right - listBounds.width,
        y: cursorBounds.top + SUGGESTION_LIST_BOX_THRESHOLD
      },
      'bottom-right': {
        x: cursorBounds.right,
        y: cursorBounds.top + SUGGESTION_LIST_BOX_THRESHOLD
      }
    };

    var orientation = '';

    if (cursorBounds.top + SUGGESTION_LIST_BOX_THRESHOLD + listBounds.height > (clientBounds.height + clientBounds.top)) {
      orientation = 'top-';
    } else {
      orientation = 'bottom-';
    }

    if (cursorBounds.right + listBounds.width > (clientBounds.width + clientBounds.left)) {
      orientation += 'left';
    } else {
      orientation += 'right';
    }

    return { orientation: orientation, position: coordinates[orientation] };
  }

  resource.getSuggestionListPosition = getSuggestionListPosition;


  resource.cssClasses = ['bpp-autosuggest-textbox'];

  return resource;
};

module.exports = autoSuggestTextBox;


// helpers /////////////////////////////

function getSelectionRange() {
  var selection = document.getSelection();

  return {
    range: selection.getRangeAt(0),
    focusNode: selection.focusNode
  };
}

function getCaretPosition(range) {
  return range.startOffset;
}

function selectRange(focusNode, start, end) {
  var range = document.createRange(),
      selection = window.getSelection();

  range.setStart(focusNode, start);
  range.setEnd(focusNode, end);

  selection.removeAllRanges();

  selection.addRange(range);
}

function hideSuggestionList(entryNode) {
  var listNode = domQuery('.bpp-autosuggest-list', entryNode);
  domClasses(listNode).remove(CLASS_ACTIVE);
}

function clearSuggestionList(entryNode) {
  var listNode = domQuery('.bpp-autosuggest-list', entryNode);
  while (listNode.firstChild) {
    listNode.removeChild(listNode.firstChild);
  }
}

function getWordUnderCursor(node, currentCursorPositon) {
  var value = node.nodeName === TEXT_NODE_NAME ? node.wholeText : node.innerText,
      allWords = findWords(value);

  return find(allWords, function(word) {
    var matchValue = word[0],
        wordStart = word.index,
        wordEnd = wordStart + matchValue.length - 1;

    return (
      wordStart <= (currentCursorPositon - 1) &&
      wordEnd >= (currentCursorPositon - 1)
    );
  });
}

/**
 * Retrieves all words inside a text (also inside clauses and after operators)
 *
 * @param {string} value
 *
 * @return {Array<Object>}
 */
function findWords(value) {

  // eslint-disable-next-line no-useless-escape
  return matchAll(value, /[^\s\r\(\)\,\+\-\*\/\{\}]+/g);
}

function matchAll(value, regex) {
  var regexp = RegExp(regex),
      match,
      matches = [];

  while ((match = regexp.exec(value)) !== null) {
    matches.push(match);
  }

  return matches;
}

function setPosition(el, x, y) {
  assign(el.style, { left: x + 'px', top: y + 'px' });
}


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/CheckboxEntryFactory.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/CheckboxEntryFactory.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify;

var getBusinessObject = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js").getBusinessObject,
    cmdHelper = __webpack_require__(/*! ../helper/CmdHelper */ "./node_modules/bpmn-js-properties-panel/lib/helper/CmdHelper.js"),
    escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");


var checkbox = function(translate, options, defaultParameters) {
  var resource = defaultParameters,
      id = resource.id,
      label = options.label || id,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      description = options.description;

  resource.html =
    domify('<input id="camunda-' + escapeHTML(id) + '" ' +
         'type="checkbox" ' +
         'name="' + escapeHTML(options.modelProperty) + '" ' +
         (canBeDisabled ? 'data-disable="isDisabled"' : '') +
         (canBeHidden ? 'data-show="isHidden"' : '') +
         ' />' +
    '<label for="camunda-' + escapeHTML(id) + '" ' +
         (canBeDisabled ? 'data-disable="isDisabled"' : '') +
         (canBeHidden ? 'data-show="isHidden"' : '') +
         '>' + escapeHTML(label) + '</label>');

  // add description below checkbox entry field
  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: canBeHidden && 'isHidden' }));
  }

  resource.get = function(element) {
    var bo = getBusinessObject(element),
        res = {};

    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

  resource.set = function(element, values) {
    var res = {};

    res[options.modelProperty] = !!values[options.modelProperty];

    return cmdHelper.updateProperties(element, res);
  };

  if (typeof options.set === 'function') {
    resource.set = options.set;
  }

  if (typeof options.get === 'function') {
    resource.get = options.get;
  }

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-checkbox'];

  return resource;
};

module.exports = checkbox;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/CollapsibleEntryFactory.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/CollapsibleEntryFactory.js ***!
  \**************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;
var domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query;


/**
 * @param  {object} options
 * @param  {string} options.id
 * @param  {string} [options.title='']
 * @param  {string} [options.description='']
 * @param  {boolean} [options.open=false]
 * @param  {Function} [options.onToggle]
 * @param  {Function} [options.onRemove]
 *
 * @return {object}
 */
function Collapsible(options) {

  var id = options.id,
      title = options.title || '',
      description = options.description || '',
      open = !!options.open || false,
      onToggle = options.onToggle || noop,
      onRemove = options.onRemove,
      cssClasses = options.cssClasses || [];


  var collapsibleEntry = {
    id: id,
    toggle: toggle,
    isOpen: isOpen,
    set: set,
    setOpen: setOpen,
    get: get
  };

  if (typeof onRemove === 'function') {
    collapsibleEntry.onRemove = function(entry, entryNode, actionId, event) {
      var commands = onRemove(entry, entryNode, actionId, event);

      if (commands) {
        scheduleCommands(commands, entryNode);
        return true;
      }
    };
  }

  function get(element, entryNode) {
    if (options.get) {
      return options.get(element, entryNode);
    }

    return {
      title: title || '',
      description: description || ''
    };
  }

  function set() {
    var commands = this._commands;

    if (commands) {
      delete this._commands;
      return commands;
    }
  }

  function toggle(element, entryNode, event, scope) {
    var value = !open;

    setOpen(value, entryNode);
    onToggle(value, entryNode);
  }

  /**
   * Set entry's open state.
   *
   * @param {boolean} value
   * @param {HTMLElement} entryNode
   */
  function setOpen(value, entryNode) {
    open = value;
    entryNode.classList.toggle('bpp-collapsible--collapsed', !value);
  }

  function isOpen() {
    return open;
  }

  /**
   * Schedule commands to be run with next `set` method call.
   *
   * @param {Array<any>} commands
   * @param {HTMLElement} entryNode
   */
  function scheduleCommands(commands, entryNode) {
    collapsibleEntry._commands = commands;

    // @barmac: hack to make properties panel call `set`
    var input = domQuery('input[type="hidden"]', entryNode);
    input.value = 1;
  }

  collapsibleEntry.html = '<div class="bpp-field-wrapper" data-action="toggle"><input name="hidden" type="hidden">' +
    '<span class="bpp-collapsible__icon"></span>' +
    '<label class="bpp-collapsible__title" data-value="title">' + escapeHTML(title) + '</label>' +
    '<label class="bpp-collapsible__description" data-value="description">' + escapeHTML(description) + '</label>' +
    (onRemove ? '<button class="bpp-collapsible__remove action-button clear" data-action="onRemove"></button>' : '') +
  '</div>';

  collapsibleEntry.cssClasses = cssClasses.concat(open ?
    [ 'bpp-collapsible' ] : [ 'bpp-collapsible', 'bpp-collapsible--collapsed' ]
  );

  return collapsibleEntry;
}

module.exports = Collapsible;

function noop() {}


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/ComboEntryFactory.js":
/*!********************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/ComboEntryFactory.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var assign = __webpack_require__(/*! lodash/assign */ "./node_modules/lodash/assign.js"),
    find = __webpack_require__(/*! lodash/find */ "./node_modules/lodash/find.js");

var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify,
    domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query;

var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var selectEntryFactory = __webpack_require__(/*! ./SelectEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/SelectEntryFactory.js"),
    entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");


/**
 * The combo box is a special implementation of the select entry and adds the option 'custom' to the
 * select box. If 'custom' is selected, an additional text input field is shown which allows to define
 * a custom value.
 *
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {Array<Object>} options.selectOptions list of name/value pairs
 * @param  {string} options.modelProperty
 * @param  {function} options.get
 * @param  {function} options.set
 * @param  {string} [options.customValue] custom select option value (default: 'custom')
 * @param  {string} [options.customName] custom select option name visible in the select box (default: 'custom')
 *
 * @return {Object}
 */
var comboBox = function(translate, options) {

  var selectOptions = options.selectOptions,
      modelProperty = options.modelProperty,
      customValue = options.customValue || 'custom',
      customName = options.customName || 'custom ' + modelProperty,
      description = options.description;

  // check if a value is not a built in value
  var isCustomValue = function(value) {
    if (typeof value[modelProperty] === 'undefined') {
      return false;
    }

    var isCustom = !find(selectOptions, function(option) {
      return value[modelProperty] === option.value;
    });

    return isCustom;
  };

  var comboOptions = assign({}, options);

  // true if the selected value in the select box is customValue
  comboOptions.showCustomInput = function(element, node) {
    var selectBox = domQuery('[data-entry="'+ options.id +'"] select', node.parentNode);

    if (selectBox) {
      return selectBox.value === customValue;
    }

    return false;
  };

  comboOptions.get = function(element, node) {
    var value = options.get(element, node);

    var modifiedValues = {};

    if (!isCustomValue(value)) {
      modifiedValues[modelProperty] = value[modelProperty] || '';

      return modifiedValues;
    }

    modifiedValues[modelProperty] = customValue;
    modifiedValues['custom-'+modelProperty] = value[modelProperty];

    return modifiedValues;
  };

  comboOptions.set = function(element, values, node) {
    var modifiedValues = {};

    // if the custom select option has been selected
    // take the value from the text input field
    if (values[modelProperty] === customValue) {
      modifiedValues[modelProperty] = values['custom-' + modelProperty] || '';
    }
    else if (options.emptyParameter && values[modelProperty] === '') {
      modifiedValues[modelProperty] = undefined;
    } else {
      modifiedValues[modelProperty] = values[modelProperty];
    }
    return options.set(element, modifiedValues, node);
  };

  comboOptions.selectOptions.push({ name: customName, value: customValue });

  var comboBoxEntry = assign({}, selectEntryFactory(translate, comboOptions, comboOptions));

  var fragment = document.createDocumentFragment();

  fragment.appendChild(comboBoxEntry.html);

  comboBoxEntry.html = fragment;

  comboBoxEntry.html.appendChild(domify('<div class="bpp-field-wrapper bpp-combo-input" ' +
    'data-show="showCustomInput"' +
    '>' +
    '<input id="camunda-' + escapeHTML(options.id) + '-input" type="text" name="custom-' +
      escapeHTML(modelProperty) + '" ' +
    ' />' +
  '</div>'));

  // add description below combo box entry field
  if (description) {
    comboBoxEntry.html.appendChild(entryFieldDescription(translate, description, { show: 'showCustomInput' }));
  }

  return comboBoxEntry;
};

module.exports = comboBox;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFactory.js":
/*!***************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/EntryFactory.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var getBusinessObject = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js").getBusinessObject;

// input entities
var textInputField = __webpack_require__(/*! ./TextInputEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/TextInputEntryFactory.js"),
    checkboxField = __webpack_require__(/*! ./CheckboxEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/CheckboxEntryFactory.js"),
    selectBoxField = __webpack_require__(/*! ./SelectEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/SelectEntryFactory.js"),
    comboBoxField = __webpack_require__(/*! ./ComboEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/ComboEntryFactory.js"),
    textBoxField = __webpack_require__(/*! ./TextBoxEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/TextBoxEntryFactory.js"),
    validationAwareTextInputField = __webpack_require__(/*! ./ValidationAwareTextInput */ "./node_modules/bpmn-js-properties-panel/lib/factory/ValidationAwareTextInput.js"),
    tableField = __webpack_require__(/*! ./TableEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/TableEntryFactory.js"),
    labelEntry = __webpack_require__(/*! ./LabelFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/LabelFactory.js"),
    link = __webpack_require__(/*! ./LinkEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/LinkEntryFactory.js"),
    autoSuggestTextBoxField = __webpack_require__(/*! ./AutoSuggestTextBoxFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/AutoSuggestTextBoxFactory.js"),
    collapsible = __webpack_require__(/*! ./CollapsibleEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/CollapsibleEntryFactory.js"),
    toggleSwitch = __webpack_require__(/*! ./ToggleSwitchEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/ToggleSwitchEntryFactory.js");

var cmdHelper = __webpack_require__(/*! ../helper/CmdHelper */ "./node_modules/bpmn-js-properties-panel/lib/helper/CmdHelper.js");

// helpers ////////////////////////////////////////

function ensureNotNull(prop) {
  if (!prop) {
    throw new Error(prop + ' must be set.');
  }

  return prop;
}

/**
 * sets the default parameters which are needed to create an entry
 *
 * @param options
 * @returns {{id: *, description: (*|string), get: (*|Function), set: (*|Function),
 *            validate: (*|Function), html: string}}
 */
var setDefaultParameters = function(options) {

  // default method to fetch the current value of the input field
  var defaultGet = function(element) {
    var bo = getBusinessObject(element),
        res = {},
        prop = ensureNotNull(options.modelProperty);
    res[prop] = bo.get(prop);

    return res;
  };

  // default method to set a new value to the input field
  var defaultSet = function(element, values) {
    var res = {},
        prop = ensureNotNull(options.modelProperty);
    if (values[prop] !== '') {
      res[prop] = values[prop];
    } else {
      res[prop] = undefined;
    }

    return cmdHelper.updateProperties(element, res);
  };

  // default validation method
  var defaultValidate = function() {
    return {};
  };

  return {
    id : options.id,
    description : (options.description || ''),
    get : (options.get || defaultGet),
    set : (options.set || defaultSet),
    validate : (options.validate || defaultValidate),
    html: ''
  };
};

function EntryFactory() {

}

/**
 * Generates an text input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation mehtod - Function
 *
 * - modelProperty: name of the model property - String
 *
 * - buttonAction: Object which contains the following properties: - Object
 * ---- name: name of the [data-action] callback - String
 * ---- method: callback function for [data-action] - Function
 *
 * - buttonShow: Object which contains the following properties: - Object
 * ---- name: name of the [data-show] callback - String
 * ---- method: callback function for [data-show] - Function
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
EntryFactory.textField = function(translate, options) {
  return textInputField(translate, options, setDefaultParameters(options));
};

EntryFactory.validationAwareTextField = function(translate, options) {
  return validationAwareTextInputField(translate, options, setDefaultParameters(options));
};

/**
 * Generates a checkbox input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation method - Function
 *
 * - modelProperty: name of the model property - String
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
EntryFactory.checkbox = function(translate, options) {
  return checkboxField(translate, options, setDefaultParameters(options));
};

EntryFactory.textBox = function(translate, options) {
  return textBoxField(translate, options, setDefaultParameters(options));
};

EntryFactory.selectBox = function(translate, options) {
  return selectBoxField(translate, options, setDefaultParameters(options));
};

EntryFactory.comboBox = function(translate, options) {
  return comboBoxField(translate, options);
};

EntryFactory.table = function(translate, options) {
  return tableField(translate, options);
};

EntryFactory.label = function(options) {
  return labelEntry(options);
};

EntryFactory.link = function(translate, options) {
  return link(translate, options);
};

EntryFactory.autoSuggest = function(translate, options) {
  return autoSuggestTextBoxField(translate, options, setDefaultParameters(options));
};

EntryFactory.collapsible = function(options) {
  return collapsible(options);
};

EntryFactory.toggleSwitch = function(translate, options) {
  return toggleSwitch(translate, options, setDefaultParameters(options));
};

module.exports = EntryFactory;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js":
/*!************************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js ***!
  \************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify,
    domClasses = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").classes,
    domEvent = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").event;

var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var MAX_DESCRIPTION_LENGTH = 200;

/**
 * Create a linkified and HTML escaped entry field description.
 *
 * As a special feature, this description may contain both markdown,
 * plain <a href> links and <br />
 *
 * @param {string} description
 * @param {object} [options]
 * @param {string} [options.show] - name of callback to determine whether description is shown
 */
module.exports = function entryFieldDescription(translate, description, options) {
  var show = options && options.show;

  // we tokenize the description to extract text, HTML and markdown links
  // text, links and new lines are handled seperately

  var escaped = [];

  // match markdown [{TEXT}]({URL}) and HTML links <a href="{URL}">{TEXT}</a>
  var pattern = /(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(?:<a href="(https?:\/\/[^"]+)">(.+?(?=<\/))<\/a>)/gi;

  var index = 0;
  var match;
  var link, text;

  while ((match = pattern.exec(description))) {

    // escape + insert text before match
    if (match.index > index) {
      escaped.push(escapeText(description.substring(index, match.index)));
    }

    link = match[2] && encodeURI(match[2]) || match[3];
    text = match[1] || match[4];

    // insert safe link
    escaped.push('<a href="' + link + '" target="_blank">' + escapeText(text) + '</a>');

    index = match.index + match[0].length;
  }

  // escape and insert text after last match
  if (index < description.length) {
    escaped.push(escapeText(description.substring(index)));
  }

  description = escaped.join('');

  var html = domify(
    '<div class="bpp-field-description description description--expanded"' +
    (show ? 'data-show="' + show + '">' : '>') +
    '</div>'
  );

  var descriptionText = domify('<span class="description__text">' + description + '</span>');

  html.appendChild(descriptionText);

  function toggleExpanded(expanded) {
    if (expanded) {
      domClasses(html).add('description--expanded');

      descriptionText.textContent = description + ' ';

      expand.textContent = translate('Less');
    } else {
      domClasses(html).remove('description--expanded');

      descriptionText.textContent = descriptionShortened + ' ... ';

      expand.textContent = translate('More');
    }
  }

  var descriptionShortened,
      expand,
      expanded = false;

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    descriptionShortened = description.slice(0, MAX_DESCRIPTION_LENGTH);

    expand = domify(
      '<span class="bpp-entry-link description__expand">' +
        translate('More') +
      '</span>'
    );

    domEvent.bind(expand, 'click', function() {
      expanded = !expanded;

      toggleExpanded(expanded);
    });

    html.appendChild(expand);

    toggleExpanded(expanded);
  }

  return html;
};

function escapeText(text) {
  var match, index = 0, escaped = [];

  // match new line <br/> <br /> <br.... /> etc.
  var pattern = /<br\s*\/?>/gi;

  while ((match = pattern.exec(text))) {

    if (match.index > index) {
      escaped.push(escapeHTML(text.substring(index, match.index)));
    }

    escaped.push('<br />');

    index = match.index + match[0].length;
  }

  if (index < text.length) {
    escaped.push(escapeHTML(text.substring(index)));
  }

  return escaped.join('');
}

/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/LabelFactory.js":
/*!***************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/LabelFactory.js ***!
  \***************************************************************************/
/***/ ((module) => {

"use strict";


/**
 * The label factory provides a label entry. For the label text
 * it expects either a string provided by the options.labelText
 * parameter or it could be generated programmatically using a
 * function passed as the options.get parameter.
 *
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.labelText]
 * @param  {Function} [options.get]
 * @param  {Function} [options.showLabel]
 * @param  {Boolean} [options.divider] adds a divider at the top of the label if true; default: false
 */
var label = function(options) {
  return {
    id: options.id,
    html: '<label data-value="label" ' +
            'data-show="showLabel" ' +
            'class="entry-label' + (options.divider ? ' divider' : '') + '">' +
          '</label>',
    get: function(element, node) {
      if (typeof options.get === 'function') {
        return options.get(element, node);
      }
      return { label: options.labelText };
    },
    showLabel: function(element, node) {
      if (typeof options.showLabel === 'function') {
        return options.showLabel(element, node);
      }
      return true;
    }
  };
};

module.exports = label;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/LinkEntryFactory.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/LinkEntryFactory.js ***!
  \*******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify;

var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");

var bind = __webpack_require__(/*! lodash/bind */ "./node_modules/lodash/bind.js");

/**
 * An entry that renders a clickable link.
 *
 * A passed {@link options#handleClick} handler is responsible
 * to process the click.
 *
 * The link may be conditionally shown or hidden. This can be
 * controlled via the {@link options.showLink}.
 *
 * @param {Object} options
 * @param {String} options.id
 * @param {String} [options.buttonLabel]
 * @param {Function} options.handleClick
 * @param {Function} [options.showLink] returning false to hide link
 * @param {String} [options.description]
 *
 * @example
 *
 * var linkEntry = link({
 *   id: 'foo',
 *   description: 'Some Description',
 *   handleClick: function(element, node, event) { ... },
 *   showLink: function(element, node) { ... }
 * });
 *
 * @return {Entry} the newly created entry
 */
function link(translate, options) {

  var id = options.id,
      buttonLabel = options.buttonLabel || id,
      showLink = options.showLink,
      handleClick = options.handleClick,
      description = options.description,
      label = options.label;

  if (showLink && typeof showLink !== 'function') {
    throw new Error('options.showLink must be a function');
  }

  if (typeof handleClick !== 'function') {
    throw new Error('options.handleClick must be a function');
  }

  var resource = {
    id: id,
    html: document.createDocumentFragment()
  };

  if (label) {
    resource.html.appendChild(domify('<label for="camunda-' + escapeHTML(id) + '" ' +
      (showLink ? 'data-show="showLink" ' : '') +
      '>'+ escapeHTML(label) +'</label>'));
  }

  resource.html.appendChild(domify('<div class="bpp-field-wrapper">' +
    '<a data-action="handleClick" ' +
    (showLink ? 'data-show="showLink" ' : '') +
    'class="bpp-entry-link' + (options.cssClasses ? ' ' + escapeHTML(options.cssClasses) : '') +
    '">' + escapeHTML(buttonLabel) + '</a></div>'));


  // add description below link entry field
  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: 'showLink' }));
  }

  resource.handleClick = bind(handleClick, resource);

  if (typeof showLink === 'function') {
    resource.showLink = function() {
      return showLink.apply(resource, arguments);
    };
  }

  return resource;
}

module.exports = link;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/SelectEntryFactory.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/SelectEntryFactory.js ***!
  \*********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify,
    domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query;

var forEach = __webpack_require__(/*! lodash/forEach */ "./node_modules/lodash/forEach.js");

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");


var isList = function(list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function(list) {
  return list.concat([ { name: '', value: '' } ]);
};

var createOption = function(option) {
  return '<option value="' + option.value + '">' + option.name + '</option>';
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {function} options.hidden
 * @param  {Object} defaultParameters
 *
 * @return {Object}
 */
var selectbox = function(translate, options, defaultParameters) {
  var resource = defaultParameters,
      label = options.label || resource.id,
      selectOptions = options.selectOptions || [ { name: '', value: '' } ],
      modelProperty = options.modelProperty,
      emptyParameter = options.emptyParameter,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      description = options.description;


  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }


  resource.html =
    domify('<label for="camunda-' + escapeHTML(resource.id) + '"' +
    (canBeDisabled ? 'data-disable="isDisabled" ' : '') +
    (canBeHidden ? 'data-show="isHidden" ' : '') +
    '>' + escapeHTML(label) + '</label>' +
    '<select id="camunda-' + escapeHTML(resource.id) + '-select" name="' +
    escapeHTML(modelProperty) + '"' +
    (canBeDisabled ? 'data-disable="isDisabled" ' : '') +
    (canBeHidden ? 'data-show="isHidden" ' : '') +
    ' data-value></select>');

  var select = domQuery('select', resource.html);

  if (isList(selectOptions)) {
    forEach(selectOptions, function(option) {
      select.appendChild(
        domify(
          '<option value="' + escapeHTML(option.value) +
          (option.title ? '" title="' + escapeHTML(option.title) : '') +
          '">' +
          (option.name ? escapeHTML(option.name) : '') +
          '</option>'
        )
      );
    });
  }

  // add description below select box entry field
  if (description && typeof options.showCustomInput !== 'function') {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: canBeHidden && 'isHidden' }));
  }

  /**
   * Fill the select box options dynamically.
   *
   * Calls the defined function #selectOptions in the entry to get the
   * values for the options and set the value to the inputNode.
   *
   * @param {djs.model.Base} element
   * @param {HTMLElement} entryNode
   * @param {EntryDescriptor} inputNode
   * @param {Object} inputName
   * @param {Object} newValue
   */
  resource.setControlValue = function(element, entryNode, inputNode, inputName, newValue) {
    if (typeof selectOptions === 'function') {

      var options = selectOptions(element, inputNode);

      if (options) {

        // remove existing options
        while (inputNode.firstChild) {
          inputNode.removeChild(inputNode.firstChild);
        }

        // add options
        forEach(options, function(option) {
          var template = domify(createOption(option));

          inputNode.appendChild(template);
        });


      }
    }

    // set select value
    if (newValue !== undefined) {
      inputNode.value = newValue;
    }

  };

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-dropdown'];

  return resource;
};

module.exports = selectbox;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/TableEntryFactory.js":
/*!********************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/TableEntryFactory.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var cmdHelper = __webpack_require__(/*! ../helper/CmdHelper */ "./node_modules/bpmn-js-properties-panel/lib/helper/CmdHelper.js");

var domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query,
    domAttr = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").attr,
    domClosest = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").closest;

var filter = __webpack_require__(/*! lodash/filter */ "./node_modules/lodash/filter.js"),
    forEach = __webpack_require__(/*! lodash/forEach */ "./node_modules/lodash/forEach.js"),
    keys = __webpack_require__(/*! lodash/keys */ "./node_modules/lodash/keys.js");

var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");

var updateSelection = __webpack_require__(/*! selection-update */ "./node_modules/selection-update/index.js");

var TABLE_ROW_DIV_SNIPPET = '<div class="bpp-field-wrapper bpp-table-row">';
var DELETE_ROW_BUTTON_SNIPPET = '<button class="action-button clear" data-action="deleteElement">' +
                                  '<span>X</span>' +
                                '</button>';

function createInputRowTemplate(properties, canRemove) {
  var template = TABLE_ROW_DIV_SNIPPET;
  template += createInputTemplate(properties, canRemove);
  template += canRemove ? DELETE_ROW_BUTTON_SNIPPET : '';
  template += '</div>';

  return template;
}

function createInputTemplate(properties, canRemove) {
  var columns = properties.length;
  var template = '';
  forEach(properties, function(prop, idx) {
    template += '<input class="bpp-table-row-columns-' + columns + ' ' +
                               (canRemove ? 'bpp-table-row-removable' : '') + '" ' +
                       'id="camunda-table-row-cell-input-value-' + idx + '"' +
                       'type="text" ' +
                       'name="' + escapeHTML(prop) + '" />';
  });
  return template;
}

function createLabelRowTemplate(labels) {
  var template = TABLE_ROW_DIV_SNIPPET;
  template += createLabelTemplate(labels);
  template += '</div>';

  return template;
}

function createLabelTemplate(labels) {
  var columns = labels.length;
  var template = '';
  forEach(labels, function(label) {
    template += '<label class="bpp-table-row-columns-' + columns + '">' + escapeHTML(label) + '</label>';
  });
  return template;
}

function pick(elements, properties) {
  return (elements || []).map(function(elem) {
    var newElement = {};
    forEach(properties, function(prop) {
      newElement[prop] = elem[prop] || '';
    });
    return newElement;
  });
}

function diff(element, node, values, oldValues, editable) {
  return filter(values, function(value, idx) {
    return !valueEqual(element, node, value, oldValues[idx], editable, idx);
  });
}

function valueEqual(element, node, value, oldValue, editable, idx) {
  if (value && !oldValue) {
    return false;
  }
  var allKeys = keys(value).concat(keys(oldValue));

  return allKeys.every(function(key) {
    var n = value[key] || undefined;
    var o = oldValue[key] || undefined;
    return !editable(element, node, key, idx) || n === o;
  });
}

function getEntryNode(node) {
  return domClosest(node, '[data-entry]', true);
}

function getContainer(node) {
  return domQuery('div[data-list-entry-container]', node);
}

function getSelection(node) {
  return {
    start: node.selectionStart,
    end: node.selectionEnd
  };
}

function setSelection(node, selection) {
  node.selectionStart = selection.start;
  node.selectionEnd = selection.end;
}

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} options.description
 * @param  {Array<string>} options.modelProperties
 * @param  {Array<string>} options.labels
 * @param  {Function} options.getElements - this callback function must return a list of business object items
 * @param  {Function} options.removeElement
 * @param  {Function} options.addElement
 * @param  {Function} options.updateElement
 * @param  {Function} options.editable
 * @param  {Function} options.setControlValue
 * @param  {Function} options.show
 *
 * @return {Object}
 */
module.exports = function(translate, options) {

  var id = options.id,
      modelProperties = options.modelProperties,
      labels = options.labels,
      description = options.description;

  var labelRow = createLabelRowTemplate(labels);

  var getElements = options.getElements;

  var removeElement = options.removeElement,
      canRemove = typeof removeElement === 'function';

  var addElement = options.addElement,
      canAdd = typeof addElement === 'function',
      addLabel = options.addLabel || 'Add Value';

  var updateElement = options.updateElement,
      canUpdate = typeof updateElement === 'function';

  var editable = options.editable || function() { return true; },
      setControlValue = options.setControlValue;

  var show = options.show,
      canBeShown = typeof show === 'function';

  var elements = function(element, node) {
    return pick(getElements(element, node), modelProperties);
  };

  var html = domify((canAdd ?
    '<div class="bpp-table-add-row" ' + (canBeShown ? 'data-show="show"' : '') + '>' +
          '<label>' + escapeHTML(addLabel) + '</label>' +
          '<button class="action-button add" data-action="addElement"><span>+</span></button>' +
        '</div>' : '') +
        '<div class="bpp-table" data-show="showTable">' +
          '<div class="bpp-field-wrapper bpp-table-row">' +
             labelRow +
          '</div>' +
          '<div data-list-entry-container>' +
          '</div>' +
        '</div>');

  if (description) {
    html.appendChild(entryFieldDescription(translate, description, { show: 'showTable' }));
  }

  var factory = {
    id: id,
    html: html,

    get: function(element, node) {
      var boElements = elements(element, node, this.__invalidValues);

      var invalidValues = this.__invalidValues;

      delete this.__invalidValues;

      forEach(invalidValues, function(value, idx) {
        var element = boElements[idx];

        forEach(modelProperties, function(prop) {
          element[prop] = value[prop];
        });
      });

      return boElements;
    },

    set: function(element, values, node) {
      var action = this.__action || {};
      delete this.__action;

      if (action.id === 'delete-element') {
        return removeElement(element, node, action.idx);
      }
      else if (action.id === 'add-element') {
        return addElement(element, node);
      }
      else if (canUpdate) {
        var commands = [],
            valuesToValidate = values;

        if (typeof options.validate !== 'function') {
          valuesToValidate = diff(element, node, values, elements(element, node), editable);
        }

        var self = this;

        forEach(valuesToValidate, function(value) {
          var validationError,
              idx = values.indexOf(value);

          if (typeof options.validate === 'function') {
            validationError = options.validate(element, value, node, idx);
          }

          if (!validationError) {
            var cmd = updateElement(element, value, node, idx);

            if (cmd) {
              commands.push(cmd);
            }
          } else {

            // cache invalid value in an object by index as key
            self.__invalidValues = self.__invalidValues || {};
            self.__invalidValues[idx] = value;

            // execute a command, which does not do anything
            commands.push(cmdHelper.updateProperties(element, {}));
          }
        });

        return commands;
      }
    },
    createListEntryTemplate: function(value, index, selectBox) {
      return createInputRowTemplate(modelProperties, canRemove);
    },

    addElement: function(element, node, event, scopeNode) {
      var template = domify(createInputRowTemplate(modelProperties, canRemove));

      var container = getContainer(node);
      container.appendChild(template);

      this.__action = {
        id: 'add-element'
      };

      return true;
    },

    deleteElement: function(element, node, event, scopeNode) {
      var container = getContainer(node);
      var rowToDelete = event.delegateTarget.parentNode;
      var idx = parseInt(domAttr(rowToDelete, 'data-index'), 10);

      container.removeChild(rowToDelete);

      this.__action = {
        id: 'delete-element',
        idx: idx
      };

      return true;
    },

    editable: function(element, rowNode, input, prop, value, idx) {
      var entryNode = domClosest(rowNode, '[data-entry]');
      return editable(element, entryNode, prop, idx);
    },

    show: function(element, entryNode, node, scopeNode) {
      entryNode = getEntryNode(entryNode);
      return show(element, entryNode, node, scopeNode);
    },

    showTable: function(element, entryNode, node, scopeNode) {
      entryNode = getEntryNode(entryNode);
      var elems = elements(element, entryNode);
      return elems && elems.length && (!canBeShown || show(element, entryNode, node, scopeNode));
    },

    validateListItem: function(element, value, node, idx) {
      if (typeof options.validate === 'function') {
        return options.validate(element, value, node, idx);
      }
    }

  };

  // Update/set the selection on the correct position.
  // It's the same code like for an input value in the PropertiesPanel.js.
  if (setControlValue) {
    factory.setControlValue = function(element, rowNode, input, prop, value, idx) {
      var entryNode = getEntryNode(rowNode);

      var isReadOnly = domAttr(input, 'readonly');
      var oldValue = input.value;

      var selection;

      // prevents input fields from having the value 'undefined'
      if (value === undefined) {
        value = '';
      }

      // when the attribute 'readonly' exists, ignore the comparison
      // with 'oldValue' and 'value'
      if (!!isReadOnly && oldValue === value) {
        return;
      }

      // update selection on undo/redo
      if (document.activeElement === input) {
        selection = updateSelection(getSelection(input), oldValue, value);
      }

      setControlValue(element, entryNode, input, prop, value, idx);

      if (selection) {
        setSelection(input, selection);
      }

    };
  }

  return factory;

};


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/TextBoxEntryFactory.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/TextBoxEntryFactory.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify;

var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");


var textBox = function(translate, options, defaultParameters) {

  var resource = defaultParameters,
      label = options.label || resource.id,
      canBeShown = !!options.show && typeof options.show === 'function',
      description = options.description;

  resource.html =
    domify('<label for="camunda-' + escapeHTML(resource.id) + '" ' +
    (canBeShown ? 'data-show="isShown"' : '') +
    '>' + label + '</label>' +
    '<div class="bpp-field-wrapper" ' +
    (canBeShown ? 'data-show="isShown"' : '') +
    '>' +
      '<div contenteditable="true" id="camunda-' + escapeHTML(resource.id) + '" ' +
            'name="' + escapeHTML(options.modelProperty) + '" />' +
    '</div>');

  // add description below text box entry field
  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: canBeShown && 'isShown' }));
  }

  if (canBeShown) {
    resource.isShown = function() {
      return options.show.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-textbox'];

  return resource;
};

module.exports = textBox;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/TextInputEntryFactory.js":
/*!************************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/TextInputEntryFactory.js ***!
  \************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify,
    domQuery = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").query;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");


var textField = function(translate, options, defaultParameters) {

  // Default action for the button next to the input-field
  var defaultButtonAction = function(element, inputNode) {
    var input = domQuery('input[name="' + options.modelProperty + '"]', inputNode);
    input.value = '';

    return true;
  };

  // default method to determine if the button should be visible
  var defaultButtonShow = function(element, inputNode) {
    var input = domQuery('input[name="' + options.modelProperty + '"]', inputNode);

    return input.value !== '';
  };


  var resource = defaultParameters,
      label = options.label || resource.id,
      dataValueLabel = options.dataValueLabel,
      buttonLabel = (options.buttonLabel || 'X'),
      actionName = (typeof options.buttonAction != 'undefined') ? options.buttonAction.name : 'clear',
      actionMethod = (typeof options.buttonAction != 'undefined') ? options.buttonAction.method : defaultButtonAction,
      showName = (typeof options.buttonShow != 'undefined') ? options.buttonShow.name : 'canClear',
      showMethod = (typeof options.buttonShow != 'undefined') ? options.buttonShow.method : defaultButtonShow,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      description = options.description;

  resource.html =
    domify('<label for="camunda-' + escapeHTML(resource.id) + '" ' +
      (canBeDisabled ? 'data-disable="isDisabled" ' : '') +
      (canBeHidden ? 'data-show="isHidden" ' : '') +
      (dataValueLabel ? 'data-value="' + escapeHTML(dataValueLabel) + '"' : '') + '>'+ escapeHTML(label) +'</label>' +
    '<div class="bpp-field-wrapper" ' +
      (canBeDisabled ? 'data-disable="isDisabled"' : '') +
      (canBeHidden ? 'data-show="isHidden"' : '') +
      '>' +
      '<input id="camunda-' + escapeHTML(resource.id) + '" type="text" name="' + escapeHTML(options.modelProperty) + '" ' +
        (canBeDisabled ? 'data-disable="isDisabled"' : '') +
        (canBeHidden ? 'data-show="isHidden"' : '') +
        ' />' +
      '<button class="action-button ' + escapeHTML(actionName) + '" data-action="' + escapeHTML(actionName) + '" data-show="' + escapeHTML(showName) + '" ' +
        (canBeDisabled ? 'data-disable="isDisabled"' : '') +
        (canBeHidden ? ' data-show="isHidden"' : '') + '>' +
        '<span>' + escapeHTML(buttonLabel) + '</span>' +
      '</button>' +
    '</div>');

  // add description below text input entry field
  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: canBeHidden && 'isHidden' }));
  }

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return options.disabled.apply(resource, arguments);
    };
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['bpp-textfield'];

  return resource;
};

module.exports = textField;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/ToggleSwitchEntryFactory.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/ToggleSwitchEntryFactory.js ***!
  \***************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var getBusinessObject = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "./node_modules/bpmn-js/lib/util/ModelUtil.js").getBusinessObject,
    cmdHelper = __webpack_require__(/*! ../helper/CmdHelper */ "./node_modules/bpmn-js-properties-panel/lib/helper/CmdHelper.js"),
    escapeHTML = __webpack_require__(/*! ../Utils */ "./node_modules/bpmn-js-properties-panel/lib/Utils.js").escapeHTML;

var entryFieldDescription = __webpack_require__(/*! ./EntryFieldDescription */ "./node_modules/bpmn-js-properties-panel/lib/factory/EntryFieldDescription.js");

var domify = __webpack_require__(/*! min-dom */ "./node_modules/min-dom/dist/index.esm.js").domify;

var toggleSwitch = function(translate, options, defaultParameters) {
  var resource = defaultParameters,
      id = resource.id,
      label = options.label || id,
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      isOn = options.isOn,
      descriptionOn = options.descriptionOn,
      descriptionOff = options.descriptionOff,
      labelOn = options.labelOn,
      labelOff = options.labelOff;

  resource.html = document.createDocumentFragment();

  resource.html.appendChild(domify('<label for="' + escapeHTML(id) + '" ' +
      (canBeHidden ? 'data-show="shouldShow"' : '') +
      '>' + escapeHTML(label) + '</label>' +
    '<div class="bpp-field-wrapper"' +
    (canBeHidden ? 'data-show="shouldShow"' : '') +
    '>' +
      '<label class="bpp-toggle-switch__switcher">' +
        '<input id="' + escapeHTML(id) + '" ' +
            'type="checkbox" ' +
            'name="' + escapeHTML(options.modelProperty) + '" />' +
        '<span class="bpp-toggle-switch__slider"></span>' +
      '</label>' +
      '<p class="bpp-toggle-switch__label" data-show="isOn">' +
        escapeHTML(labelOn) +
      '</p>' +
      '<p class="bpp-toggle-switch__label" data-show="isOff">' +
        escapeHTML(labelOff) +
      '</p>' +
    '</div>'));

  if (descriptionOn) {
    resource.html.appendChild(entryFieldDescription(translate, descriptionOn, { show: 'isOn' }));
  }

  if (descriptionOff) {
    resource.html.appendChild(entryFieldDescription(translate, descriptionOff, { show: 'isOff' }));
  }

  resource.get = function(element) {
    var bo = getBusinessObject(element),
        res = {};

    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

  resource.set = function(element, values) {
    var res = {};

    res[options.modelProperty] = !!values[options.modelProperty];

    return cmdHelper.updateProperties(element, res);
  };

  if (typeof options.set === 'function') {
    resource.set = options.set;
  }

  if (typeof options.get === 'function') {
    resource.get = options.get;
  }

  if (canBeHidden) {
    resource.shouldShow = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.isOn = function() {
    if (canBeHidden && !resource.shouldShow()) {
      return false;
    }

    return isOn.apply(resource, arguments);
  };

  resource.isOff = function() {
    if (canBeHidden && !resource.shouldShow()) {
      return false;
    }

    return !resource.isOn();
  };

  resource.cssClasses = ['bpp-toggle-switch'];

  return resource;
};

module.exports = toggleSwitch;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/factory/ValidationAwareTextInput.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/factory/ValidationAwareTextInput.js ***!
  \***************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var textField = __webpack_require__(/*! ./TextInputEntryFactory */ "./node_modules/bpmn-js-properties-panel/lib/factory/TextInputEntryFactory.js");

/**
 * This function is a wrapper around TextInputEntryFactory.
 * It adds functionality to cache an invalid value entered in the
 * text input, instead of setting it on the business object.
 */
var validationAwareTextField = function(translate, options, defaultParameters) {

  var modelProperty = options.modelProperty;

  defaultParameters.get = function(element, node) {
    var value = this.__lastInvalidValue;

    delete this.__lastInvalidValue;

    var properties = {};

    properties[modelProperty] = value !== undefined ? value : options.getProperty(element, node);

    return properties;
  };

  defaultParameters.set = function(element, values, node) {
    var validationErrors = validate.apply(this, [ element, values, node ]),
        propertyValue = values[modelProperty];

    // make sure we do not update the id
    if (validationErrors && validationErrors[modelProperty]) {
      this.__lastInvalidValue = propertyValue;

      return options.setProperty(element, {}, node);
    } else {
      var properties = {};

      properties[modelProperty] = propertyValue;

      return options.setProperty(element, properties, node);
    }
  };

  var validate = defaultParameters.validate = function(element, values, node) {
    var value = values[modelProperty] || this.__lastInvalidValue;

    var property = {};
    property[modelProperty] = value;

    return options.validate(element, property, node);
  };

  return textField(translate, options, defaultParameters);
};

module.exports = validationAwareTextField;


/***/ }),

/***/ "./node_modules/bpmn-js-properties-panel/lib/helper/CmdHelper.js":
/*!***********************************************************************!*\
  !*** ./node_modules/bpmn-js-properties-panel/lib/helper/CmdHelper.js ***!
  \***********************************************************************/
/***/ ((module) => {

"use strict";


var CmdHelper = {};
module.exports = CmdHelper;

CmdHelper.updateProperties = function(element, properties) {
  return {
    cmd: 'element.updateProperties',
    context: { element: element, properties: properties }
  };
};

CmdHelper.updateBusinessObject = function(element, businessObject, newProperties) {
  return {
    cmd: 'properties-panel.update-businessobject',
    context: {
      element: element,
      businessObject: businessObject,
      properties: newProperties
    }
  };
};

CmdHelper.addElementsTolist = function(element, businessObject, listPropertyName, objectsToAdd, objectsToPrepend) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      objectsToPrepend: objectsToPrepend,
      objectsToAdd: objectsToAdd
    }
  };
};

CmdHelper.removeElementsFromList = function(element, businessObject, listPropertyName, referencePropertyName, objectsToRemove) {

  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName: referencePropertyName,
      objectsToRemove: objectsToRemove
    }
  };
};


CmdHelper.addAndRemoveElementsFromList = function(element, businessObject, listPropertyName, referencePropertyName, objectsToAdd, objectsToRemove) {

  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName: referencePropertyName,
      objectsToAdd: objectsToAdd,
      objectsToRemove: objectsToRemove
    }
  };
};


CmdHelper.setList = function(element, businessObject, listPropertyName, updatedObjectList) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      updatedObjectList: updatedObjectList
    }
  };
};


/***/ }),

/***/ "./node_modules/bpmn-js/lib/util/ModelUtil.js":
/*!****************************************************!*\
  !*** ./node_modules/bpmn-js/lib/util/ModelUtil.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "is": () => (/* binding */ is),
/* harmony export */   "getBusinessObject": () => (/* binding */ getBusinessObject)
/* harmony export */ });
/**
 * Is an element of the given BPMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {string} type
 *
 * @return {boolean}
 */
function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}


/**
 * Return the business object for a given element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @return {ModdleElement}
 */
function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

/***/ }),

/***/ "./node_modules/camunda-modeler-plugin-helpers/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/camunda-modeler-plugin-helpers/index.js ***!
  \**************************************************************/
/***/ ((module) => {

/**
 * Validate and register a client plugin.
 *
 * @param {Object} plugin
 * @param {String} type
 */
function registerClientPlugin(plugin, type) {
  var plugins = window.plugins || [];
  window.plugins = plugins;

  if (!plugin) {
    throw new Error('plugin not specified');
  }

  if (!type) {
    throw new Error('type not specified');
  }

  plugins.push({
    plugin: plugin,
    type: type
  });
}

/**
 * Validate and register a bpmn-js plugin.
 *
 * Example use:
 *
 *    var registerBpmnJSPlugin = require('./camundaModelerPluginHelpers').registerBpmnJSPlugin;
 *    var module = require('./index');
 *
 *    registerBpmnJSPlugin(module);
 *
 * @param {Object} plugin
 */
function registerBpmnJSPlugin(plugin) {
  registerClientPlugin(plugin, 'bpmn.modeler.additionalModules');
}

module.exports.registerBpmnJSPlugin = registerBpmnJSPlugin;

/**
 * Validate and register a bpmn-moddle extension plugin.
 *
 * Example use:
 *
 *    var registerBpmnJSModdleExtension = require('./camundaModelerPluginHelpers').registerBpmnJSModdleExtension;
 *    var module = require('./index');
 *
 *    registerBpmnJSModdleExtension(module);
 *
 * @param {Object} plugin
 */
function registerBpmnJSModdleExtension(plugin) {
  registerClientPlugin(plugin, 'bpmn.modeler.moddleExtension');
}

module.exports.registerBpmnJSModdleExtension = registerBpmnJSModdleExtension;


/***/ }),

/***/ "./node_modules/ids/dist/index.esm.js":
/*!********************************************!*\
  !*** ./node_modules/ids/dist/index.esm.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hat_1 = createCommonjsModule(function (module) {
var hat = module.exports = function (bits, base) {
    if (!base) base = 16;
    if (bits === undefined) bits = 128;
    if (bits <= 0) return '0';
    
    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
    for (var i = 2; digits === Infinity; i *= 2) {
        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
    }
    
    var rem = digits - Math.floor(digits);
    
    var res = '';
    
    for (var i = 0; i < Math.floor(digits); i++) {
        var x = Math.floor(Math.random() * base).toString(base);
        res = x + res;
    }
    
    if (rem) {
        var b = Math.pow(base, rem);
        var x = Math.floor(Math.random() * b).toString(base);
        res = x + res;
    }
    
    var parsed = parseInt(res, base);
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
        return hat(bits, base)
    }
    else return res;
};

hat.rack = function (bits, base, expandBy) {
    var fn = function (data) {
        var iters = 0;
        do {
            if (iters ++ > 10) {
                if (expandBy) bits += expandBy;
                else throw new Error('too many ID collisions, use more bits')
            }
            
            var id = hat(bits, base);
        } while (Object.hasOwnProperty.call(hats, id));
        
        hats[id] = data;
        return id;
    };
    var hats = fn.hats = {};
    
    fn.get = function (id) {
        return fn.hats[id];
    };
    
    fn.set = function (id, value) {
        fn.hats[id] = value;
        return fn;
    };
    
    fn.bits = bits || 128;
    fn.base = base || 16;
    return fn;
};
});

/**
 * Create a new id generator / cache instance.
 *
 * You may optionally provide a seed that is used internally.
 *
 * @param {Seed} seed
 */

function Ids(seed) {
  if (!(this instanceof Ids)) {
    return new Ids(seed);
  }

  seed = seed || [128, 36, 1];
  this._seed = seed.length ? hat_1.rack(seed[0], seed[1], seed[2]) : seed;
}
/**
 * Generate a next id.
 *
 * @param {Object} [element] element to bind the id to
 *
 * @return {String} id
 */

Ids.prototype.next = function (element) {
  return this._seed(element || true);
};
/**
 * Generate a next id with a given prefix.
 *
 * @param {Object} [element] element to bind the id to
 *
 * @return {String} id
 */


Ids.prototype.nextPrefixed = function (prefix, element) {
  var id;

  do {
    id = prefix + this.next(true);
  } while (this.assigned(id)); // claim {prefix}{random}


  this.claim(id, element); // return

  return id;
};
/**
 * Manually claim an existing id.
 *
 * @param {String} id
 * @param {String} [element] element the id is claimed by
 */


Ids.prototype.claim = function (id, element) {
  this._seed.set(id, element || true);
};
/**
 * Returns true if the given id has already been assigned.
 *
 * @param  {String} id
 * @return {Boolean}
 */


Ids.prototype.assigned = function (id) {
  return this._seed.get(id) || false;
};
/**
 * Unclaim an id.
 *
 * @param  {String} id the id to unclaim
 */


Ids.prototype.unclaim = function (id) {
  delete this._seed.hats[id];
};
/**
 * Clear all claimed ids.
 */


Ids.prototype.clear = function () {
  var hats = this._seed.hats,
      id;

  for (id in hats) {
    this.unclaim(id);
  }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ids);
//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ "./node_modules/lodash/_DataView.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_DataView.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),

/***/ "./node_modules/lodash/_Hash.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_Hash.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hashClear = __webpack_require__(/*! ./_hashClear */ "./node_modules/lodash/_hashClear.js"),
    hashDelete = __webpack_require__(/*! ./_hashDelete */ "./node_modules/lodash/_hashDelete.js"),
    hashGet = __webpack_require__(/*! ./_hashGet */ "./node_modules/lodash/_hashGet.js"),
    hashHas = __webpack_require__(/*! ./_hashHas */ "./node_modules/lodash/_hashHas.js"),
    hashSet = __webpack_require__(/*! ./_hashSet */ "./node_modules/lodash/_hashSet.js");

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),

/***/ "./node_modules/lodash/_LazyWrapper.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_LazyWrapper.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseCreate = __webpack_require__(/*! ./_baseCreate */ "./node_modules/lodash/_baseCreate.js"),
    baseLodash = __webpack_require__(/*! ./_baseLodash */ "./node_modules/lodash/_baseLodash.js");

/** Used as references for the maximum length and index of an array. */
var MAX_ARRAY_LENGTH = 4294967295;

/**
 * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
 *
 * @private
 * @constructor
 * @param {*} value The value to wrap.
 */
function LazyWrapper(value) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__dir__ = 1;
  this.__filtered__ = false;
  this.__iteratees__ = [];
  this.__takeCount__ = MAX_ARRAY_LENGTH;
  this.__views__ = [];
}

// Ensure `LazyWrapper` is an instance of `baseLodash`.
LazyWrapper.prototype = baseCreate(baseLodash.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;

module.exports = LazyWrapper;


/***/ }),

/***/ "./node_modules/lodash/_ListCache.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_ListCache.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var listCacheClear = __webpack_require__(/*! ./_listCacheClear */ "./node_modules/lodash/_listCacheClear.js"),
    listCacheDelete = __webpack_require__(/*! ./_listCacheDelete */ "./node_modules/lodash/_listCacheDelete.js"),
    listCacheGet = __webpack_require__(/*! ./_listCacheGet */ "./node_modules/lodash/_listCacheGet.js"),
    listCacheHas = __webpack_require__(/*! ./_listCacheHas */ "./node_modules/lodash/_listCacheHas.js"),
    listCacheSet = __webpack_require__(/*! ./_listCacheSet */ "./node_modules/lodash/_listCacheSet.js");

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),

/***/ "./node_modules/lodash/_LodashWrapper.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_LodashWrapper.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseCreate = __webpack_require__(/*! ./_baseCreate */ "./node_modules/lodash/_baseCreate.js"),
    baseLodash = __webpack_require__(/*! ./_baseLodash */ "./node_modules/lodash/_baseLodash.js");

/**
 * The base constructor for creating `lodash` wrapper objects.
 *
 * @private
 * @param {*} value The value to wrap.
 * @param {boolean} [chainAll] Enable explicit method chain sequences.
 */
function LodashWrapper(value, chainAll) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__chain__ = !!chainAll;
  this.__index__ = 0;
  this.__values__ = undefined;
}

LodashWrapper.prototype = baseCreate(baseLodash.prototype);
LodashWrapper.prototype.constructor = LodashWrapper;

module.exports = LodashWrapper;


/***/ }),

/***/ "./node_modules/lodash/_Map.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Map.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),

/***/ "./node_modules/lodash/_MapCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_MapCache.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var mapCacheClear = __webpack_require__(/*! ./_mapCacheClear */ "./node_modules/lodash/_mapCacheClear.js"),
    mapCacheDelete = __webpack_require__(/*! ./_mapCacheDelete */ "./node_modules/lodash/_mapCacheDelete.js"),
    mapCacheGet = __webpack_require__(/*! ./_mapCacheGet */ "./node_modules/lodash/_mapCacheGet.js"),
    mapCacheHas = __webpack_require__(/*! ./_mapCacheHas */ "./node_modules/lodash/_mapCacheHas.js"),
    mapCacheSet = __webpack_require__(/*! ./_mapCacheSet */ "./node_modules/lodash/_mapCacheSet.js");

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),

/***/ "./node_modules/lodash/_Promise.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_Promise.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),

/***/ "./node_modules/lodash/_Set.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Set.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),

/***/ "./node_modules/lodash/_SetCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_SetCache.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js"),
    setCacheAdd = __webpack_require__(/*! ./_setCacheAdd */ "./node_modules/lodash/_setCacheAdd.js"),
    setCacheHas = __webpack_require__(/*! ./_setCacheHas */ "./node_modules/lodash/_setCacheHas.js");

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;


/***/ }),

/***/ "./node_modules/lodash/_Stack.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_Stack.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    stackClear = __webpack_require__(/*! ./_stackClear */ "./node_modules/lodash/_stackClear.js"),
    stackDelete = __webpack_require__(/*! ./_stackDelete */ "./node_modules/lodash/_stackDelete.js"),
    stackGet = __webpack_require__(/*! ./_stackGet */ "./node_modules/lodash/_stackGet.js"),
    stackHas = __webpack_require__(/*! ./_stackHas */ "./node_modules/lodash/_stackHas.js"),
    stackSet = __webpack_require__(/*! ./_stackSet */ "./node_modules/lodash/_stackSet.js");

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),

/***/ "./node_modules/lodash/_Symbol.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "./node_modules/lodash/_Uint8Array.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_Uint8Array.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),

/***/ "./node_modules/lodash/_WeakMap.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_WeakMap.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),

/***/ "./node_modules/lodash/_apply.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_apply.js ***!
  \***************************************/
/***/ ((module) => {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),

/***/ "./node_modules/lodash/_arrayEach.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayEach.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),

/***/ "./node_modules/lodash/_arrayFilter.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_arrayFilter.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),

/***/ "./node_modules/lodash/_arrayIncludes.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayIncludes.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIndexOf = __webpack_require__(/*! ./_baseIndexOf */ "./node_modules/lodash/_baseIndexOf.js");

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

module.exports = arrayIncludes;


/***/ }),

/***/ "./node_modules/lodash/_arrayLikeKeys.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayLikeKeys.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseTimes = __webpack_require__(/*! ./_baseTimes */ "./node_modules/lodash/_baseTimes.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),

/***/ "./node_modules/lodash/_arrayMap.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_arrayMap.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ "./node_modules/lodash/_arrayPush.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayPush.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),

/***/ "./node_modules/lodash/_arraySome.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arraySome.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;


/***/ }),

/***/ "./node_modules/lodash/_assignValue.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_assignValue.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),

/***/ "./node_modules/lodash/_assocIndexOf.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_assocIndexOf.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),

/***/ "./node_modules/lodash/_baseAssignValue.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseAssignValue.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js");

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),

/***/ "./node_modules/lodash/_baseCreate.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseCreate.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),

/***/ "./node_modules/lodash/_baseEach.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseEach.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseForOwn = __webpack_require__(/*! ./_baseForOwn */ "./node_modules/lodash/_baseForOwn.js"),
    createBaseEach = __webpack_require__(/*! ./_createBaseEach */ "./node_modules/lodash/_createBaseEach.js");

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;


/***/ }),

/***/ "./node_modules/lodash/_baseFilter.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseFilter.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseEach = __webpack_require__(/*! ./_baseEach */ "./node_modules/lodash/_baseEach.js");

/**
 * The base implementation of `_.filter` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

module.exports = baseFilter;


/***/ }),

/***/ "./node_modules/lodash/_baseFindIndex.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_baseFindIndex.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;


/***/ }),

/***/ "./node_modules/lodash/_baseFor.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseFor.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var createBaseFor = __webpack_require__(/*! ./_createBaseFor */ "./node_modules/lodash/_createBaseFor.js");

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;


/***/ }),

/***/ "./node_modules/lodash/_baseForOwn.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseForOwn.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseFor = __webpack_require__(/*! ./_baseFor */ "./node_modules/lodash/_baseFor.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;


/***/ }),

/***/ "./node_modules/lodash/_baseGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseGet.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;


/***/ }),

/***/ "./node_modules/lodash/_baseGetAllKeys.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_baseGetAllKeys.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),

/***/ "./node_modules/lodash/_baseGetTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "./node_modules/lodash/_baseHasIn.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseHasIn.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;


/***/ }),

/***/ "./node_modules/lodash/_baseIndexOf.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIndexOf.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseFindIndex = __webpack_require__(/*! ./_baseFindIndex */ "./node_modules/lodash/_baseFindIndex.js"),
    baseIsNaN = __webpack_require__(/*! ./_baseIsNaN */ "./node_modules/lodash/_baseIsNaN.js"),
    strictIndexOf = __webpack_require__(/*! ./_strictIndexOf */ "./node_modules/lodash/_strictIndexOf.js");

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

module.exports = baseIndexOf;


/***/ }),

/***/ "./node_modules/lodash/_baseIsArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsArguments.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),

/***/ "./node_modules/lodash/_baseIsEqual.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsEqual.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsEqualDeep = __webpack_require__(/*! ./_baseIsEqualDeep */ "./node_modules/lodash/_baseIsEqualDeep.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;


/***/ }),

/***/ "./node_modules/lodash/_baseIsEqualDeep.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsEqualDeep.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    equalByTag = __webpack_require__(/*! ./_equalByTag */ "./node_modules/lodash/_equalByTag.js"),
    equalObjects = __webpack_require__(/*! ./_equalObjects */ "./node_modules/lodash/_equalObjects.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;


/***/ }),

/***/ "./node_modules/lodash/_baseIsMatch.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsMatch.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;


/***/ }),

/***/ "./node_modules/lodash/_baseIsNaN.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsNaN.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

module.exports = baseIsNaN;


/***/ }),

/***/ "./node_modules/lodash/_baseIsNative.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIsNative.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isMasked = __webpack_require__(/*! ./_isMasked */ "./node_modules/lodash/_isMasked.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ "./node_modules/lodash/_baseIsTypedArray.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_baseIsTypedArray.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),

/***/ "./node_modules/lodash/_baseIteratee.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIteratee.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseMatches = __webpack_require__(/*! ./_baseMatches */ "./node_modules/lodash/_baseMatches.js"),
    baseMatchesProperty = __webpack_require__(/*! ./_baseMatchesProperty */ "./node_modules/lodash/_baseMatchesProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    property = __webpack_require__(/*! ./property */ "./node_modules/lodash/property.js");

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

module.exports = baseIteratee;


/***/ }),

/***/ "./node_modules/lodash/_baseKeys.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseKeys.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeys = __webpack_require__(/*! ./_nativeKeys */ "./node_modules/lodash/_nativeKeys.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),

/***/ "./node_modules/lodash/_baseLodash.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseLodash.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * The function whose prototype chain sequence wrappers inherit from.
 *
 * @private
 */
function baseLodash() {
  // No operation performed.
}

module.exports = baseLodash;


/***/ }),

/***/ "./node_modules/lodash/_baseMatches.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseMatches.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsMatch = __webpack_require__(/*! ./_baseIsMatch */ "./node_modules/lodash/_baseIsMatch.js"),
    getMatchData = __webpack_require__(/*! ./_getMatchData */ "./node_modules/lodash/_getMatchData.js"),
    matchesStrictComparable = __webpack_require__(/*! ./_matchesStrictComparable */ "./node_modules/lodash/_matchesStrictComparable.js");

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;


/***/ }),

/***/ "./node_modules/lodash/_baseMatchesProperty.js":
/*!*****************************************************!*\
  !*** ./node_modules/lodash/_baseMatchesProperty.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js"),
    get = __webpack_require__(/*! ./get */ "./node_modules/lodash/get.js"),
    hasIn = __webpack_require__(/*! ./hasIn */ "./node_modules/lodash/hasIn.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    isStrictComparable = __webpack_require__(/*! ./_isStrictComparable */ "./node_modules/lodash/_isStrictComparable.js"),
    matchesStrictComparable = __webpack_require__(/*! ./_matchesStrictComparable */ "./node_modules/lodash/_matchesStrictComparable.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;


/***/ }),

/***/ "./node_modules/lodash/_baseProperty.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseProperty.js ***!
  \**********************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;


/***/ }),

/***/ "./node_modules/lodash/_basePropertyDeep.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_basePropertyDeep.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js");

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;


/***/ }),

/***/ "./node_modules/lodash/_baseRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseRest.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "./node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js");

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),

/***/ "./node_modules/lodash/_baseSetData.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseSetData.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    metaMap = __webpack_require__(/*! ./_metaMap */ "./node_modules/lodash/_metaMap.js");

/**
 * The base implementation of `setData` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to associate metadata with.
 * @param {*} data The metadata.
 * @returns {Function} Returns `func`.
 */
var baseSetData = !metaMap ? identity : function(func, data) {
  metaMap.set(func, data);
  return func;
};

module.exports = baseSetData;


/***/ }),

/***/ "./node_modules/lodash/_baseSetToString.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseSetToString.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var constant = __webpack_require__(/*! ./constant */ "./node_modules/lodash/constant.js"),
    defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js");

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),

/***/ "./node_modules/lodash/_baseTimes.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseTimes.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),

/***/ "./node_modules/lodash/_baseToString.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseToString.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),

/***/ "./node_modules/lodash/_baseTrim.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseTrim.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var trimmedEndIndex = __webpack_require__(/*! ./_trimmedEndIndex */ "./node_modules/lodash/_trimmedEndIndex.js");

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

module.exports = baseTrim;


/***/ }),

/***/ "./node_modules/lodash/_baseUnary.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnary.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),

/***/ "./node_modules/lodash/_cacheHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_cacheHas.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;


/***/ }),

/***/ "./node_modules/lodash/_castFunction.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_castFunction.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js");

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : identity;
}

module.exports = castFunction;


/***/ }),

/***/ "./node_modules/lodash/_castPath.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_castPath.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    stringToPath = __webpack_require__(/*! ./_stringToPath */ "./node_modules/lodash/_stringToPath.js"),
    toString = __webpack_require__(/*! ./toString */ "./node_modules/lodash/toString.js");

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;


/***/ }),

/***/ "./node_modules/lodash/_composeArgs.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_composeArgs.js ***!
  \*********************************************/
/***/ ((module) => {

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates an array that is the composition of partially applied arguments,
 * placeholders, and provided arguments into a single array of arguments.
 *
 * @private
 * @param {Array} args The provided arguments.
 * @param {Array} partials The arguments to prepend to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @params {boolean} [isCurried] Specify composing for a curried function.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgs(args, partials, holders, isCurried) {
  var argsIndex = -1,
      argsLength = args.length,
      holdersLength = holders.length,
      leftIndex = -1,
      leftLength = partials.length,
      rangeLength = nativeMax(argsLength - holdersLength, 0),
      result = Array(leftLength + rangeLength),
      isUncurried = !isCurried;

  while (++leftIndex < leftLength) {
    result[leftIndex] = partials[leftIndex];
  }
  while (++argsIndex < holdersLength) {
    if (isUncurried || argsIndex < argsLength) {
      result[holders[argsIndex]] = args[argsIndex];
    }
  }
  while (rangeLength--) {
    result[leftIndex++] = args[argsIndex++];
  }
  return result;
}

module.exports = composeArgs;


/***/ }),

/***/ "./node_modules/lodash/_composeArgsRight.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_composeArgsRight.js ***!
  \**************************************************/
/***/ ((module) => {

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * This function is like `composeArgs` except that the arguments composition
 * is tailored for `_.partialRight`.
 *
 * @private
 * @param {Array} args The provided arguments.
 * @param {Array} partials The arguments to append to those provided.
 * @param {Array} holders The `partials` placeholder indexes.
 * @params {boolean} [isCurried] Specify composing for a curried function.
 * @returns {Array} Returns the new array of composed arguments.
 */
function composeArgsRight(args, partials, holders, isCurried) {
  var argsIndex = -1,
      argsLength = args.length,
      holdersIndex = -1,
      holdersLength = holders.length,
      rightIndex = -1,
      rightLength = partials.length,
      rangeLength = nativeMax(argsLength - holdersLength, 0),
      result = Array(rangeLength + rightLength),
      isUncurried = !isCurried;

  while (++argsIndex < rangeLength) {
    result[argsIndex] = args[argsIndex];
  }
  var offset = argsIndex;
  while (++rightIndex < rightLength) {
    result[offset + rightIndex] = partials[rightIndex];
  }
  while (++holdersIndex < holdersLength) {
    if (isUncurried || argsIndex < argsLength) {
      result[offset + holders[holdersIndex]] = args[argsIndex++];
    }
  }
  return result;
}

module.exports = composeArgsRight;


/***/ }),

/***/ "./node_modules/lodash/_copyArray.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_copyArray.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),

/***/ "./node_modules/lodash/_copyObject.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_copyObject.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js");

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),

/***/ "./node_modules/lodash/_coreJsData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_coreJsData.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ "./node_modules/lodash/_countHolders.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_countHolders.js ***!
  \**********************************************/
/***/ ((module) => {

/**
 * Gets the number of `placeholder` occurrences in `array`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} placeholder The placeholder to search for.
 * @returns {number} Returns the placeholder count.
 */
function countHolders(array, placeholder) {
  var length = array.length,
      result = 0;

  while (length--) {
    if (array[length] === placeholder) {
      ++result;
    }
  }
  return result;
}

module.exports = countHolders;


/***/ }),

/***/ "./node_modules/lodash/_createAssigner.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_createAssigner.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseRest = __webpack_require__(/*! ./_baseRest */ "./node_modules/lodash/_baseRest.js"),
    isIterateeCall = __webpack_require__(/*! ./_isIterateeCall */ "./node_modules/lodash/_isIterateeCall.js");

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;


/***/ }),

/***/ "./node_modules/lodash/_createBaseEach.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_createBaseEach.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;


/***/ }),

/***/ "./node_modules/lodash/_createBaseFor.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createBaseFor.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;


/***/ }),

/***/ "./node_modules/lodash/_createBind.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_createBind.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var createCtor = __webpack_require__(/*! ./_createCtor */ "./node_modules/lodash/_createCtor.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1;

/**
 * Creates a function that wraps `func` to invoke it with the optional `this`
 * binding of `thisArg`.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createBind(func, bitmask, thisArg) {
  var isBind = bitmask & WRAP_BIND_FLAG,
      Ctor = createCtor(func);

  function wrapper() {
    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
    return fn.apply(isBind ? thisArg : this, arguments);
  }
  return wrapper;
}

module.exports = createBind;


/***/ }),

/***/ "./node_modules/lodash/_createCtor.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_createCtor.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseCreate = __webpack_require__(/*! ./_baseCreate */ "./node_modules/lodash/_baseCreate.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/**
 * Creates a function that produces an instance of `Ctor` regardless of
 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
 *
 * @private
 * @param {Function} Ctor The constructor to wrap.
 * @returns {Function} Returns the new wrapped function.
 */
function createCtor(Ctor) {
  return function() {
    // Use a `switch` statement to work with class constructors. See
    // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
    // for more details.
    var args = arguments;
    switch (args.length) {
      case 0: return new Ctor;
      case 1: return new Ctor(args[0]);
      case 2: return new Ctor(args[0], args[1]);
      case 3: return new Ctor(args[0], args[1], args[2]);
      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    var thisBinding = baseCreate(Ctor.prototype),
        result = Ctor.apply(thisBinding, args);

    // Mimic the constructor's `return` behavior.
    // See https://es5.github.io/#x13.2.2 for more details.
    return isObject(result) ? result : thisBinding;
  };
}

module.exports = createCtor;


/***/ }),

/***/ "./node_modules/lodash/_createCurry.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_createCurry.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var apply = __webpack_require__(/*! ./_apply */ "./node_modules/lodash/_apply.js"),
    createCtor = __webpack_require__(/*! ./_createCtor */ "./node_modules/lodash/_createCtor.js"),
    createHybrid = __webpack_require__(/*! ./_createHybrid */ "./node_modules/lodash/_createHybrid.js"),
    createRecurry = __webpack_require__(/*! ./_createRecurry */ "./node_modules/lodash/_createRecurry.js"),
    getHolder = __webpack_require__(/*! ./_getHolder */ "./node_modules/lodash/_getHolder.js"),
    replaceHolders = __webpack_require__(/*! ./_replaceHolders */ "./node_modules/lodash/_replaceHolders.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/**
 * Creates a function that wraps `func` to enable currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @param {number} arity The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createCurry(func, bitmask, arity) {
  var Ctor = createCtor(func);

  function wrapper() {
    var length = arguments.length,
        args = Array(length),
        index = length,
        placeholder = getHolder(wrapper);

    while (index--) {
      args[index] = arguments[index];
    }
    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
      ? []
      : replaceHolders(args, placeholder);

    length -= holders.length;
    if (length < arity) {
      return createRecurry(
        func, bitmask, createHybrid, wrapper.placeholder, undefined,
        args, holders, undefined, undefined, arity - length);
    }
    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
    return apply(fn, this, args);
  }
  return wrapper;
}

module.exports = createCurry;


/***/ }),

/***/ "./node_modules/lodash/_createFind.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_createFind.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee(predicate, 3);
      collection = keys(collection);
      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}

module.exports = createFind;


/***/ }),

/***/ "./node_modules/lodash/_createHybrid.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_createHybrid.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var composeArgs = __webpack_require__(/*! ./_composeArgs */ "./node_modules/lodash/_composeArgs.js"),
    composeArgsRight = __webpack_require__(/*! ./_composeArgsRight */ "./node_modules/lodash/_composeArgsRight.js"),
    countHolders = __webpack_require__(/*! ./_countHolders */ "./node_modules/lodash/_countHolders.js"),
    createCtor = __webpack_require__(/*! ./_createCtor */ "./node_modules/lodash/_createCtor.js"),
    createRecurry = __webpack_require__(/*! ./_createRecurry */ "./node_modules/lodash/_createRecurry.js"),
    getHolder = __webpack_require__(/*! ./_getHolder */ "./node_modules/lodash/_getHolder.js"),
    reorder = __webpack_require__(/*! ./_reorder */ "./node_modules/lodash/_reorder.js"),
    replaceHolders = __webpack_require__(/*! ./_replaceHolders */ "./node_modules/lodash/_replaceHolders.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_CURRY_FLAG = 8,
    WRAP_CURRY_RIGHT_FLAG = 16,
    WRAP_ARY_FLAG = 128,
    WRAP_FLIP_FLAG = 512;

/**
 * Creates a function that wraps `func` to invoke it with optional `this`
 * binding of `thisArg`, partial application, and currying.
 *
 * @private
 * @param {Function|string} func The function or method name to wrap.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to
 *  the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [partialsRight] The arguments to append to those provided
 *  to the new function.
 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
  var isAry = bitmask & WRAP_ARY_FLAG,
      isBind = bitmask & WRAP_BIND_FLAG,
      isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
      isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
      isFlip = bitmask & WRAP_FLIP_FLAG,
      Ctor = isBindKey ? undefined : createCtor(func);

  function wrapper() {
    var length = arguments.length,
        args = Array(length),
        index = length;

    while (index--) {
      args[index] = arguments[index];
    }
    if (isCurried) {
      var placeholder = getHolder(wrapper),
          holdersCount = countHolders(args, placeholder);
    }
    if (partials) {
      args = composeArgs(args, partials, holders, isCurried);
    }
    if (partialsRight) {
      args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
    }
    length -= holdersCount;
    if (isCurried && length < arity) {
      var newHolders = replaceHolders(args, placeholder);
      return createRecurry(
        func, bitmask, createHybrid, wrapper.placeholder, thisArg,
        args, newHolders, argPos, ary, arity - length
      );
    }
    var thisBinding = isBind ? thisArg : this,
        fn = isBindKey ? thisBinding[func] : func;

    length = args.length;
    if (argPos) {
      args = reorder(args, argPos);
    } else if (isFlip && length > 1) {
      args.reverse();
    }
    if (isAry && ary < length) {
      args.length = ary;
    }
    if (this && this !== root && this instanceof wrapper) {
      fn = Ctor || createCtor(fn);
    }
    return fn.apply(thisBinding, args);
  }
  return wrapper;
}

module.exports = createHybrid;


/***/ }),

/***/ "./node_modules/lodash/_createPartial.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createPartial.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var apply = __webpack_require__(/*! ./_apply */ "./node_modules/lodash/_apply.js"),
    createCtor = __webpack_require__(/*! ./_createCtor */ "./node_modules/lodash/_createCtor.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1;

/**
 * Creates a function that wraps `func` to invoke it with the `this` binding
 * of `thisArg` and `partials` prepended to the arguments it receives.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} partials The arguments to prepend to those provided to
 *  the new function.
 * @returns {Function} Returns the new wrapped function.
 */
function createPartial(func, bitmask, thisArg, partials) {
  var isBind = bitmask & WRAP_BIND_FLAG,
      Ctor = createCtor(func);

  function wrapper() {
    var argsIndex = -1,
        argsLength = arguments.length,
        leftIndex = -1,
        leftLength = partials.length,
        args = Array(leftLength + argsLength),
        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

    while (++leftIndex < leftLength) {
      args[leftIndex] = partials[leftIndex];
    }
    while (argsLength--) {
      args[leftIndex++] = arguments[++argsIndex];
    }
    return apply(fn, isBind ? thisArg : this, args);
  }
  return wrapper;
}

module.exports = createPartial;


/***/ }),

/***/ "./node_modules/lodash/_createRecurry.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createRecurry.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isLaziable = __webpack_require__(/*! ./_isLaziable */ "./node_modules/lodash/_isLaziable.js"),
    setData = __webpack_require__(/*! ./_setData */ "./node_modules/lodash/_setData.js"),
    setWrapToString = __webpack_require__(/*! ./_setWrapToString */ "./node_modules/lodash/_setWrapToString.js");

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_CURRY_BOUND_FLAG = 4,
    WRAP_CURRY_FLAG = 8,
    WRAP_PARTIAL_FLAG = 32,
    WRAP_PARTIAL_RIGHT_FLAG = 64;

/**
 * Creates a function that wraps `func` to continue currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @param {Function} wrapFunc The function to create the `func` wrapper.
 * @param {*} placeholder The placeholder value.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to prepend to those provided to
 *  the new function.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
  var isCurry = bitmask & WRAP_CURRY_FLAG,
      newHolders = isCurry ? holders : undefined,
      newHoldersRight = isCurry ? undefined : holders,
      newPartials = isCurry ? partials : undefined,
      newPartialsRight = isCurry ? undefined : partials;

  bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
  bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

  if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
    bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
  }
  var newData = [
    func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
    newHoldersRight, argPos, ary, arity
  ];

  var result = wrapFunc.apply(undefined, newData);
  if (isLaziable(func)) {
    setData(result, newData);
  }
  result.placeholder = placeholder;
  return setWrapToString(result, func, bitmask);
}

module.exports = createRecurry;


/***/ }),

/***/ "./node_modules/lodash/_createWrap.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_createWrap.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseSetData = __webpack_require__(/*! ./_baseSetData */ "./node_modules/lodash/_baseSetData.js"),
    createBind = __webpack_require__(/*! ./_createBind */ "./node_modules/lodash/_createBind.js"),
    createCurry = __webpack_require__(/*! ./_createCurry */ "./node_modules/lodash/_createCurry.js"),
    createHybrid = __webpack_require__(/*! ./_createHybrid */ "./node_modules/lodash/_createHybrid.js"),
    createPartial = __webpack_require__(/*! ./_createPartial */ "./node_modules/lodash/_createPartial.js"),
    getData = __webpack_require__(/*! ./_getData */ "./node_modules/lodash/_getData.js"),
    mergeData = __webpack_require__(/*! ./_mergeData */ "./node_modules/lodash/_mergeData.js"),
    setData = __webpack_require__(/*! ./_setData */ "./node_modules/lodash/_setData.js"),
    setWrapToString = __webpack_require__(/*! ./_setWrapToString */ "./node_modules/lodash/_setWrapToString.js"),
    toInteger = __webpack_require__(/*! ./toInteger */ "./node_modules/lodash/toInteger.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_CURRY_FLAG = 8,
    WRAP_CURRY_RIGHT_FLAG = 16,
    WRAP_PARTIAL_FLAG = 32,
    WRAP_PARTIAL_RIGHT_FLAG = 64;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that either curries or invokes `func` with optional
 * `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to wrap.
 * @param {number} bitmask The bitmask flags.
 *    1 - `_.bind`
 *    2 - `_.bindKey`
 *    4 - `_.curry` or `_.curryRight` of a bound function
 *    8 - `_.curry`
 *   16 - `_.curryRight`
 *   32 - `_.partial`
 *   64 - `_.partialRight`
 *  128 - `_.rearg`
 *  256 - `_.ary`
 *  512 - `_.flip`
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {Array} [partials] The arguments to be partially applied.
 * @param {Array} [holders] The `partials` placeholder indexes.
 * @param {Array} [argPos] The argument positions of the new function.
 * @param {number} [ary] The arity cap of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
  var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
  if (!isBindKey && typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var length = partials ? partials.length : 0;
  if (!length) {
    bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
    partials = holders = undefined;
  }
  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
  arity = arity === undefined ? arity : toInteger(arity);
  length -= holders ? holders.length : 0;

  if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
    var partialsRight = partials,
        holdersRight = holders;

    partials = holders = undefined;
  }
  var data = isBindKey ? undefined : getData(func);

  var newData = [
    func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
    argPos, ary, arity
  ];

  if (data) {
    mergeData(newData, data);
  }
  func = newData[0];
  bitmask = newData[1];
  thisArg = newData[2];
  partials = newData[3];
  holders = newData[4];
  arity = newData[9] = newData[9] === undefined
    ? (isBindKey ? 0 : func.length)
    : nativeMax(newData[9] - length, 0);

  if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
    bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
  }
  if (!bitmask || bitmask == WRAP_BIND_FLAG) {
    var result = createBind(func, bitmask, thisArg);
  } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
    result = createCurry(func, bitmask, arity);
  } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
    result = createPartial(func, bitmask, thisArg, partials);
  } else {
    result = createHybrid.apply(undefined, newData);
  }
  var setter = data ? baseSetData : setData;
  return setWrapToString(setter(result, newData), func, bitmask);
}

module.exports = createWrap;


/***/ }),

/***/ "./node_modules/lodash/_defineProperty.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_defineProperty.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),

/***/ "./node_modules/lodash/_equalArrays.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_equalArrays.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var SetCache = __webpack_require__(/*! ./_SetCache */ "./node_modules/lodash/_SetCache.js"),
    arraySome = __webpack_require__(/*! ./_arraySome */ "./node_modules/lodash/_arraySome.js"),
    cacheHas = __webpack_require__(/*! ./_cacheHas */ "./node_modules/lodash/_cacheHas.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Check that cyclic values are equal.
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;


/***/ }),

/***/ "./node_modules/lodash/_equalByTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_equalByTag.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    mapToArray = __webpack_require__(/*! ./_mapToArray */ "./node_modules/lodash/_mapToArray.js"),
    setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;


/***/ }),

/***/ "./node_modules/lodash/_equalObjects.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_equalObjects.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;


/***/ }),

/***/ "./node_modules/lodash/_freeGlobal.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

module.exports = freeGlobal;


/***/ }),

/***/ "./node_modules/lodash/_getAllKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getAllKeys.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),

/***/ "./node_modules/lodash/_getData.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_getData.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var metaMap = __webpack_require__(/*! ./_metaMap */ "./node_modules/lodash/_metaMap.js"),
    noop = __webpack_require__(/*! ./noop */ "./node_modules/lodash/noop.js");

/**
 * Gets metadata for `func`.
 *
 * @private
 * @param {Function} func The function to query.
 * @returns {*} Returns the metadata for `func`.
 */
var getData = !metaMap ? noop : function(func) {
  return metaMap.get(func);
};

module.exports = getData;


/***/ }),

/***/ "./node_modules/lodash/_getFuncName.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_getFuncName.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var realNames = __webpack_require__(/*! ./_realNames */ "./node_modules/lodash/_realNames.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the name of `func`.
 *
 * @private
 * @param {Function} func The function to query.
 * @returns {string} Returns the function name.
 */
function getFuncName(func) {
  var result = (func.name + ''),
      array = realNames[result],
      length = hasOwnProperty.call(realNames, result) ? array.length : 0;

  while (length--) {
    var data = array[length],
        otherFunc = data.func;
    if (otherFunc == null || otherFunc == func) {
      return data.name;
    }
  }
  return result;
}

module.exports = getFuncName;


/***/ }),

/***/ "./node_modules/lodash/_getHolder.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getHolder.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Gets the argument placeholder value for `func`.
 *
 * @private
 * @param {Function} func The function to inspect.
 * @returns {*} Returns the placeholder value.
 */
function getHolder(func) {
  var object = func;
  return object.placeholder;
}

module.exports = getHolder;


/***/ }),

/***/ "./node_modules/lodash/_getMapData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getMapData.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isKeyable = __webpack_require__(/*! ./_isKeyable */ "./node_modules/lodash/_isKeyable.js");

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),

/***/ "./node_modules/lodash/_getMatchData.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getMatchData.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isStrictComparable = __webpack_require__(/*! ./_isStrictComparable */ "./node_modules/lodash/_isStrictComparable.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

module.exports = getMatchData;


/***/ }),

/***/ "./node_modules/lodash/_getNative.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getNative.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "./node_modules/lodash/_baseIsNative.js"),
    getValue = __webpack_require__(/*! ./_getValue */ "./node_modules/lodash/_getValue.js");

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ "./node_modules/lodash/_getRawTag.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "./node_modules/lodash/_getSymbols.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getSymbols.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayFilter = __webpack_require__(/*! ./_arrayFilter */ "./node_modules/lodash/_arrayFilter.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),

/***/ "./node_modules/lodash/_getTag.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_getTag.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DataView = __webpack_require__(/*! ./_DataView */ "./node_modules/lodash/_DataView.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    Promise = __webpack_require__(/*! ./_Promise */ "./node_modules/lodash/_Promise.js"),
    Set = __webpack_require__(/*! ./_Set */ "./node_modules/lodash/_Set.js"),
    WeakMap = __webpack_require__(/*! ./_WeakMap */ "./node_modules/lodash/_WeakMap.js"),
    baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),

/***/ "./node_modules/lodash/_getValue.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_getValue.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ "./node_modules/lodash/_getWrapDetails.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_getWrapDetails.js ***!
  \************************************************/
/***/ ((module) => {

/** Used to match wrap detail comments. */
var reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
    reSplitDetails = /,? & /;

/**
 * Extracts wrapper details from the `source` body comment.
 *
 * @private
 * @param {string} source The source to inspect.
 * @returns {Array} Returns the wrapper details.
 */
function getWrapDetails(source) {
  var match = source.match(reWrapDetails);
  return match ? match[1].split(reSplitDetails) : [];
}

module.exports = getWrapDetails;


/***/ }),

/***/ "./node_modules/lodash/_hasPath.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hasPath.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

module.exports = hasPath;


/***/ }),

/***/ "./node_modules/lodash/_hashClear.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_hashClear.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),

/***/ "./node_modules/lodash/_hashDelete.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_hashDelete.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),

/***/ "./node_modules/lodash/_hashGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashGet.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),

/***/ "./node_modules/lodash/_hashHas.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashHas.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),

/***/ "./node_modules/lodash/_hashSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashSet.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),

/***/ "./node_modules/lodash/_insertWrapDetails.js":
/*!***************************************************!*\
  !*** ./node_modules/lodash/_insertWrapDetails.js ***!
  \***************************************************/
/***/ ((module) => {

/** Used to match wrap detail comments. */
var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/;

/**
 * Inserts wrapper `details` in a comment at the top of the `source` body.
 *
 * @private
 * @param {string} source The source to modify.
 * @returns {Array} details The details to insert.
 * @returns {string} Returns the modified source.
 */
function insertWrapDetails(source, details) {
  var length = details.length;
  if (!length) {
    return source;
  }
  var lastIndex = length - 1;
  details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
  details = details.join(length > 2 ? ', ' : ' ');
  return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
}

module.exports = insertWrapDetails;


/***/ }),

/***/ "./node_modules/lodash/_isIndex.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_isIndex.js ***!
  \*****************************************/
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),

/***/ "./node_modules/lodash/_isIterateeCall.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_isIterateeCall.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),

/***/ "./node_modules/lodash/_isKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_isKey.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;


/***/ }),

/***/ "./node_modules/lodash/_isKeyable.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_isKeyable.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),

/***/ "./node_modules/lodash/_isLaziable.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_isLaziable.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var LazyWrapper = __webpack_require__(/*! ./_LazyWrapper */ "./node_modules/lodash/_LazyWrapper.js"),
    getData = __webpack_require__(/*! ./_getData */ "./node_modules/lodash/_getData.js"),
    getFuncName = __webpack_require__(/*! ./_getFuncName */ "./node_modules/lodash/_getFuncName.js"),
    lodash = __webpack_require__(/*! ./wrapperLodash */ "./node_modules/lodash/wrapperLodash.js");

/**
 * Checks if `func` has a lazy counterpart.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
 *  else `false`.
 */
function isLaziable(func) {
  var funcName = getFuncName(func),
      other = lodash[funcName];

  if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
    return false;
  }
  if (func === other) {
    return true;
  }
  var data = getData(other);
  return !!data && func === data[0];
}

module.exports = isLaziable;


/***/ }),

/***/ "./node_modules/lodash/_isMasked.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_isMasked.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var coreJsData = __webpack_require__(/*! ./_coreJsData */ "./node_modules/lodash/_coreJsData.js");

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ "./node_modules/lodash/_isPrototype.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_isPrototype.js ***!
  \*********************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),

/***/ "./node_modules/lodash/_isStrictComparable.js":
/*!****************************************************!*\
  !*** ./node_modules/lodash/_isStrictComparable.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;


/***/ }),

/***/ "./node_modules/lodash/_listCacheClear.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_listCacheClear.js ***!
  \************************************************/
/***/ ((module) => {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_listCacheDelete.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_listCacheDelete.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_listCacheGet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheGet.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_listCacheHas.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheHas.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_listCacheSet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheSet.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheClear.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_mapCacheClear.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Hash = __webpack_require__(/*! ./_Hash */ "./node_modules/lodash/_Hash.js"),
    ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js");

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheDelete.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_mapCacheDelete.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheGet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheGet.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheHas.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheSet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheSet.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_mapToArray.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;


/***/ }),

/***/ "./node_modules/lodash/_matchesStrictComparable.js":
/*!*********************************************************!*\
  !*** ./node_modules/lodash/_matchesStrictComparable.js ***!
  \*********************************************************/
/***/ ((module) => {

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

module.exports = matchesStrictComparable;


/***/ }),

/***/ "./node_modules/lodash/_memoizeCapped.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_memoizeCapped.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var memoize = __webpack_require__(/*! ./memoize */ "./node_modules/lodash/memoize.js");

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;


/***/ }),

/***/ "./node_modules/lodash/_mergeData.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_mergeData.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var composeArgs = __webpack_require__(/*! ./_composeArgs */ "./node_modules/lodash/_composeArgs.js"),
    composeArgsRight = __webpack_require__(/*! ./_composeArgsRight */ "./node_modules/lodash/_composeArgsRight.js"),
    replaceHolders = __webpack_require__(/*! ./_replaceHolders */ "./node_modules/lodash/_replaceHolders.js");

/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_CURRY_BOUND_FLAG = 4,
    WRAP_CURRY_FLAG = 8,
    WRAP_ARY_FLAG = 128,
    WRAP_REARG_FLAG = 256;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin = Math.min;

/**
 * Merges the function metadata of `source` into `data`.
 *
 * Merging metadata reduces the number of wrappers used to invoke a function.
 * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
 * may be applied regardless of execution order. Methods like `_.ary` and
 * `_.rearg` modify function arguments, making the order in which they are
 * executed important, preventing the merging of metadata. However, we make
 * an exception for a safe combined case where curried functions have `_.ary`
 * and or `_.rearg` applied.
 *
 * @private
 * @param {Array} data The destination metadata.
 * @param {Array} source The source metadata.
 * @returns {Array} Returns `data`.
 */
function mergeData(data, source) {
  var bitmask = data[1],
      srcBitmask = source[1],
      newBitmask = bitmask | srcBitmask,
      isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);

  var isCombo =
    ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
    ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
    ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));

  // Exit early if metadata can't be merged.
  if (!(isCommon || isCombo)) {
    return data;
  }
  // Use source `thisArg` if available.
  if (srcBitmask & WRAP_BIND_FLAG) {
    data[2] = source[2];
    // Set when currying a bound function.
    newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
  }
  // Compose partial arguments.
  var value = source[3];
  if (value) {
    var partials = data[3];
    data[3] = partials ? composeArgs(partials, value, source[4]) : value;
    data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
  }
  // Compose partial right arguments.
  value = source[5];
  if (value) {
    partials = data[5];
    data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
    data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
  }
  // Use source `argPos` if available.
  value = source[7];
  if (value) {
    data[7] = value;
  }
  // Use source `ary` if it's smaller.
  if (srcBitmask & WRAP_ARY_FLAG) {
    data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
  }
  // Use source `arity` if one is not provided.
  if (data[9] == null) {
    data[9] = source[9];
  }
  // Use source `func` and merge bitmasks.
  data[0] = source[0];
  data[1] = newBitmask;

  return data;
}

module.exports = mergeData;


/***/ }),

/***/ "./node_modules/lodash/_metaMap.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_metaMap.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var WeakMap = __webpack_require__(/*! ./_WeakMap */ "./node_modules/lodash/_WeakMap.js");

/** Used to store function metadata. */
var metaMap = WeakMap && new WeakMap;

module.exports = metaMap;


/***/ }),

/***/ "./node_modules/lodash/_nativeCreate.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeCreate.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),

/***/ "./node_modules/lodash/_nativeKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_nativeKeys.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),

/***/ "./node_modules/lodash/_nodeUtil.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_nodeUtil.js ***!
  \******************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;


/***/ }),

/***/ "./node_modules/lodash/_objectToString.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "./node_modules/lodash/_overArg.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_overArg.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),

/***/ "./node_modules/lodash/_overRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_overRest.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var apply = __webpack_require__(/*! ./_apply */ "./node_modules/lodash/_apply.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),

/***/ "./node_modules/lodash/_realNames.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_realNames.js ***!
  \*******************************************/
/***/ ((module) => {

/** Used to lookup unminified function names. */
var realNames = {};

module.exports = realNames;


/***/ }),

/***/ "./node_modules/lodash/_reorder.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_reorder.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin = Math.min;

/**
 * Reorder `array` according to the specified indexes where the element at
 * the first index is assigned as the first element, the element at
 * the second index is assigned as the second element, and so on.
 *
 * @private
 * @param {Array} array The array to reorder.
 * @param {Array} indexes The arranged array indexes.
 * @returns {Array} Returns `array`.
 */
function reorder(array, indexes) {
  var arrLength = array.length,
      length = nativeMin(indexes.length, arrLength),
      oldArray = copyArray(array);

  while (length--) {
    var index = indexes[length];
    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
  }
  return array;
}

module.exports = reorder;


/***/ }),

/***/ "./node_modules/lodash/_replaceHolders.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_replaceHolders.js ***!
  \************************************************/
/***/ ((module) => {

/** Used as the internal argument placeholder. */
var PLACEHOLDER = '__lodash_placeholder__';

/**
 * Replaces all `placeholder` elements in `array` with an internal placeholder
 * and returns an array of their indexes.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {*} placeholder The placeholder to replace.
 * @returns {Array} Returns the new array of placeholder indexes.
 */
function replaceHolders(array, placeholder) {
  var index = -1,
      length = array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (value === placeholder || value === PLACEHOLDER) {
      array[index] = PLACEHOLDER;
      result[resIndex++] = index;
    }
  }
  return result;
}

module.exports = replaceHolders;


/***/ }),

/***/ "./node_modules/lodash/_root.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "./node_modules/lodash/_setCacheAdd.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheAdd.js ***!
  \*********************************************/
/***/ ((module) => {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;


/***/ }),

/***/ "./node_modules/lodash/_setCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheHas.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_setData.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_setData.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseSetData = __webpack_require__(/*! ./_baseSetData */ "./node_modules/lodash/_baseSetData.js"),
    shortOut = __webpack_require__(/*! ./_shortOut */ "./node_modules/lodash/_shortOut.js");

/**
 * Sets metadata for `func`.
 *
 * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
 * period of time, it will trip its breaker and transition to an identity
 * function to avoid garbage collection pauses in V8. See
 * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
 * for more details.
 *
 * @private
 * @param {Function} func The function to associate metadata with.
 * @param {*} data The metadata.
 * @returns {Function} Returns `func`.
 */
var setData = shortOut(baseSetData);

module.exports = setData;


/***/ }),

/***/ "./node_modules/lodash/_setToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_setToArray.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),

/***/ "./node_modules/lodash/_setToString.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setToString.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseSetToString = __webpack_require__(/*! ./_baseSetToString */ "./node_modules/lodash/_baseSetToString.js"),
    shortOut = __webpack_require__(/*! ./_shortOut */ "./node_modules/lodash/_shortOut.js");

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),

/***/ "./node_modules/lodash/_setWrapToString.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_setWrapToString.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getWrapDetails = __webpack_require__(/*! ./_getWrapDetails */ "./node_modules/lodash/_getWrapDetails.js"),
    insertWrapDetails = __webpack_require__(/*! ./_insertWrapDetails */ "./node_modules/lodash/_insertWrapDetails.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js"),
    updateWrapDetails = __webpack_require__(/*! ./_updateWrapDetails */ "./node_modules/lodash/_updateWrapDetails.js");

/**
 * Sets the `toString` method of `wrapper` to mimic the source of `reference`
 * with wrapper details in a comment at the top of the source body.
 *
 * @private
 * @param {Function} wrapper The function to modify.
 * @param {Function} reference The reference function.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @returns {Function} Returns `wrapper`.
 */
function setWrapToString(wrapper, reference, bitmask) {
  var source = (reference + '');
  return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
}

module.exports = setWrapToString;


/***/ }),

/***/ "./node_modules/lodash/_shortOut.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_shortOut.js ***!
  \******************************************/
/***/ ((module) => {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),

/***/ "./node_modules/lodash/_stackClear.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_stackClear.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js");

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),

/***/ "./node_modules/lodash/_stackDelete.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_stackDelete.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),

/***/ "./node_modules/lodash/_stackGet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackGet.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),

/***/ "./node_modules/lodash/_stackHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackHas.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),

/***/ "./node_modules/lodash/_stackSet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackSet.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),

/***/ "./node_modules/lodash/_strictIndexOf.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_strictIndexOf.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = strictIndexOf;


/***/ }),

/***/ "./node_modules/lodash/_stringToPath.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_stringToPath.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var memoizeCapped = __webpack_require__(/*! ./_memoizeCapped */ "./node_modules/lodash/_memoizeCapped.js");

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;


/***/ }),

/***/ "./node_modules/lodash/_toKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_toKey.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;


/***/ }),

/***/ "./node_modules/lodash/_toSource.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_toSource.js ***!
  \******************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ "./node_modules/lodash/_trimmedEndIndex.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_trimmedEndIndex.js ***!
  \*************************************************/
/***/ ((module) => {

/** Used to match a single whitespace character. */
var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

module.exports = trimmedEndIndex;


/***/ }),

/***/ "./node_modules/lodash/_updateWrapDetails.js":
/*!***************************************************!*\
  !*** ./node_modules/lodash/_updateWrapDetails.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayEach = __webpack_require__(/*! ./_arrayEach */ "./node_modules/lodash/_arrayEach.js"),
    arrayIncludes = __webpack_require__(/*! ./_arrayIncludes */ "./node_modules/lodash/_arrayIncludes.js");

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_CURRY_FLAG = 8,
    WRAP_CURRY_RIGHT_FLAG = 16,
    WRAP_PARTIAL_FLAG = 32,
    WRAP_PARTIAL_RIGHT_FLAG = 64,
    WRAP_ARY_FLAG = 128,
    WRAP_REARG_FLAG = 256,
    WRAP_FLIP_FLAG = 512;

/** Used to associate wrap methods with their bit flags. */
var wrapFlags = [
  ['ary', WRAP_ARY_FLAG],
  ['bind', WRAP_BIND_FLAG],
  ['bindKey', WRAP_BIND_KEY_FLAG],
  ['curry', WRAP_CURRY_FLAG],
  ['curryRight', WRAP_CURRY_RIGHT_FLAG],
  ['flip', WRAP_FLIP_FLAG],
  ['partial', WRAP_PARTIAL_FLAG],
  ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
  ['rearg', WRAP_REARG_FLAG]
];

/**
 * Updates wrapper `details` based on `bitmask` flags.
 *
 * @private
 * @returns {Array} details The details to modify.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @returns {Array} Returns `details`.
 */
function updateWrapDetails(details, bitmask) {
  arrayEach(wrapFlags, function(pair) {
    var value = '_.' + pair[0];
    if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
      details.push(value);
    }
  });
  return details.sort();
}

module.exports = updateWrapDetails;


/***/ }),

/***/ "./node_modules/lodash/_wrapperClone.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_wrapperClone.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var LazyWrapper = __webpack_require__(/*! ./_LazyWrapper */ "./node_modules/lodash/_LazyWrapper.js"),
    LodashWrapper = __webpack_require__(/*! ./_LodashWrapper */ "./node_modules/lodash/_LodashWrapper.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js");

/**
 * Creates a clone of `wrapper`.
 *
 * @private
 * @param {Object} wrapper The wrapper to clone.
 * @returns {Object} Returns the cloned wrapper.
 */
function wrapperClone(wrapper) {
  if (wrapper instanceof LazyWrapper) {
    return wrapper.clone();
  }
  var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
  result.__actions__ = copyArray(wrapper.__actions__);
  result.__index__  = wrapper.__index__;
  result.__values__ = wrapper.__values__;
  return result;
}

module.exports = wrapperClone;


/***/ }),

/***/ "./node_modules/lodash/assign.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/assign.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    createAssigner = __webpack_require__(/*! ./_createAssigner */ "./node_modules/lodash/_createAssigner.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

module.exports = assign;


/***/ }),

/***/ "./node_modules/lodash/bind.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/bind.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseRest = __webpack_require__(/*! ./_baseRest */ "./node_modules/lodash/_baseRest.js"),
    createWrap = __webpack_require__(/*! ./_createWrap */ "./node_modules/lodash/_createWrap.js"),
    getHolder = __webpack_require__(/*! ./_getHolder */ "./node_modules/lodash/_getHolder.js"),
    replaceHolders = __webpack_require__(/*! ./_replaceHolders */ "./node_modules/lodash/_replaceHolders.js");

/** Used to compose bitmasks for function metadata. */
var WRAP_BIND_FLAG = 1,
    WRAP_PARTIAL_FLAG = 32;

/**
 * Creates a function that invokes `func` with the `this` binding of `thisArg`
 * and `partials` prepended to the arguments it receives.
 *
 * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
 * may be used as a placeholder for partially applied arguments.
 *
 * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
 * property of bound functions.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {...*} [partials] The arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * function greet(greeting, punctuation) {
 *   return greeting + ' ' + this.user + punctuation;
 * }
 *
 * var object = { 'user': 'fred' };
 *
 * var bound = _.bind(greet, object, 'hi');
 * bound('!');
 * // => 'hi fred!'
 *
 * // Bound with placeholders.
 * var bound = _.bind(greet, object, _, '!');
 * bound('hi');
 * // => 'hi fred!'
 */
var bind = baseRest(function(func, thisArg, partials) {
  var bitmask = WRAP_BIND_FLAG;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bind));
    bitmask |= WRAP_PARTIAL_FLAG;
  }
  return createWrap(func, bitmask, thisArg, partials, holders);
});

// Assign default placeholders.
bind.placeholder = {};

module.exports = bind;


/***/ }),

/***/ "./node_modules/lodash/constant.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/constant.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),

/***/ "./node_modules/lodash/eq.js":
/*!***********************************!*\
  !*** ./node_modules/lodash/eq.js ***!
  \***********************************/
/***/ ((module) => {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ "./node_modules/lodash/filter.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/filter.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayFilter = __webpack_require__(/*! ./_arrayFilter */ "./node_modules/lodash/_arrayFilter.js"),
    baseFilter = __webpack_require__(/*! ./_baseFilter */ "./node_modules/lodash/_baseFilter.js"),
    baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");

/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * **Note:** Unlike `_.remove`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see _.reject
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * _.filter(users, function(o) { return !o.active; });
 * // => objects for ['fred']
 *
 * // The `_.matches` iteratee shorthand.
 * _.filter(users, { 'age': 36, 'active': true });
 * // => objects for ['barney']
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.filter(users, ['active', false]);
 * // => objects for ['fred']
 *
 * // The `_.property` iteratee shorthand.
 * _.filter(users, 'active');
 * // => objects for ['barney']
 *
 * // Combining several predicates using `_.overEvery` or `_.overSome`.
 * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
 * // => objects for ['fred', 'barney']
 */
function filter(collection, predicate) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  return func(collection, baseIteratee(predicate, 3));
}

module.exports = filter;


/***/ }),

/***/ "./node_modules/lodash/find.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/find.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var createFind = __webpack_require__(/*! ./_createFind */ "./node_modules/lodash/_createFind.js"),
    findIndex = __webpack_require__(/*! ./findIndex */ "./node_modules/lodash/findIndex.js");

/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */
var find = createFind(findIndex);

module.exports = find;


/***/ }),

/***/ "./node_modules/lodash/findIndex.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/findIndex.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseFindIndex = __webpack_require__(/*! ./_baseFindIndex */ "./node_modules/lodash/_baseFindIndex.js"),
    baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    toInteger = __webpack_require__(/*! ./toInteger */ "./node_modules/lodash/toInteger.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return baseFindIndex(array, baseIteratee(predicate, 3), index);
}

module.exports = findIndex;


/***/ }),

/***/ "./node_modules/lodash/forEach.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/forEach.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayEach = __webpack_require__(/*! ./_arrayEach */ "./node_modules/lodash/_arrayEach.js"),
    baseEach = __webpack_require__(/*! ./_baseEach */ "./node_modules/lodash/_baseEach.js"),
    castFunction = __webpack_require__(/*! ./_castFunction */ "./node_modules/lodash/_castFunction.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray(collection) ? arrayEach : baseEach;
  return func(collection, castFunction(iteratee));
}

module.exports = forEach;


/***/ }),

/***/ "./node_modules/lodash/get.js":
/*!************************************!*\
  !*** ./node_modules/lodash/get.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js");

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;


/***/ }),

/***/ "./node_modules/lodash/hasIn.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/hasIn.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseHasIn = __webpack_require__(/*! ./_baseHasIn */ "./node_modules/lodash/_baseHasIn.js"),
    hasPath = __webpack_require__(/*! ./_hasPath */ "./node_modules/lodash/_hasPath.js");

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;


/***/ }),

/***/ "./node_modules/lodash/identity.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/identity.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),

/***/ "./node_modules/lodash/isArguments.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArguments.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsArguments = __webpack_require__(/*! ./_baseIsArguments */ "./node_modules/lodash/_baseIsArguments.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),

/***/ "./node_modules/lodash/isArray.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/***/ ((module) => {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "./node_modules/lodash/isArrayLike.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArrayLike.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js");

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),

/***/ "./node_modules/lodash/isBuffer.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isBuffer.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js"),
    stubFalse = __webpack_require__(/*! ./stubFalse */ "./node_modules/lodash/stubFalse.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;


/***/ }),

/***/ "./node_modules/lodash/isFunction.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ "./node_modules/lodash/isLength.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isLength.js ***!
  \*****************************************/
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),

/***/ "./node_modules/lodash/isObject.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "./node_modules/lodash/isObjectLike.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/***/ ((module) => {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "./node_modules/lodash/isSymbol.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isSymbol.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),

/***/ "./node_modules/lodash/isTypedArray.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isTypedArray.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsTypedArray = __webpack_require__(/*! ./_baseIsTypedArray */ "./node_modules/lodash/_baseIsTypedArray.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),

/***/ "./node_modules/lodash/keys.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/keys.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeys = __webpack_require__(/*! ./_baseKeys */ "./node_modules/lodash/_baseKeys.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),

/***/ "./node_modules/lodash/memoize.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/memoize.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;


/***/ }),

/***/ "./node_modules/lodash/noop.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/noop.js ***!
  \*************************************/
/***/ ((module) => {

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;


/***/ }),

/***/ "./node_modules/lodash/property.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/property.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseProperty = __webpack_require__(/*! ./_baseProperty */ "./node_modules/lodash/_baseProperty.js"),
    basePropertyDeep = __webpack_require__(/*! ./_basePropertyDeep */ "./node_modules/lodash/_basePropertyDeep.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;


/***/ }),

/***/ "./node_modules/lodash/stubArray.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubArray.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),

/***/ "./node_modules/lodash/stubFalse.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubFalse.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),

/***/ "./node_modules/lodash/toFinite.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toFinite.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toNumber = __webpack_require__(/*! ./toNumber */ "./node_modules/lodash/toNumber.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

module.exports = toFinite;


/***/ }),

/***/ "./node_modules/lodash/toInteger.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/toInteger.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toFinite = __webpack_require__(/*! ./toFinite */ "./node_modules/lodash/toFinite.js");

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

module.exports = toInteger;


/***/ }),

/***/ "./node_modules/lodash/toNumber.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toNumber.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseTrim = __webpack_require__(/*! ./_baseTrim */ "./node_modules/lodash/_baseTrim.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;


/***/ }),

/***/ "./node_modules/lodash/toString.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toString.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseToString = __webpack_require__(/*! ./_baseToString */ "./node_modules/lodash/_baseToString.js");

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ }),

/***/ "./node_modules/lodash/wrapperLodash.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/wrapperLodash.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var LazyWrapper = __webpack_require__(/*! ./_LazyWrapper */ "./node_modules/lodash/_LazyWrapper.js"),
    LodashWrapper = __webpack_require__(/*! ./_LodashWrapper */ "./node_modules/lodash/_LodashWrapper.js"),
    baseLodash = __webpack_require__(/*! ./_baseLodash */ "./node_modules/lodash/_baseLodash.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js"),
    wrapperClone = __webpack_require__(/*! ./_wrapperClone */ "./node_modules/lodash/_wrapperClone.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates a `lodash` object which wraps `value` to enable implicit method
 * chain sequences. Methods that operate on and return arrays, collections,
 * and functions can be chained together. Methods that retrieve a single value
 * or may return a primitive value will automatically end the chain sequence
 * and return the unwrapped value. Otherwise, the value must be unwrapped
 * with `_#value`.
 *
 * Explicit chain sequences, which must be unwrapped with `_#value`, may be
 * enabled using `_.chain`.
 *
 * The execution of chained methods is lazy, that is, it's deferred until
 * `_#value` is implicitly or explicitly called.
 *
 * Lazy evaluation allows several methods to support shortcut fusion.
 * Shortcut fusion is an optimization to merge iteratee calls; this avoids
 * the creation of intermediate arrays and can greatly reduce the number of
 * iteratee executions. Sections of a chain sequence qualify for shortcut
 * fusion if the section is applied to an array and iteratees accept only
 * one argument. The heuristic for whether a section qualifies for shortcut
 * fusion is subject to change.
 *
 * Chaining is supported in custom builds as long as the `_#value` method is
 * directly or indirectly included in the build.
 *
 * In addition to lodash methods, wrappers have `Array` and `String` methods.
 *
 * The wrapper `Array` methods are:
 * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
 *
 * The wrapper `String` methods are:
 * `replace` and `split`
 *
 * The wrapper methods that support shortcut fusion are:
 * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
 * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
 * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
 *
 * The chainable wrapper methods are:
 * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
 * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
 * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
 * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
 * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
 * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
 * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
 * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
 * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
 * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
 * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
 * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
 * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
 * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
 * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
 * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
 * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
 * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
 * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
 * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
 * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
 * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
 * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
 * `zipObject`, `zipObjectDeep`, and `zipWith`
 *
 * The wrapper methods that are **not** chainable by default are:
 * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
 * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
 * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
 * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
 * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
 * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
 * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
 * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
 * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
 * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
 * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
 * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
 * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
 * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
 * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
 * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
 * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
 * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
 * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
 * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
 * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
 * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
 * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
 * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
 * `upperFirst`, `value`, and `words`
 *
 * @name _
 * @constructor
 * @category Seq
 * @param {*} value The value to wrap in a `lodash` instance.
 * @returns {Object} Returns the new `lodash` wrapper instance.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * var wrapped = _([1, 2, 3]);
 *
 * // Returns an unwrapped value.
 * wrapped.reduce(_.add);
 * // => 6
 *
 * // Returns a wrapped value.
 * var squares = wrapped.map(square);
 *
 * _.isArray(squares);
 * // => false
 *
 * _.isArray(squares.value());
 * // => true
 */
function lodash(value) {
  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
    if (value instanceof LodashWrapper) {
      return value;
    }
    if (hasOwnProperty.call(value, '__wrapped__')) {
      return wrapperClone(value);
    }
  }
  return new LodashWrapper(value);
}

// Ensure wrappers are instances of `baseLodash`.
lodash.prototype = baseLodash.prototype;
lodash.prototype.constructor = lodash;

module.exports = lodash;


/***/ }),

/***/ "./node_modules/min-dash/dist/index.esm.js":
/*!*************************************************!*\
  !*** ./node_modules/min-dash/dist/index.esm.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "bind": () => (/* binding */ bind),
/* harmony export */   "debounce": () => (/* binding */ debounce),
/* harmony export */   "ensureArray": () => (/* binding */ ensureArray),
/* harmony export */   "every": () => (/* binding */ every),
/* harmony export */   "filter": () => (/* binding */ filter),
/* harmony export */   "find": () => (/* binding */ find),
/* harmony export */   "findIndex": () => (/* binding */ findIndex),
/* harmony export */   "flatten": () => (/* binding */ flatten),
/* harmony export */   "forEach": () => (/* binding */ forEach),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "groupBy": () => (/* binding */ groupBy),
/* harmony export */   "has": () => (/* binding */ has),
/* harmony export */   "isArray": () => (/* binding */ isArray),
/* harmony export */   "isDefined": () => (/* binding */ isDefined),
/* harmony export */   "isFunction": () => (/* binding */ isFunction),
/* harmony export */   "isNil": () => (/* binding */ isNil),
/* harmony export */   "isNumber": () => (/* binding */ isNumber),
/* harmony export */   "isObject": () => (/* binding */ isObject),
/* harmony export */   "isString": () => (/* binding */ isString),
/* harmony export */   "isUndefined": () => (/* binding */ isUndefined),
/* harmony export */   "keys": () => (/* binding */ keys),
/* harmony export */   "map": () => (/* binding */ map),
/* harmony export */   "matchPattern": () => (/* binding */ matchPattern),
/* harmony export */   "merge": () => (/* binding */ merge),
/* harmony export */   "omit": () => (/* binding */ omit),
/* harmony export */   "pick": () => (/* binding */ pick),
/* harmony export */   "reduce": () => (/* binding */ reduce),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "size": () => (/* binding */ size),
/* harmony export */   "some": () => (/* binding */ some),
/* harmony export */   "sortBy": () => (/* binding */ sortBy),
/* harmony export */   "throttle": () => (/* binding */ throttle),
/* harmony export */   "unionBy": () => (/* binding */ unionBy),
/* harmony export */   "uniqueBy": () => (/* binding */ uniqueBy),
/* harmony export */   "values": () => (/* binding */ values),
/* harmony export */   "without": () => (/* binding */ without)
/* harmony export */ });
/**
 * Flatten array, one level deep.
 *
 * @param {Array<?>} arr
 *
 * @return {Array<?>}
 */
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

var nativeToString = Object.prototype.toString;
var nativeHasOwnProperty = Object.prototype.hasOwnProperty;
function isUndefined(obj) {
  return obj === undefined;
}
function isDefined(obj) {
  return obj !== undefined;
}
function isNil(obj) {
  return obj == null;
}
function isArray(obj) {
  return nativeToString.call(obj) === '[object Array]';
}
function isObject(obj) {
  return nativeToString.call(obj) === '[object Object]';
}
function isNumber(obj) {
  return nativeToString.call(obj) === '[object Number]';
}
function isFunction(obj) {
  var tag = nativeToString.call(obj);
  return tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]' || tag === '[object AsyncGeneratorFunction]' || tag === '[object Proxy]';
}
function isString(obj) {
  return nativeToString.call(obj) === '[object String]';
}
/**
 * Ensure collection is an array.
 *
 * @param {Object} obj
 */

function ensureArray(obj) {
  if (isArray(obj)) {
    return;
  }

  throw new Error('must supply array');
}
/**
 * Return true, if target owns a property with the given key.
 *
 * @param {Object} target
 * @param {String} key
 *
 * @return {Boolean}
 */

function has(target, key) {
  return nativeHasOwnProperty.call(target, key);
}

/**
 * Find element in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function|Object} matcher
 *
 * @return {Object}
 */

function find(collection, matcher) {
  matcher = toMatcher(matcher);
  var match;
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      match = val;
      return false;
    }
  });
  return match;
}
/**
 * Find element index in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function} matcher
 *
 * @return {Object}
 */

function findIndex(collection, matcher) {
  matcher = toMatcher(matcher);
  var idx = isArray(collection) ? -1 : undefined;
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      idx = key;
      return false;
    }
  });
  return idx;
}
/**
 * Find element in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function} matcher
 *
 * @return {Array} result
 */

function filter(collection, matcher) {
  var result = [];
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      result.push(val);
    }
  });
  return result;
}
/**
 * Iterate over collection; returning something
 * (non-undefined) will stop iteration.
 *
 * @param  {Array|Object} collection
 * @param  {Function} iterator
 *
 * @return {Object} return result that stopped the iteration
 */

function forEach(collection, iterator) {
  var val, result;

  if (isUndefined(collection)) {
    return;
  }

  var convertKey = isArray(collection) ? toNum : identity;

  for (var key in collection) {
    if (has(collection, key)) {
      val = collection[key];
      result = iterator(val, convertKey(key));

      if (result === false) {
        return val;
      }
    }
  }
}
/**
 * Return collection without element.
 *
 * @param  {Array} arr
 * @param  {Function} matcher
 *
 * @return {Array}
 */

function without(arr, matcher) {
  if (isUndefined(arr)) {
    return [];
  }

  ensureArray(arr);
  matcher = toMatcher(matcher);
  return arr.filter(function (el, idx) {
    return !matcher(el, idx);
  });
}
/**
 * Reduce collection, returning a single result.
 *
 * @param  {Object|Array} collection
 * @param  {Function} iterator
 * @param  {Any} result
 *
 * @return {Any} result returned from last iterator
 */

function reduce(collection, iterator, result) {
  forEach(collection, function (value, idx) {
    result = iterator(result, value, idx);
  });
  return result;
}
/**
 * Return true if every element in the collection
 * matches the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */

function every(collection, matcher) {
  return !!reduce(collection, function (matches, val, key) {
    return matches && matcher(val, key);
  }, true);
}
/**
 * Return true if some elements in the collection
 * match the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */

function some(collection, matcher) {
  return !!find(collection, matcher);
}
/**
 * Transform a collection into another collection
 * by piping each member through the given fn.
 *
 * @param  {Object|Array}   collection
 * @param  {Function} fn
 *
 * @return {Array} transformed collection
 */

function map(collection, fn) {
  var result = [];
  forEach(collection, function (val, key) {
    result.push(fn(val, key));
  });
  return result;
}
/**
 * Get the collections keys.
 *
 * @param  {Object|Array} collection
 *
 * @return {Array}
 */

function keys(collection) {
  return collection && Object.keys(collection) || [];
}
/**
 * Shorthand for `keys(o).length`.
 *
 * @param  {Object|Array} collection
 *
 * @return {Number}
 */

function size(collection) {
  return keys(collection).length;
}
/**
 * Get the values in the collection.
 *
 * @param  {Object|Array} collection
 *
 * @return {Array}
 */

function values(collection) {
  return map(collection, function (val) {
    return val;
  });
}
/**
 * Group collection members by attribute.
 *
 * @param  {Object|Array} collection
 * @param  {Function} extractor
 *
 * @return {Object} map with { attrValue => [ a, b, c ] }
 */

function groupBy(collection, extractor) {
  var grouped = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  extractor = toExtractor(extractor);
  forEach(collection, function (val) {
    var discriminator = extractor(val) || '_';
    var group = grouped[discriminator];

    if (!group) {
      group = grouped[discriminator] = [];
    }

    group.push(val);
  });
  return grouped;
}
function uniqueBy(extractor) {
  extractor = toExtractor(extractor);
  var grouped = {};

  for (var _len = arguments.length, collections = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    collections[_key - 1] = arguments[_key];
  }

  forEach(collections, function (c) {
    return groupBy(c, extractor, grouped);
  });
  var result = map(grouped, function (val, key) {
    return val[0];
  });
  return result;
}
var unionBy = uniqueBy;
/**
 * Sort collection by criteria.
 *
 * @param  {Object|Array} collection
 * @param  {String|Function} extractor
 *
 * @return {Array}
 */

function sortBy(collection, extractor) {
  extractor = toExtractor(extractor);
  var sorted = [];
  forEach(collection, function (value, key) {
    var disc = extractor(value, key);
    var entry = {
      d: disc,
      v: value
    };

    for (var idx = 0; idx < sorted.length; idx++) {
      var d = sorted[idx].d;

      if (disc < d) {
        sorted.splice(idx, 0, entry);
        return;
      }
    } // not inserted, append (!)


    sorted.push(entry);
  });
  return map(sorted, function (e) {
    return e.v;
  });
}
/**
 * Create an object pattern matcher.
 *
 * @example
 *
 * const matcher = matchPattern({ id: 1 });
 *
 * var element = find(elements, matcher);
 *
 * @param  {Object} pattern
 *
 * @return {Function} matcherFn
 */

function matchPattern(pattern) {
  return function (el) {
    return every(pattern, function (val, key) {
      return el[key] === val;
    });
  };
}

function toExtractor(extractor) {
  return isFunction(extractor) ? extractor : function (e) {
    return e[extractor];
  };
}

function toMatcher(matcher) {
  return isFunction(matcher) ? matcher : function (e) {
    return e === matcher;
  };
}

function identity(arg) {
  return arg;
}

function toNum(arg) {
  return Number(arg);
}

/**
 * Debounce fn, calling it only once if
 * the given time elapsed between calls.
 *
 * @param  {Function} fn
 * @param  {Number} timeout
 *
 * @return {Function} debounced function
 */
function debounce(fn, timeout) {
  var timer;
  var lastArgs;
  var lastThis;
  var lastNow;

  function fire() {
    var now = Date.now();
    var scheduledDiff = lastNow + timeout - now;

    if (scheduledDiff > 0) {
      return schedule(scheduledDiff);
    }

    fn.apply(lastThis, lastArgs);
    timer = lastNow = lastArgs = lastThis = undefined;
  }

  function schedule(timeout) {
    timer = setTimeout(fire, timeout);
  }

  return function () {
    lastNow = Date.now();

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    lastArgs = args;
    lastThis = this; // ensure an execution is scheduled

    if (!timer) {
      schedule(timeout);
    }
  };
}
/**
 * Throttle fn, calling at most once
 * in the given interval.
 *
 * @param  {Function} fn
 * @param  {Number} interval
 *
 * @return {Function} throttled function
 */

function throttle(fn, interval) {
  var throttling = false;
  return function () {
    if (throttling) {
      return;
    }

    fn.apply(void 0, arguments);
    throttling = true;
    setTimeout(function () {
      throttling = false;
    }, interval);
  };
}
/**
 * Bind function against target <this>.
 *
 * @param  {Function} fn
 * @param  {Object}   target
 *
 * @return {Function} bound function
 */

function bind(fn, target) {
  return fn.bind(target);
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/**
 * Convenience wrapper for `Object.assign`.
 *
 * @param {Object} target
 * @param {...Object} others
 *
 * @return {Object} the target
 */

function assign(target) {
  for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    others[_key - 1] = arguments[_key];
  }

  return _extends.apply(void 0, [target].concat(others));
}
/**
 * Sets a nested property of a given object to the specified value.
 *
 * This mutates the object and returns it.
 *
 * @param {Object} target The target of the set operation.
 * @param {(string|number)[]} path The path to the nested value.
 * @param {any} value The value to set.
 */

function set(target, path, value) {
  var currentTarget = target;
  forEach(path, function (key, idx) {
    if (key === '__proto__') {
      throw new Error('illegal key: __proto__');
    }

    var nextKey = path[idx + 1];
    var nextTarget = currentTarget[key];

    if (isDefined(nextKey) && isNil(nextTarget)) {
      nextTarget = currentTarget[key] = isNaN(+nextKey) ? {} : [];
    }

    if (isUndefined(nextKey)) {
      if (isUndefined(value)) {
        delete currentTarget[key];
      } else {
        currentTarget[key] = value;
      }
    } else {
      currentTarget = nextTarget;
    }
  });
  return target;
}
/**
 * Gets a nested property of a given object.
 *
 * @param {Object} target The target of the get operation.
 * @param {(string|number)[]} path The path to the nested value.
 * @param {any} [defaultValue] The value to return if no value exists.
 */

function get(target, path, defaultValue) {
  var currentTarget = target;
  forEach(path, function (key) {
    // accessing nil property yields <undefined>
    if (isNil(currentTarget)) {
      currentTarget = undefined;
      return false;
    }

    currentTarget = currentTarget[key];
  });
  return isUndefined(currentTarget) ? defaultValue : currentTarget;
}
/**
 * Pick given properties from the target object.
 *
 * @param {Object} target
 * @param {Array} properties
 *
 * @return {Object} target
 */

function pick(target, properties) {
  var result = {};
  var obj = Object(target);
  forEach(properties, function (prop) {
    if (prop in obj) {
      result[prop] = target[prop];
    }
  });
  return result;
}
/**
 * Pick all target properties, excluding the given ones.
 *
 * @param {Object} target
 * @param {Array} properties
 *
 * @return {Object} target
 */

function omit(target, properties) {
  var result = {};
  var obj = Object(target);
  forEach(obj, function (prop, key) {
    if (properties.indexOf(key) === -1) {
      result[key] = prop;
    }
  });
  return result;
}
/**
 * Recursively merge `...sources` into given target.
 *
 * Does support merging objects; does not support merging arrays.
 *
 * @param {Object} target
 * @param {...Object} sources
 *
 * @return {Object} the target
 */

function merge(target) {
  for (var _len2 = arguments.length, sources = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    sources[_key2 - 1] = arguments[_key2];
  }

  if (!sources.length) {
    return target;
  }

  forEach(sources, function (source) {
    // skip non-obj sources, i.e. null
    if (!source || !isObject(source)) {
      return;
    }

    forEach(source, function (sourceVal, key) {
      if (key === '__proto__') {
        return;
      }

      var targetVal = target[key];

      if (isObject(sourceVal)) {
        if (!isObject(targetVal)) {
          // override target[key] with object
          targetVal = {};
        }

        target[key] = merge(targetVal, sourceVal);
      } else {
        target[key] = sourceVal;
      }
    });
  });
  return target;
}




/***/ }),

/***/ "./node_modules/min-dom/dist/index.esm.js":
/*!************************************************!*\
  !*** ./node_modules/min-dom/dist/index.esm.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "attr": () => (/* binding */ attr),
/* harmony export */   "classes": () => (/* binding */ classes),
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "closest": () => (/* binding */ closest),
/* harmony export */   "delegate": () => (/* binding */ delegate),
/* harmony export */   "domify": () => (/* binding */ domify),
/* harmony export */   "event": () => (/* binding */ componentEvent),
/* harmony export */   "matches": () => (/* binding */ matchesSelector),
/* harmony export */   "query": () => (/* binding */ query),
/* harmony export */   "queryAll": () => (/* binding */ all),
/* harmony export */   "remove": () => (/* binding */ remove)
/* harmony export */ });
/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {Element} el
 * @param {String} name
 * @param {String} [val]
 * @api public
 */
function attr(el, name, val) {
  // get
  if (arguments.length == 2) {
    return el.getAttribute(name);
  }

  // remove
  if (val === null) {
    return el.removeAttribute(name);
  }

  // set
  el.setAttribute(name, val);

  return el;
}

var indexOf = [].indexOf;

var indexof = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/**
 * Taken from https://github.com/component/classes
 *
 * Without the component bits.
 */

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

function classes(el) {
  return new ClassList(el);
}

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function (name) {
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = indexof(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function (name) {
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = indexof(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function (re) {
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function (name, force) {
  // classList
  if (this.list) {
    if ('undefined' !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ('undefined' !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function () {
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has = ClassList.prototype.contains = function (name) {
  return this.list ? this.list.contains(name) : !!~indexof(this.array(), name);
};

/**
 * Remove all children from the given element.
 */
function clear(el) {

  var c;

  while (el.childNodes.length) {
    c = el.childNodes[0];
    el.removeChild(c);
  }

  return el;
}

var proto = typeof Element !== 'undefined' ? Element.prototype : {};
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

var matchesSelector = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Boolean} checkYourSelf (optional)
 */
function closest (element, selector, checkYourSelf) {
  var currentElem = checkYourSelf ? element : element.parentNode;

  while (currentElem && currentElem.nodeType !== document.DOCUMENT_NODE && currentElem.nodeType !== document.DOCUMENT_FRAGMENT_NODE) {

    if (matchesSelector(currentElem, selector)) {
      return currentElem;
    }

    currentElem = currentElem.parentNode;
  }

  return matchesSelector(currentElem, selector) ? currentElem : null;
}

var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

var bind_1 = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

var unbind_1 = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};

var componentEvent = {
	bind: bind_1,
	unbind: unbind_1
};

/**
 * Module dependencies.
 */

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

// Some events don't bubble, so we want to bind to the capture phase instead
// when delegating.
var forceCaptureEvents = ['focus', 'blur'];

function bind$1(el, selector, type, fn, capture) {
  if (forceCaptureEvents.indexOf(type) !== -1) {
    capture = true;
  }

  return componentEvent.bind(el, type, function (e) {
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) {
      fn.call(el, e);
    }
  }, capture);
}

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */
function unbind$1(el, type, fn, capture) {
  if (forceCaptureEvents.indexOf(type) !== -1) {
    capture = true;
  }

  return componentEvent.unbind(el, type, fn, capture);
}

var delegate = {
  bind: bind$1,
  unbind: unbind$1
};

/**
 * Expose `parse`.
 */

var domify = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

function query(selector, el) {
  el = el || document;

  return el.querySelector(selector);
}

function all(selector, el) {
  el = el || document;

  return el.querySelectorAll(selector);
}

function remove(el) {
  el.parentNode && el.parentNode.removeChild(el);
}




/***/ }),

/***/ "./node_modules/selection-update/index.js":
/*!************************************************!*\
  !*** ./node_modules/selection-update/index.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


/**
 * Calculate the selection update for the given
 * current and new input values.
 *
 * @param {Object} currentSelection as {start, end}
 * @param {String} currentValue
 * @param {String} newValue
 *
 * @return {Object} newSelection as {start, end}
 */
function calculateUpdate(currentSelection, currentValue, newValue) {

  var currentCursor = currentSelection.start,
      newCursor = currentCursor,
      diff = newValue.length - currentValue.length,
      idx;

  var lengthDelta = newValue.length - currentValue.length;

  var currentTail = currentValue.substring(currentCursor);

  // check if we can remove common ending from the equation
  // to be able to properly detect a selection change for
  // the following scenarios:
  //
  //  * (AAATTT|TF) => (AAAT|TF)
  //  * (AAAT|TF) =>  (AAATTT|TF)
  //
  if (newValue.lastIndexOf(currentTail) === newValue.length - currentTail.length) {
    currentValue = currentValue.substring(0, currentValue.length - currentTail.length);
    newValue = newValue.substring(0, newValue.length - currentTail.length);
  }

  // diff
  var diff = createDiff(currentValue, newValue);

  if (diff) {
    if (diff.type === 'remove') {
      newCursor = diff.newStart;
    } else {
      newCursor = diff.newEnd;
    }
  }

  return range(newCursor);
}

module.exports = calculateUpdate;


function createDiff(currentValue, newValue) {

  var insert;

  var l_str, l_char, l_idx = 0,
      s_str, s_char, s_idx = 0;

  if (newValue.length > currentValue.length) {
    l_str = newValue;
    s_str = currentValue;
  } else {
    l_str = currentValue;
    s_str = newValue;
  }

  // assume there will be only one insert / remove and
  // detect that _first_ edit operation only
  while (l_idx < l_str.length) {

    l_char = l_str.charAt(l_idx);
    s_char = s_str.charAt(s_idx);

    // chars no not equal
    if (l_char !== s_char) {

      if (!insert) {
        insert = {
          l_start: l_idx,
          s_start: s_idx
        };
      }

      l_idx++;
    }

    // chars equal (again?)
    else {

      if (insert && !insert.complete) {
        insert.l_end = l_idx;
        insert.s_end = s_idx;
        insert.complete = true;
      }

      s_idx++;
      l_idx++;
    }
  }

  if (insert && !insert.complete) {
    insert.complete = true;
    insert.s_end = s_str.length;
    insert.l_end = l_str.length;
  }

  // no diff
  if (!insert) {
    return;
  }

  if (newValue.length > currentValue.length) {
    return {
      newStart: insert.l_start,
      newEnd: insert.l_end,
      type: 'add'
    };
  } else {
    return {
      newStart: insert.s_start,
      newEnd: insert.s_end,
      type: newValue.length < currentValue.length ? 'remove' : 'replace'
    };
  }
}

/**
 * Utility method for creating a new selection range {start, end} object.
 *
 * @param {Number} start
 * @param {Number} [end]
 *
 * @return {Object} selection range as {start, end}
 */
function range(start, end) {
  return {
    start: start,
    end: end === undefined ? start : end
  };
}

module.exports.range = range;


function splitStr(str, position) {
  return {
    before: str.substring(0, position),
    after: str.substring(position)
  };
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/animation/Animation.js":
/*!**************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/animation/Animation.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Animation)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var tiny_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tiny-svg */ "../bpmn-js-token-simulation/node_modules/tiny-svg/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");






const STYLE = getComputedStyle(document.documentElement);

const DEFAULT_PRIMARY_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');
const DEFAULT_AUXILIARY_COLOR = STYLE.getPropertyValue('--token-simulation-white');

function noop() {}

function getSegmentEasing(index, waypoints) {

  // only a single segment
  if (waypoints.length === 2) {
    return EASE_IN_OUT;
  }

  // first segment
  if (index === 1) {
    return EASE_IN;
  }

  // last segment
  if (index === waypoints.length - 1) {
    return EASE_OUT;
  }

  return EASE_LINEAR;
}

const EASE_LINEAR = function(pos) {
  return pos;
};
const EASE_IN = function(pos) {
  return -Math.cos(pos * Math.PI / 2) + 1;
};
const EASE_OUT = function(pos) {
  return Math.sin(pos * Math.PI / 2);
};
const EASE_IN_OUT = function(pos) {
  return -Math.cos(pos * Math.PI) / 2 + 0.5;
};

const TOKEN_SIZE = 20;


function Animation(canvas, eventBus, scopeFilter) {
  this._eventBus = eventBus;
  this._scopeFilter = scopeFilter;

  this._animations = new Set();
  this._speed = 1;

  eventBus.on('import.done', () => {
    const viewport = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.query)('.viewport', canvas._svg);

    this.group = (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.appendTo)(
      (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.create)('<g class="animation-tokens" />'),
      viewport
    );
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.RESET_SIMULATION_EVENT, () => {
    this.clearAnimations();
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.PAUSE_SIMULATION_EVENT, () => {
    this.pause();
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.PLAY_SIMULATION_EVENT, () => {
    this.play();
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.SCOPE_FILTER_CHANGED_EVENT, event => {

    this.each(animation => {
      if (this._scopeFilter.isShown(animation.scope)) {
        animation.show();
      } else {
        animation.hide();
      }
    });
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    this.clearAnimations(scope);
  });
}

Animation.prototype.animate = function(connection, scope, done) {
  this.createAnimation(connection, scope, done);
};

Animation.prototype.pause = function() {
  this.each(animation => animation.pause());
};

Animation.prototype.play = function() {
  this.each(animation => animation.play());
};

Animation.prototype.each = function(fn) {
  this._animations.forEach(fn);
};

Animation.prototype.createAnimation = function(connection, scope, done=noop) {
  if (!this.group) {
    return;
  }

  const tokenGfx = this._createTokenGfx(scope);

  const animation = new TokenAnimation(tokenGfx, connection.waypoints, () => {
    this._animations.delete(animation);

    done();
  });

  animation.setSpeed(this.getAnimationSpeed());

  if (!this._scopeFilter.isShown(scope)) {
    animation.hide();
  }

  animation.scope = scope;
  animation.element = connection;

  this._animations.add(animation);

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.ANIMATION_CREATED_EVENT, {
    animation
  });

  animation.play();

  return animation;
};

Animation.prototype.setAnimationSpeed = function(speed) {
  this._speed = speed;

  this.each(animation => animation.setSpeed(speed));

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_2__.ANIMATION_SPEED_CHANGED_EVENT, {
    speed
  });
};

Animation.prototype.getAnimationSpeed = function() {
  return this._speed;
};

Animation.prototype.clearAnimations = function(scope) {
  this.each(animation => {
    if (!scope || animation.scope === scope) {
      animation.remove();
    }
  });
};

Animation.prototype._createTokenGfx = function(scope) {

  const colors = scope.colors || {
    primary: DEFAULT_PRIMARY_COLOR,
    auxiliary: DEFAULT_AUXILIARY_COLOR
  };

  const parent = (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.create)(`
    <g class="token">
      <circle
        class="circle"
        r="${TOKEN_SIZE / 2}"
        cx="${TOKEN_SIZE / 2}"
        cy="${TOKEN_SIZE / 2}"
        fill="${ colors.primary }"
      />
      <text
        class="text"
        transform="translate(10, 14)"
        text-anchor="middle"
        fill="${ colors.auxiliary }"
      >1</text>
    </g>
  `.trim());

  return (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.appendTo)(parent, this.group);
};

Animation.$inject = [
  'canvas',
  'eventBus',
  'scopeFilter'
];


function TokenAnimation(gfx, waypoints, done) {
  this.gfx = gfx;
  this.waypoints = waypoints;
  this.done = done;

  this._paused = true;
  this._t = 0;
  this._parts = [];

  this.create();
}

TokenAnimation.prototype.pause = function() {
  this._paused = true;
};

TokenAnimation.prototype.play = function() {

  if (this._paused) {
    this._paused = false;

    this.tick(0);
  }

  this.schedule();
};

TokenAnimation.prototype.schedule = function() {

  if (this._paused) {
    return;
  }

  if (this._scheduled) {
    return;
  }

  const last = Date.now();

  this._scheduled = true;

  requestAnimationFrame(() => {
    this._scheduled = false;

    if (this._paused) {
      return;
    }

    this.tick((Date.now() - last) * this._speed);
    this.schedule();
  });
};


TokenAnimation.prototype.tick = function(tElapsed) {

  const t = this._t = this._t + tElapsed;

  const part = this._parts.find(
    p => p.startTime <= t && p.endTime > t
  );

  // completed
  if (!part) {
    return this.remove();
  }

  const segmentTime = t - part.startTime;
  const segmentLength = part.length * part.easing(segmentTime / part.duration);

  const currentLength = part.startLength + segmentLength;

  const point = this._path.getPointAtLength(currentLength);

  this.move(point.x, point.y);
};

TokenAnimation.prototype.move = function(x, y) {
  (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.attr)(this.gfx, 'transform', `translate(${x}, ${y})`);
};

TokenAnimation.prototype.create = function() {
  const waypoints = this.waypoints;

  const parts = waypoints.reduce((parts, point, index) => {

    const lastPoint = waypoints[index - 1];

    if (lastPoint) {
      const lastPart = parts[parts.length - 1];

      const startLength = lastPart && lastPart.endLength || 0;
      const length = distance(lastPoint, point);

      parts.push({
        startLength,
        endLength: startLength + length,
        length,
        easing: getSegmentEasing(index, waypoints)
      });
    }

    return parts;
  }, []);

  const totalLength = parts.reduce(function(length, part) {
    return length + part.length;
  }, 0);

  const d = waypoints.reduce((d, waypoint, index) => {

    const x = waypoint.x - TOKEN_SIZE / 2,
          y = waypoint.y - TOKEN_SIZE / 2;

    d.push([ index > 0 ? 'L' : 'M', x, y ]);

    return d;
  }, []).flat().join(' ');

  const totalDuration = getAnimationDuration(totalLength);

  this._parts = parts.reduce((parts, part, index) => {
    const duration = totalDuration / totalLength * part.length;
    const startTime = index > 0 ? parts[index - 1].endTime : 0;
    const endTime = startTime + duration;

    return [
      ...parts,
      {
        ...part,
        startTime,
        endTime,
        duration
      }
    ];
  }, []);

  this._path = (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.create)(`<path d="${d}" />`);
  this._t = 0;
};

TokenAnimation.prototype.show = function() {
  (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.attr)(this.gfx, 'display', '');
};

TokenAnimation.prototype.hide = function() {
  (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.attr)(this.gfx, 'display', 'none');
};

TokenAnimation.prototype.remove = function() {
  this.pause();

  (0,tiny_svg__WEBPACK_IMPORTED_MODULE_1__.remove)(this.gfx);

  this.done();
};

TokenAnimation.prototype.setSpeed = function(speed) {
  this._speed = speed;
};

function getAnimationDuration(length) {
  return Math.log(length) * randomBetween(250, 300);
}

function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/animation/behaviors/AnimatedMessageFlowBehavior.js":
/*!******************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/animation/behaviors/AnimatedMessageFlowBehavior.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AnimatedMessageFlowBehavior)
/* harmony export */ });
/* harmony import */ var _simulator_behaviors_MessageFlowBehavior__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../simulator/behaviors/MessageFlowBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/MessageFlowBehavior.js");
/* harmony import */ var inherits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! inherits */ "../bpmn-js-token-simulation/node_modules/inherits/inherits_browser.js");
/* harmony import */ var inherits__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(inherits__WEBPACK_IMPORTED_MODULE_0__);





function AnimatedMessageFlowBehavior(injector, animation) {
  injector.invoke(_simulator_behaviors_MessageFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default, this);

  this._animation = animation;
}

inherits__WEBPACK_IMPORTED_MODULE_0___default()(AnimatedMessageFlowBehavior, _simulator_behaviors_MessageFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default);

AnimatedMessageFlowBehavior.$inject = [
  'injector',
  'animation'
];

AnimatedMessageFlowBehavior.prototype.signal = function(context) {

  const {
    element,
    scope
  } = context;

  this._animation.animate(element, scope, () => {
    _simulator_behaviors_MessageFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default.prototype.signal.call(this, context);
  });
};


/***/ }),

/***/ "../bpmn-js-token-simulation/lib/animation/behaviors/AnimatedSequenceFlowBehavior.js":
/*!*******************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/animation/behaviors/AnimatedSequenceFlowBehavior.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AnimatedSequenceFlowBehavior)
/* harmony export */ });
/* harmony import */ var _simulator_behaviors_SequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../simulator/behaviors/SequenceFlowBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/SequenceFlowBehavior.js");
/* harmony import */ var inherits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! inherits */ "../bpmn-js-token-simulation/node_modules/inherits/inherits_browser.js");
/* harmony import */ var inherits__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(inherits__WEBPACK_IMPORTED_MODULE_0__);





function AnimatedSequenceFlowBehavior(injector, animation) {
  injector.invoke(_simulator_behaviors_SequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default, this);

  this._animation = animation;
}

inherits__WEBPACK_IMPORTED_MODULE_0___default()(AnimatedSequenceFlowBehavior, _simulator_behaviors_SequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default);

AnimatedSequenceFlowBehavior.$inject = [
  'injector',
  'animation'
];

AnimatedSequenceFlowBehavior.prototype.enter = function(context) {

  const {
    element,
    scope
  } = context;

  this._animation.animate(element, scope, () => {
    _simulator_behaviors_SequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default.prototype.enter.call(this, context);
  });
};

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/animation/behaviors/index.js":
/*!********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/animation/behaviors/index.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _AnimatedMessageFlowBehavior__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AnimatedMessageFlowBehavior */ "../bpmn-js-token-simulation/lib/animation/behaviors/AnimatedMessageFlowBehavior.js");
/* harmony import */ var _AnimatedSequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnimatedSequenceFlowBehavior */ "../bpmn-js-token-simulation/lib/animation/behaviors/AnimatedSequenceFlowBehavior.js");



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  sequenceFlowBehavior: [ 'type', _AnimatedSequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_0__.default ],
  messageFlowBehavior: [ 'type', _AnimatedMessageFlowBehavior__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/animation/index.js":
/*!**********************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/animation/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _behaviors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./behaviors */ "../bpmn-js-token-simulation/lib/animation/behaviors/index.js");
/* harmony import */ var _features_scope_filter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../features/scope-filter */ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js");
/* harmony import */ var _simulator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../simulator */ "../bpmn-js-token-simulation/lib/simulator/index.js");
/* harmony import */ var _Animation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Animation */ "../bpmn-js-token-simulation/lib/animation/Animation.js");






/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _simulator__WEBPACK_IMPORTED_MODULE_0__.default,
    _behaviors__WEBPACK_IMPORTED_MODULE_1__.default,
    _features_scope_filter__WEBPACK_IMPORTED_MODULE_2__.default
  ],
  animation: [ 'type', _Animation__WEBPACK_IMPORTED_MODULE_3__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/base.js":
/*!***********************************************!*\
  !*** ../bpmn-js-token-simulation/lib/base.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _simulator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./simulator */ "../bpmn-js-token-simulation/lib/simulator/index.js");
/* harmony import */ var _animation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./animation */ "../bpmn-js-token-simulation/lib/animation/index.js");
/* harmony import */ var _features_colored_scopes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./features/colored-scopes */ "../bpmn-js-token-simulation/lib/features/colored-scopes/index.js");
/* harmony import */ var _features_context_pads__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./features/context-pads */ "../bpmn-js-token-simulation/lib/features/context-pads/index.js");
/* harmony import */ var _features_simulation_state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./features/simulation-state */ "../bpmn-js-token-simulation/lib/features/simulation-state/index.js");
/* harmony import */ var _features_show_scopes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./features/show-scopes */ "../bpmn-js-token-simulation/lib/features/show-scopes/index.js");
/* harmony import */ var _features_log__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./features/log */ "../bpmn-js-token-simulation/lib/features/log/index.js");
/* harmony import */ var _features_element_support__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./features/element-support */ "../bpmn-js-token-simulation/lib/features/element-support/index.js");
/* harmony import */ var _features_pause_simulation__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./features/pause-simulation */ "../bpmn-js-token-simulation/lib/features/pause-simulation/index.js");
/* harmony import */ var _features_reset_simulation__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./features/reset-simulation */ "../bpmn-js-token-simulation/lib/features/reset-simulation/index.js");
/* harmony import */ var _features_token_count__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./features/token-count */ "../bpmn-js-token-simulation/lib/features/token-count/index.js");
/* harmony import */ var _features_set_animation_speed__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./features/set-animation-speed */ "../bpmn-js-token-simulation/lib/features/set-animation-speed/index.js");
/* harmony import */ var _features_exclusive_gateway_settings__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./features/exclusive-gateway-settings */ "../bpmn-js-token-simulation/lib/features/exclusive-gateway-settings/index.js");
/* harmony import */ var _features_preserve_element_colors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./features/preserve-element-colors */ "../bpmn-js-token-simulation/lib/features/preserve-element-colors/index.js");
/* harmony import */ var _features_palette__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./features/palette */ "../bpmn-js-token-simulation/lib/features/palette/index.js");
/* harmony import */ var _features_toggle_automatic__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./features/toggle-automatic */ "../bpmn-js-token-simulation/lib/features/toggle-automatic/index.js");
/* harmony import */ var _features_element_wait__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./features/element-wait */ "../bpmn-js-token-simulation/lib/features/element-wait/index.js");



















/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _simulator__WEBPACK_IMPORTED_MODULE_0__.default,
    _animation__WEBPACK_IMPORTED_MODULE_1__.default,
    _features_colored_scopes__WEBPACK_IMPORTED_MODULE_2__.default,
    _features_context_pads__WEBPACK_IMPORTED_MODULE_3__.default,
    _features_simulation_state__WEBPACK_IMPORTED_MODULE_4__.default,
    _features_show_scopes__WEBPACK_IMPORTED_MODULE_5__.default,
    _features_log__WEBPACK_IMPORTED_MODULE_6__.default,
    _features_element_support__WEBPACK_IMPORTED_MODULE_7__.default,
    _features_pause_simulation__WEBPACK_IMPORTED_MODULE_8__.default,
    _features_reset_simulation__WEBPACK_IMPORTED_MODULE_9__.default,
    _features_token_count__WEBPACK_IMPORTED_MODULE_10__.default,
    _features_set_animation_speed__WEBPACK_IMPORTED_MODULE_11__.default,
    _features_exclusive_gateway_settings__WEBPACK_IMPORTED_MODULE_12__.default,
    _features_preserve_element_colors__WEBPACK_IMPORTED_MODULE_13__.default,
    _features_palette__WEBPACK_IMPORTED_MODULE_14__.default,
    _features_toggle_automatic__WEBPACK_IMPORTED_MODULE_15__.default,
    _features_element_wait__WEBPACK_IMPORTED_MODULE_16__.default
  ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/colored-scopes/ColoredScopes.js":
/*!********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/colored-scopes/ColoredScopes.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ColoredScopes)
/* harmony export */ });
/* harmony import */ var randomcolor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! randomcolor */ "../bpmn-js-token-simulation/node_modules/randomcolor/randomColor.js");
/* harmony import */ var randomcolor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(randomcolor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const HIGH_PRIORITY = 1500;


function ColoredScopes(eventBus) {

  const colors = randomcolor__WEBPACK_IMPORTED_MODULE_0___default()({
    count: 60
  }).filter(c => getContrastYIQ(c.substring(1)) < 200);

  function getContrastYIQ(hexcolor) {
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq;
  }

  let colorsIdx = 0;

  function getColors(scope) {
    const {
      initiator
    } = scope;

    if (initiator && initiator.type === 'bpmn:MessageFlow') {
      return {
        primary: '#999',
        auxiliary: '#FFF'
      };
    }

    if (scope.parent) {
      return scope.parent.colors;
    }

    const primary = colors[ (colorsIdx++) % colors.length ];

    return {
      primary,
      auxiliary: getContrastYIQ(primary) >= 128 ? '#111' : '#fff'
    };
  }

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.SCOPE_CREATE_EVENT, HIGH_PRIORITY, event => {

    const {
      scope
    } = event;

    scope.colors = getColors(scope);
  });
}

ColoredScopes.$inject = [
  'eventBus'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/colored-scopes/index.js":
/*!************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/colored-scopes/index.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ColoredScopes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ColoredScopes */ "../bpmn-js-token-simulation/lib/features/colored-scopes/ColoredScopes.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'coloredScopes'
  ],
  coloredScopes: [ 'type', _ColoredScopes__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/ContextPads.js":
/*!****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/ContextPads.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ContextPads),
/* harmony export */   "isAncestor": () => (/* binding */ isAncestor)
/* harmony export */ });
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _handler_BoundaryEventHandler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./handler/BoundaryEventHandler */ "../bpmn-js-token-simulation/lib/features/context-pads/handler/BoundaryEventHandler.js");
/* harmony import */ var _handler_ExclusiveGatewayHandler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handler/ExclusiveGatewayHandler */ "../bpmn-js-token-simulation/lib/features/context-pads/handler/ExclusiveGatewayHandler.js");
/* harmony import */ var _handler_EventBasedGatewayHandler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./handler/EventBasedGatewayHandler */ "../bpmn-js-token-simulation/lib/features/context-pads/handler/EventBasedGatewayHandler.js");
/* harmony import */ var _handler_IntermediateCatchEventHandler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./handler/IntermediateCatchEventHandler */ "../bpmn-js-token-simulation/lib/features/context-pads/handler/IntermediateCatchEventHandler.js");
/* harmony import */ var _handler_StartEventHandler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./handler/StartEventHandler */ "../bpmn-js-token-simulation/lib/features/context-pads/handler/StartEventHandler.js");












// TODO(nikku): restore or delete
// import ProcessHandler from './handler/ProcessHandler';

const LOW_PRIORITY = 500;

const OFFSET_TOP = -15;
const OFFSET_LEFT = -15;


function ContextPads(
    eventBus, elementRegistry,
    overlays, injector,
    canvas, scopeFilter) {

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._injector = injector;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;

  this._overlaysByElement = new Map();

  this._handlers = [];

  this.registerHandler('bpmn:ExclusiveGateway', _handler_ExclusiveGatewayHandler__WEBPACK_IMPORTED_MODULE_0__.default);
  this.registerHandler('bpmn:IntermediateCatchEvent', _handler_IntermediateCatchEventHandler__WEBPACK_IMPORTED_MODULE_1__.default);
  this.registerHandler('bpmn:Activity', _handler_IntermediateCatchEventHandler__WEBPACK_IMPORTED_MODULE_1__.default);

  this.registerHandler('bpmn:EventBasedGateway', _handler_EventBasedGatewayHandler__WEBPACK_IMPORTED_MODULE_2__.default);

  // TODO(nikku): restore or delete
  // this.registerHandler('bpmn:SubProcess', ProcessHandler);

  this.registerHandler('bpmn:Activity', _handler_BoundaryEventHandler__WEBPACK_IMPORTED_MODULE_3__.default);

  this.registerHandler('bpmn:Process', _handler_StartEventHandler__WEBPACK_IMPORTED_MODULE_4__.default);
  this.registerHandler('bpmn:SubProcess', _handler_StartEventHandler__WEBPACK_IMPORTED_MODULE_4__.default);
  this.registerHandler('bpmn:Participant', _handler_StartEventHandler__WEBPACK_IMPORTED_MODULE_4__.default);

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_5__.TOGGLE_MODE_EVENT, LOW_PRIORITY, context => {
    const active = context.active;

    if (active) {
      this.openContextPads();
    } else {
      this.closeContextPads();
    }
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_5__.RESET_SIMULATION_EVENT, LOW_PRIORITY, () => {
    this.closeContextPads();
    this.openContextPads();
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_5__.SCOPE_FILTER_CHANGED_EVENT, event => {

    const contextPads = (0,min_dom__WEBPACK_IMPORTED_MODULE_6__.queryAll)(
      '.djs-overlay-ts-context-menu [data-scope-ids]',
      overlays._overlayRoot
    );

    for (const element of contextPads) {

      const scopeIds = element.dataset.scopeIds.split(',');

      const shown = scopeIds.some(id => scopeFilter.isShown(id));

      (0,min_dom__WEBPACK_IMPORTED_MODULE_6__.classes)(element).toggle('hidden', !shown);
    }
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_5__.ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {
    const {
      element
    } = event;

    this.closeElementContextPads(element);
    this.openElementContextPads(element);
  });
}

/**
 * Register a handler for an element type.
 * An element type can have multiple handlers.
 *
 * @param {String} type
 * @param {Object} handlerCls
 */
ContextPads.prototype.registerHandler = function(type, handlerCls) {
  const handler = this._injector.instantiate(handlerCls);

  this._handlers.push({ handler, type });
};

ContextPads.prototype.getHandlers = function(element) {

  return (
    this._handlers.filter(
      ({ type }) => (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_7__.is)(element, type)
    ).map(
      ({ handler }) => handler
    )
  );
};

ContextPads.prototype.openContextPads = function(parent) {

  if (!parent) {
    parent = this._canvas.getRootElement();
  }

  this._elementRegistry.forEach((element) => {
    if (isAncestor(parent, element)) {
      this.openElementContextPads(element);
    }
  });
};

ContextPads.prototype.registerContextPad = function(element, overlayId) {

  const overlaysByElement = this._overlaysByElement;

  if (!overlaysByElement.has(element)) {
    overlaysByElement.set(element, []);
  }

  const overlayIds = overlaysByElement.get(element);

  overlayIds.push(overlayId);
};

ContextPads.prototype.openElementContextPads = function(element) {

  const contextPads = [];

  for (const handler of this.getHandlers(element)) {
    const additionalPads = handler.createContextPads(element) || [];

    contextPads.push(...additionalPads.filter(p => p));
  }

  for (const contextPad of contextPads) {
    const position = {
      top: OFFSET_TOP,
      left: OFFSET_LEFT
    };

    if (contextPad.scopes) {
      const scopes = contextPad.scopes();

      contextPad.html.dataset.scopeIds = scopes.map(s => s.id).join(',');

      const shownScopes = scopes.filter(s => this._scopeFilter.isShown(s));

      (0,min_dom__WEBPACK_IMPORTED_MODULE_6__.classes)(contextPad.html).toggle('hidden', shownScopes.length === 0);
    }

    if ('action' in contextPad) {

      min_dom__WEBPACK_IMPORTED_MODULE_6__.event.bind(contextPad.html, 'click', event => {
        event.preventDefault();

        const scopes = contextPad.scopes
          ? contextPad.scopes().filter(s => this._scopeFilter.isShown(s))
          : null;

        contextPad.action(scopes);
      });
    }

    const overlayId = this._overlays.add(contextPad.element, 'ts-context-menu', {
      position: position,
      html: contextPad.html,
      show: {
        minZoom: 0.5
      }
    });

    this.registerContextPad(element, overlayId);
  }
};

ContextPads.prototype.closeContextPads = function() {
  for (const element of this._overlaysByElement.keys()) {
    this.closeElementContextPads(element);
  }
};

ContextPads.prototype.closeElementContextPads = function(element) {

  const overlayIds = this._overlaysByElement.get(element) || [];

  for (const overlayId of overlayIds) {
    this._overlays.remove(overlayId);
  }

  overlayIds.length = 0;
};

ContextPads.$inject = [
  'eventBus',
  'elementRegistry',
  'overlays',
  'injector',
  'canvas',
  'scopeFilter'
];


// helpers ///////////////

function isAncestor(ancestor, descendant) {

  do {
    if (ancestor === descendant) {
      return true;
    }

    descendant = descendant.parent;
  } while (descendant);

  return false;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/handler/BoundaryEventHandler.js":
/*!*********************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/handler/BoundaryEventHandler.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BoundaryEventHandler)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");



function BoundaryEventHandler(simulator) {
  this._simulator = simulator;
}

BoundaryEventHandler.prototype.createContextPads = function(element) {
  return element.attachers.map(
    attacher => this.createBoundaryContextPad(attacher)
  );
};

BoundaryEventHandler.prototype.createBoundaryContextPad = function(element) {

  const scopes = () => {
    return this._findScopes({
      element: element.host
    });
  };

  if (!scopes().length) {
    return;
  }

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  // TODO(nikku): do not show on compenstation boundary

  const action = (scopes) => {

    return this._simulator.signal({
      element: element,
      parentScope: scopes[0].parent
    });
  };

  return {
    action,
    element,
    html,
    scopes
  };
};

BoundaryEventHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

BoundaryEventHandler.$inject = [
  'simulator'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/handler/EventBasedGatewayHandler.js":
/*!*************************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/handler/EventBasedGatewayHandler.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EventBasedGatewayHandler)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");





function EventBasedGatewayHandler(simulator) {
  this._simulator = simulator;
}

EventBasedGatewayHandler.prototype.createContextPads = function(element) {
  const catchEvents = (
    element.outgoing.filter(
      outgoing => (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(outgoing, 'bpmn:SequenceFlow')
    ).map(
      outgoing => outgoing.target
    ).filter(
      element => (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:IntermediateCatchEvent') || (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:ReceiveTask')
    )
  );

  return catchEvents.map(
    element => this.createCatchEventPad(element)
  );
};

EventBasedGatewayHandler.prototype.createCatchEventPad = function(element) {

  const scopeElement = element.incoming.map(
    connection => connection.source
  ).find(
    element => (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:EventBasedGateway')
  );

  if (!scopeElement) {
    return;
  }

  const scopes = () => {
    return this._findScopes({
      element: scopeElement
    });
  };

  if (!scopes().length) {
    return;
  }

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  const action = (scopes) => {
    this._simulator.signal({
      element: element,
      scope: scopes[0]
    });
  };

  return {
    action,
    element,
    html,
    scopes
  };
};

EventBasedGatewayHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

EventBasedGatewayHandler.$inject = [
  'simulator'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/handler/ExclusiveGatewayHandler.js":
/*!************************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/handler/ExclusiveGatewayHandler.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExclusiveGatewayHandler)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");





function ExclusiveGatewayHandler(exclusiveGatewaySettings) {
  this._exclusiveGatewaySettings = exclusiveGatewaySettings;
}

ExclusiveGatewayHandler.prototype.createContextPads = function(element) {

  const outgoingFlows = element.outgoing.filter(function(outgoing) {
    return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(outgoing, 'bpmn:SequenceFlow');
  });

  if (outgoingFlows.length < 2) {
    return;
  }

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(
    '<div class="context-pad" title="Set Sequence Flow"><i class="fa fa-code-fork"></i></div>'
  );

  min_dom__WEBPACK_IMPORTED_MODULE_1__.event.bind(html, 'click', () => {
    this._exclusiveGatewaySettings.setSequenceFlow(element);
  });

  return [
    {
      element,
      html
    }
  ];
};

ExclusiveGatewayHandler.$inject = [
  'exclusiveGatewaySettings'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/handler/IntermediateCatchEventHandler.js":
/*!******************************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/handler/IntermediateCatchEventHandler.js ***!
  \******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ IntermeditateCatchEventHandler)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");



function IntermeditateCatchEventHandler(simulator) {
  this._simulator = simulator;
}

IntermeditateCatchEventHandler.prototype.createContextPads = function(element) {

  const scopes = () => this._findScopes(scope => {
    return (
      !scope.destroyed &&
      scope.element === element &&
      !scope.children.length
    );
  });

  if (!scopes().length) {
    return;
  }

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)(
    '<div class="context-pad" title="Trigger Event"><i class="fa fa-play"></i></div>'
  );

  const action = (scopes) => {
    this._simulator.signal({
      element,
      scope: scopes[0]
    });
  };

  return [
    {
      action,
      element,
      html,
      scopes
    }
  ];
};

IntermeditateCatchEventHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

IntermeditateCatchEventHandler.$inject = [
  'simulator'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/handler/StartEventHandler.js":
/*!******************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/handler/StartEventHandler.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StartEventHandler)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");





function StartEventHandler(simulator) {
  this._simulator = simulator;
}

StartEventHandler.prototype.createContextPads = function(element) {

  const startEvents = findStartEvents(element);

  const pads = startEvents.map(
    startEvent => this.createStartEventContextPad(startEvent, element)
  );

  return pads;
};

StartEventHandler.prototype.createStartEventContextPad = function(element, parent) {

  const parentElement = element.parent;

  let scopes;

  if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(parentElement, 'bpmn:SubProcess')) {

    if (!isEventSubProcess(parentElement)) {
      return;
    }

    scopes = () => this._findScopes({
      element: parentElement.parent
    });

    // no parent scope for event sub-process
    if (!scopes().length) {
      return;
    }
  }

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(
    '<div class="context-pad"><i class="fa fa-play"></i></div>'
  );

  const action = (scopes) => {
    const parentScope = scopes && scopes[0];

    this._simulator.signal({
      element: parentElement,
      startEvent: element,
      parentScope
    });
  };

  return {
    action,
    element,
    html,
    scopes
  };
};

StartEventHandler.prototype._findScopes = function(options) {
  return this._simulator.findScopes(options);
};

StartEventHandler.$inject = [
  'simulator'
];


// helpers //////////////

function findStartEvents(processElement) {

  const startEvents = processElement.businessObject.triggeredByEvent
    ? []
    : processElement.children.filter(isStartEvent);

  const eventSubProcesses = processElement.children.filter(isEventSubProcess);

  return eventSubProcesses.reduce((startEvents, subProcessElement) => {

    for (const subProcessChild of subProcessElement.children) {
      if (isStartEvent(subProcessChild)) {
        startEvents.push(subProcessChild);
      }
    }

    return startEvents;
  }, startEvents);
}

function isEventSubProcess(element) {
  return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject)(element).triggeredByEvent;
}

function isStartEvent(element) {
  return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:StartEvent');
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/context-pads/index.js":
/*!**********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/context-pads/index.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ContextPads__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ContextPads */ "../bpmn-js-token-simulation/lib/features/context-pads/ContextPads.js");
/* harmony import */ var _scope_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scope-filter */ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _scope_filter__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    'contextPads'
  ],
  contextPads: [ 'type', _ContextPads__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/disable-modeling/DisableModeling.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/disable-modeling/DisableModeling.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DisableModeling)
/* harmony export */ });
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");


const HIGH_PRIORITY = 10001;


function DisableModeling(
    eventBus,
    contextPad,
    dragging,
    directEditing,
    editorActions,
    modeling,
    palette,
    paletteProvider) {

  let modelingDisabled = false;

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, HIGH_PRIORITY, event => {

    modelingDisabled = event.active;

    if (modelingDisabled) {
      directEditing.cancel();
      contextPad.close();
      dragging.cancel();
    }

    palette._update();
  });

  function intercept(obj, fnName, cb) {
    const fn = obj[fnName];
    obj[fnName] = function() {
      return cb.call(this, fn, arguments);
    };
  }

  function ignoreIfModelingDisabled(obj, fnName) {
    intercept(obj, fnName, function(fn, args) {
      if (modelingDisabled) {
        return;
      }

      return fn.apply(this, args);
    });
  }

  function throwIfModelingDisabled(obj, fnName) {
    intercept(obj, fnName, function(fn, args) {
      if (modelingDisabled) {
        throw new Error('model is read-only');
      }

      return fn.apply(this, args);
    });
  }

  ignoreIfModelingDisabled(contextPad, 'open');

  ignoreIfModelingDisabled(dragging, 'init');

  ignoreIfModelingDisabled(directEditing, 'activate');

  ignoreIfModelingDisabled(dragging, 'init');

  ignoreIfModelingDisabled(directEditing, 'activate');

  throwIfModelingDisabled(modeling, 'moveShape');
  throwIfModelingDisabled(modeling, 'updateAttachment');
  throwIfModelingDisabled(modeling, 'moveElements');
  throwIfModelingDisabled(modeling, 'moveConnection');
  throwIfModelingDisabled(modeling, 'layoutConnection');
  throwIfModelingDisabled(modeling, 'createConnection');
  throwIfModelingDisabled(modeling, 'createShape');
  throwIfModelingDisabled(modeling, 'createLabel');
  throwIfModelingDisabled(modeling, 'appendShape');
  throwIfModelingDisabled(modeling, 'removeElements');
  throwIfModelingDisabled(modeling, 'distributeElements');
  throwIfModelingDisabled(modeling, 'removeShape');
  throwIfModelingDisabled(modeling, 'removeConnection');
  throwIfModelingDisabled(modeling, 'replaceShape');
  throwIfModelingDisabled(modeling, 'pasteElements');
  throwIfModelingDisabled(modeling, 'alignElements');
  throwIfModelingDisabled(modeling, 'resizeShape');
  throwIfModelingDisabled(modeling, 'createSpace');
  throwIfModelingDisabled(modeling, 'updateWaypoints');
  throwIfModelingDisabled(modeling, 'reconnectStart');
  throwIfModelingDisabled(modeling, 'reconnectEnd');

  intercept(editorActions, 'trigger', function(fn, args) {
    const action = args[0];

    if (modelingDisabled && isAnyAction([
      'undo',
      'redo',
      'copy',
      'paste',
      'removeSelection',
      'spaceTool',
      'lassoTool',
      'globalConnectTool',
      'distributeElements',
      'alignElements',
      'directEditing',
    ], action)) {
      return;
    }

    return fn.apply(this, args);
  });
}

DisableModeling.$inject = [
  'eventBus',
  'contextPad',
  'dragging',
  'directEditing',
  'editorActions',
  'modeling',
  'palette',
  'paletteProvider',
];


// helpers //////////

function isAnyAction(actions, action) {
  return actions.indexOf(action) > -1;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/disable-modeling/index.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/disable-modeling/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _DisableModeling__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DisableModeling */ "../bpmn-js-token-simulation/lib/features/disable-modeling/DisableModeling.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'disableModeling'
  ],
  disableModeling: [ 'type', _DisableModeling__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/editor-actions/EditorActions.js":
/*!********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/editor-actions/EditorActions.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EditorActions)
/* harmony export */ });
function EditorActions(
    eventBus,
    toggleMode,
    pauseSimulation,
    log,
    resetSimulation,
    editorActions
) {
  editorActions.register({
    toggleTokenSimulation: function() {
      toggleMode.toggleMode();
    }
  });

  editorActions.register({
    togglePauseTokenSimulation: function() {
      pauseSimulation.toggle();
    }
  });

  editorActions.register({
    resetTokenSimulation: function() {
      resetSimulation.resetSimulation();
    }
  });

  editorActions.register({
    toggleTokenSimulationLog: function() {
      log.toggle();
    }
  });
}

EditorActions.$inject = [
  'eventBus',
  'toggleMode',
  'pauseSimulation',
  'log',
  'resetSimulation',
  'editorActions'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/editor-actions/index.js":
/*!************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/editor-actions/index.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _EditorActions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EditorActions */ "../bpmn-js-token-simulation/lib/features/editor-actions/EditorActions.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'tokenSimulationEditorActions'
  ],
  tokenSimulationEditorActions: [ 'type', _EditorActions__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/element-notifications/ElementNotifications.js":
/*!**********************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/element-notifications/ElementNotifications.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ElementNotifications)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const OFFSET_TOP = -15;
const OFFSET_RIGHT = 15;


function ElementNotifications(overlays, eventBus) {
  this._overlays = overlays;

  eventBus.on([
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT,
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_CREATE_EVENT,
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT
  ], () => {
    this.clear();
  });
}

ElementNotifications.prototype.addElementNotification = function(element, options) {
  const position = {
    top: OFFSET_TOP,
    right: OFFSET_RIGHT
  };

  const {
    type,
    icon,
    text,
    scope = {}
  } = options;

  const colors = scope.colors;

  const colorMarkup = colors
    ? `style="color: ${colors.auxiliary}; background: ${colors.primary}"`
    : '';

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(`
    <div class="element-notification ${ type || '' }" ${colorMarkup}>
      ${ icon ? `<i class="fa ${ icon }"></i>` : '' }
      <span class="text">${ text }</span>
    </div>
  `);

  this._overlays.add(element, 'element-notification', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

ElementNotifications.prototype.clear = function() {
  this._overlays.remove({ type: 'element-notification' });
};

ElementNotifications.prototype.removeElementNotification = function(element) {
  this._overlays.remove({ element: element });
};

ElementNotifications.$inject = [ 'overlays', 'eventBus' ];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/element-notifications/index.js":
/*!*******************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/element-notifications/index.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ElementNotifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ElementNotifications */ "../bpmn-js-token-simulation/lib/features/element-notifications/ElementNotifications.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  elementNotifications: [ 'type', _ElementNotifications__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/element-support/ElementSupport.js":
/*!**********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/element-support/ElementSupport.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ElementSupport)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");







const UNSUPPORTED_ELEMENTS = [
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway'
];

function isLabel(element) {
  return element.labelTarget;
}


function ElementSupport(
    eventBus, elementRegistry, canvas,
    notifications, elementNotifications) {

  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._elementNotifications = elementNotifications;
  this._notifications = notifications;

  this._canvasParent = canvas.getContainer().parentNode;

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, event => {

    if (event.active) {
      this.enable();
    } else {
      this.clear();
    }
  });
}

ElementSupport.prototype.getUnsupportedElements = function() {
  return this._unsupportedElements;
};

ElementSupport.prototype.enable = function() {

  const unsupportedElements = [];

  this._elementRegistry.forEach(element => {

    if (isLabel(element)) {
      return;
    }

    if (!(0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_1__.is)(element, UNSUPPORTED_ELEMENTS)) {
      return;
    }

    this.showWarning(element);

    unsupportedElements.push(element);
  });

  if (unsupportedElements.length) {

    this._notifications.showNotification({
      text: 'Found unsupported elements',
      icon: 'fa-exclamation-triangle',
      type: 'warning',
      ttl: 5000
    });
  }

  this._unsupportedElements = unsupportedElements;
};

ElementSupport.prototype.clear = function() {
  (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(this._canvasParent).remove('warning');
};

ElementSupport.prototype.showWarning = function(element) {
  this._elementNotifications.addElementNotification(element, {
    type: 'warning',
    icon: 'fa-exclamation-triangle',
    text: 'Not supported'
  });
};

ElementSupport.$inject = [
  'eventBus',
  'elementRegistry',
  'canvas',
  'notifications',
  'elementNotifications'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/element-support/index.js":
/*!*************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/element-support/index.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ElementSupport__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ElementSupport */ "../bpmn-js-token-simulation/lib/features/element-support/ElementSupport.js");
/* harmony import */ var _element_notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../element-notifications */ "../bpmn-js-token-simulation/lib/features/element-notifications/index.js");
/* harmony import */ var _notifications__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../notifications */ "../bpmn-js-token-simulation/lib/features/notifications/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _element_notifications__WEBPACK_IMPORTED_MODULE_0__.default,
    _notifications__WEBPACK_IMPORTED_MODULE_1__.default
  ],
  __init__: [ 'elementSupport' ],
  elementSupport: [ 'type', _ElementSupport__WEBPACK_IMPORTED_MODULE_2__.default ]
});


/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/element-wait/ElementWait.js":
/*!****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/element-wait/ElementWait.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ElementWait)
/* harmony export */ });
/* harmony import */ var min_dash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dash */ "../bpmn-js-token-simulation/node_modules/min-dash/dist/index.esm.js");
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");






function ElementWait(eventBus, elementRegistry, simulator) {

  this._types = new Set([
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ]);

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_AUTOMATIC_MODE_EVENT, (ctx) => {

    let elementsToUpdate = elementRegistry.filter(el => {
      return (0,min_dash__WEBPACK_IMPORTED_MODULE_1__.some)([...this._types], type => (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_2__.is)(el, type));
    });

    elementsToUpdate.forEach(element => {
      simulator.waitAtElement(element, !ctx.automaticMode);
    });
  });

  this.waitForType = function(type) {
    this._types.add(type);
  };

  this.stopWaitingForType = function(type) {
    this._types.delete(type);
  };
}

ElementWait.$inject = ['eventBus', 'elementRegistry', 'simulator'];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/element-wait/index.js":
/*!**********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/element-wait/index.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ElementWait__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ElementWait */ "../bpmn-js-token-simulation/lib/features/element-wait/ElementWait.js");
/* harmony import */ var _toggle_automatic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../toggle-automatic */ "../bpmn-js-token-simulation/lib/features/toggle-automatic/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _toggle_automatic__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    'elementWait'
  ],
  elementWait: [ 'type', _ElementWait__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/exclusive-gateway-settings/ExclusiveGatewaySettings.js":
/*!*******************************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/exclusive-gateway-settings/ExclusiveGatewaySettings.js ***!
  \*******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExclusiveGatewaySettings)
/* harmony export */ });
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const STYLE = getComputedStyle(document.documentElement);

const NOT_SELECTED_COLOR = STYLE.getPropertyValue('--token-simulation-grey-lighten-56');
const SELECTED_COLOR = STYLE.getPropertyValue('--token-simulation-grey-darken-30');


function getNext(gateway, sequenceFlow) {
  var outgoing = gateway.outgoing.filter(isSequenceFlow);

  var index = outgoing.indexOf(sequenceFlow || gateway.sequenceFlow);

  if (outgoing[index + 1]) {
    return outgoing[index + 1];
  } else {
    return outgoing[0];
  }
}

function isSequenceFlow(connection) {
  return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(connection, 'bpmn:SequenceFlow');
}


function ExclusiveGatewaySettings(
    eventBus, elementRegistry,
    graphicsFactory, simulator) {

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
  this._simulator = simulator;

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_MODE_EVENT, event => {
    if (event.active) {
      this.setSequenceFlowsDefault();
    } else {
      this.resetSequenceFlows();
    }
  });
}

ExclusiveGatewaySettings.prototype.setSequenceFlowsDefault = function() {
  const exclusiveGateways = this._elementRegistry.filter(element => {
    return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:ExclusiveGateway');
  });

  for (const gateway of exclusiveGateways) {
    this.setSequenceFlow(gateway);
  }
};

ExclusiveGatewaySettings.prototype.resetSequenceFlows = function() {

  const exclusiveGateways = this._elementRegistry.filter(element => {
    return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:ExclusiveGateway');
  });

  exclusiveGateways.forEach(exclusiveGateway => {
    if (exclusiveGateway.outgoing.filter(isSequenceFlow).length) {
      this.resetSequenceFlow(exclusiveGateway);
    }
  });
};

ExclusiveGatewaySettings.prototype.resetSequenceFlow = function(gateway) {
  this._simulator.setConfig(gateway, { activeOutgoing: undefined });
};

ExclusiveGatewaySettings.prototype.setSequenceFlow = function(gateway) {

  const outgoing = gateway.outgoing.filter(isSequenceFlow);

  if (!outgoing.length) {
    return;
  }

  const {
    activeOutgoing
  } = this._simulator.getConfig(gateway);

  let newActiveOutgoing;

  if (activeOutgoing) {

    // set next sequence flow
    newActiveOutgoing = getNext(gateway, activeOutgoing);
  } else {

    // set first sequence flow
    newActiveOutgoing = outgoing[ 0 ];
  }

  this._simulator.setConfig(gateway, { activeOutgoing: newActiveOutgoing });

  // set colors
  gateway.outgoing.forEach(outgoing => {
    this.setColor(
      outgoing, outgoing === newActiveOutgoing ? SELECTED_COLOR : NOT_SELECTED_COLOR
    );
  });
};

ExclusiveGatewaySettings.prototype.setColor = function(sequenceFlow, color) {

  const label = sequenceFlow.label;
  const businessObject = sequenceFlow.businessObject;

  businessObject.di.set('stroke', color);

  const gfx = this._elementRegistry.getGraphics(sequenceFlow);

  this._graphicsFactory.update('connection', sequenceFlow, gfx);

  if (label) {
    this._graphicsFactory.update('connection', label, this._elementRegistry.getGraphics(label));
  }
};

ExclusiveGatewaySettings.$inject = [
  'eventBus',
  'elementRegistry',
  'graphicsFactory',
  'simulator'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/exclusive-gateway-settings/index.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/exclusive-gateway-settings/index.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ExclusiveGatewaySettings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ExclusiveGatewaySettings */ "../bpmn-js-token-simulation/lib/features/exclusive-gateway-settings/ExclusiveGatewaySettings.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  exclusiveGatewaySettings: [ 'type', _ExclusiveGatewaySettings__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/keyboard-bindings/KeyboardBindings.js":
/*!**************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/keyboard-bindings/KeyboardBindings.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ KeyboardBindings)
/* harmony export */ });
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");


const VERY_HIGH_PRIORITY = 10000;


function KeyboardBindings(eventBus, injector) {

  var editorActions = injector.get('editorActions', false),
      keyboard = injector.get('keyboard', false);

  if (!keyboard || !editorActions) {
    return;
  }


  var isActive = false;


  function handleKeyEvent(keyEvent) {
    if (isKey([ 't', 'T' ], keyEvent)) {
      editorActions.trigger('toggleTokenSimulation');

      return true;
    }

    if (!isActive) {
      return;
    }

    if (isKey([ 'l', 'L' ], keyEvent)) {
      editorActions.trigger('toggleTokenSimulationLog');

      return true;
    }

    // see https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/key/Key_Values#Whitespace_keys
    if (isKey([ ' ', 'Spacebar' ], keyEvent)) {
      editorActions.trigger('togglePauseTokenSimulation');

      return true;
    }

    if (isKey([ 'r', 'R' ], keyEvent)) {
      editorActions.trigger('resetTokenSimulation');

      return true;
    }
  }


  eventBus.on('keyboard.init', function() {

    keyboard.addListener(VERY_HIGH_PRIORITY, function(event) {
      var keyEvent = event.keyEvent;

      handleKeyEvent(keyEvent);
    });

  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, function(context) {
    var active = context.active;

    if (active) {
      isActive = true;
    } else {
      isActive = false;
    }
  });

}

KeyboardBindings.$inject = [ 'eventBus', 'injector' ];


// helpers //////////

function isKey(keys, event) {
  return keys.indexOf(event.key) > -1;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/keyboard-bindings/index.js":
/*!***************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/keyboard-bindings/index.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _KeyboardBindings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./KeyboardBindings */ "../bpmn-js-token-simulation/lib/features/keyboard-bindings/KeyboardBindings.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'tokenSimulationKeyboardBindings'
  ],
  tokenSimulationKeyboardBindings: [ 'type', _KeyboardBindings__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/log/Log.js":
/*!***********************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/log/Log.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Log)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");
/* harmony import */ var diagram_js_lib_util_EscapeUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! diagram-js/lib/util/EscapeUtil */ "../bpmn-js-token-simulation/node_modules/diagram-js/lib/util/EscapeUtil.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");









function getElementName(element) {
  const name = element && element.businessObject.name;

  return name && (0,diagram_js_lib_util_EscapeUtil__WEBPACK_IMPORTED_MODULE_0__.escapeHTML)(name);
}


function Log(
    eventBus, notifications,
    tokenSimulationPalette, canvas,
    scopeFilter, simulator) {

  this._notifications = notifications;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;

  this._init();

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.SCOPE_FILTER_CHANGED_EVENT, event => {
    const allElements = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.queryAll)('.entry[data-scope-id]', this._container);

    for (const element of allElements) {
      const scopeId = element.dataset.scopeId;

      (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(element).toggle('inactive', !this._scopeFilter.isShown(scopeId));
    }
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    const {
      destroyContext,
      element: scopeElement
    } = scope;

    const {
      reason
    } = destroyContext;

    const isCompletion = reason === 'complete';

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant',
      'bpmn:SubProcess'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    const isSubProcess = (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(scopeElement, 'bpmn:SubProcess');

    const text = `${
      isSubProcess ? (getElementName(scopeElement) || 'SubProcess') : 'Process'
    } ${
      isCompletion ? 'finished' : 'canceled'
    }`;

    this.log({
      text,
      icon: isCompletion ? 'fa-check-circle' : 'fa-times-circle',
      scope
    });
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.SCOPE_CREATE_EVENT, event => {
    const {
      scope
    } = event;

    const {
      element: scopeElement
    } = scope;

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant',
      'bpmn:SubProcess'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    const isSubProcess = (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(scopeElement, 'bpmn:SubProcess');

    const text = `${
      isSubProcess ? (getElementName(scopeElement) || 'SubProcess') : 'Process'
    } started`;

    this.log({
      text,
      icon: 'fa-check-circle',
      scope
    });
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TRACE_EVENT, event => {

    const {
      action,
      scope: elementScope,
      element
    } = event;

    if (action !== 'exit') {
      return;
    }

    const scope = elementScope.parent;

    const elementName = getElementName(element);

    if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:BusinessRuleTask')) {
      this.log({
        text: elementName || 'Business Rule Task',
        icon: 'bpmn-icon-business-rule',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:CallActivity')) {
      this.log({
        text: elementName || 'Call Activity',
        icon: 'bpmn-icon-call-activity',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:IntermediateCatchEvent') || (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:IntermediateThrowEvent')) {
      this.log({
        text: elementName || 'Intermediate Event',
        icon: 'bpmn-icon-intermediate-event-none',
        scope
      });
    } if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:BoundaryEvent')) {
      this.log({
        text: elementName || 'Boundary Event',
        icon: 'bpmn-icon-intermediate-event-none',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:ManualTask')) {
      this.log({
        text: elementName || 'Manual Task',
        icon: 'bpmn-icon-manual',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:ScriptTask')) {
      this.log({
        text: elementName || 'Script Task',
        icon: 'bpmn-icon-script',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:ServiceTask')) {
      this.log({
        text: elementName || 'Service Task',
        icon: 'bpmn-icon-service',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:Task')) {
      this.log({
        text: elementName || 'Task',
        icon: 'bpmn-icon-task',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:UserTask')) {
      this.log({
        text: elementName || 'User Task',
        icon: 'bpmn-icon-user',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:ExclusiveGateway')) {
      if (element.outgoing.length < 2) {
        return;
      }

      const sequenceFlowName = getElementName(element.sequenceFlow);

      let text = elementName || 'Gateway';

      if (sequenceFlowName) {
        text = text.concat(' <i class="fa fa-angle-right" aria-hidden="true"></i> ' + sequenceFlowName);
      }

      this.log({
        text,
        icon: 'bpmn-icon-gateway-xor',
        scope
      });
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:EndEvent')) {
      if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.isTypedEvent)((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.getBusinessObject)(element), 'bpmn:TerminateEventDefinition')) {
        this.log({
          text: elementName || 'Terminate End Event',
          icon: 'bpmn-icon-end-event-terminate',
          scope
        });
      } else {
        this.log({
          text: elementName || 'End Event',
          icon: 'bpmn-icon-end-event-none',
          scope
        });
      }
    } else if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_3__.is)(element, 'bpmn:StartEvent')) {
      this.log({
        text: elementName || 'Start Event',
        icon: 'bpmn-icon-start-event-none',
        scope
      });
    }
  });


  eventBus.on([
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_MODE_EVENT,
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.RESET_SIMULATION_EVENT
  ], event => {
    this.clear();

    (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(this._container).add('hidden');
  });
}

Log.prototype._init = function() {
  this._container = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(
    '<div class="token-simulation-log hidden">' +
      '<div class="header">' +
        '<i class="fa fa-align-left"></i>' +
        '<button class="close">' +
          '<i class="fa fa-times" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<div class="content">' +
        '<p class="entry placeholder">No Entries</p>' +
      '</div>' +
    '</div>'
  );

  this._placeholder = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('.placeholder', this._container);

  this._content = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('.content', this._container);

  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this._content, 'wheel', event => {
    event.stopPropagation();
  });

  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this._content, 'mousedown', event => {
    event.stopPropagation();
  });

  this._close = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('.close', this._container);

  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this._close, 'click', () => {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(this._container).add('hidden');
  });

  this._icon = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.query)('.fa-align-left', this._container);

  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this._icon, 'click', () => {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(this._container).add('hidden');
  });

  this._canvas.getContainer().appendChild(this._container);

  this.paletteEntry = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(`
    <div class="entry" title="Show Simulation Log">
      <i class="fa fa-align-left"></i>
    </div>
  `);

  min_dom__WEBPACK_IMPORTED_MODULE_2__.event.bind(this.paletteEntry, 'click', () => {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(this._container).remove('hidden');
  });

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 3);
};

Log.prototype.toggle = function() {
  const container = this._container;

  if ((0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(container).has('hidden')) {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(container).remove('hidden');
  } else {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(container).add('hidden');
  }
};

Log.prototype.log = function(options) {

  const {
    text,
    type = 'info',
    icon = 'fa-info',
    scope
  } = options;

  (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.classes)(this._placeholder).add('hidden');

  const date = new Date();

  const dateString = date.toLocaleTimeString() + ':' + date.getUTCMilliseconds();

  this._notifications.showNotification(options);

  const iconMarkup = `<i class="${icon} ${
    icon.includes('bpmn') ? '' : 'fa'
  } ${icon}"></i>`;

  const colors = scope && scope.colors;

  const colorMarkup = colors ? `style="background: ${colors.primary}; color: ${colors.auxiliary}"` : '';

  const logEntry = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)(`
    <p class="entry ${ type } ${
      scope && this._scopeFilter.isShown(scope) ? '' : 'inactive'
    }" ${
      scope ? `data-scope-id="${scope.id}"` : ''
    }>
      <span class="date">${ dateString }</span>
      <span class="icon">${iconMarkup}</span>
      <span class="text">${text}</span>
      ${
        scope
          ? `<span class="scope" data-scope-id="${scope.id}" ${colorMarkup}>${scope.id}</span>`
          : ''
      }
    </p>
  `);

  min_dom__WEBPACK_IMPORTED_MODULE_2__.delegate.bind(logEntry, '.scope[data-scope-id]', 'click', event => {
    this._scopeFilter.toggle(scope);
  });

  this._content.appendChild(logEntry);

  this._content.scrollTop = this._content.scrollHeight;
};

Log.prototype.clear = function() {
  while (this._content.firstChild) {
    this._content.removeChild(this._content.firstChild);
  }

  this._placeholder = (0,min_dom__WEBPACK_IMPORTED_MODULE_2__.domify)('<p class="entry placeholder">No Entries</p>');

  this._content.appendChild(this._placeholder);
};

Log.$inject = [
  'eventBus',
  'notifications',
  'tokenSimulationPalette',
  'canvas',
  'scopeFilter',
  'simulator'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/log/index.js":
/*!*************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/log/index.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Log */ "../bpmn-js-token-simulation/lib/features/log/Log.js");
/* harmony import */ var _scope_filter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scope-filter */ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js");
/* harmony import */ var _notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../notifications */ "../bpmn-js-token-simulation/lib/features/notifications/index.js");





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _notifications__WEBPACK_IMPORTED_MODULE_0__.default,
    _scope_filter__WEBPACK_IMPORTED_MODULE_1__.default
  ],
  __init__: [
    'log'
  ],
  log: [ 'type', _Log__WEBPACK_IMPORTED_MODULE_2__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/notifications/Notifications.js":
/*!*******************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/notifications/Notifications.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Notifications)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const NOTIFICATION_TIME_TO_LIVE = 2000; // ms


function Notifications(eventBus, canvas, scopeFilter) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._scopeFilter = scopeFilter;

  this._init();

  eventBus.on([
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT,
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT
  ], event => {
    this.clear();
  });
}

Notifications.prototype._init = function() {
  this.container = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)('<div class="notifications"></div>');

  this._canvas.getContainer().appendChild(this.container);
};

Notifications.prototype.showNotification = function(options) {

  const {
    text,
    type = 'info',
    icon = 'fa-info',
    scope,
    ttl = NOTIFICATION_TIME_TO_LIVE
  } = options;

  if (scope && !this._scopeFilter.isShown(scope)) {
    return;
  }

  const iconMarkup = `<i class="${icon} ${
    icon.includes('bpmn') ? '' : 'fa'
  } ${icon}"></i>`;

  const colors = scope && scope.colors;

  const colorMarkup = colors ? `style="color: ${colors.auxiliary}; background: ${colors.primary}"` : '';

  const notification = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(`
    <div class="notification ${type}">
      <span class="icon">${iconMarkup}</span>
      <span class="text">${text}</span>
      ${ scope ? `<span class="scope" ${colorMarkup}>${scope.id}</span>` : '' }
    </div>
  `);

  this.container.appendChild(notification);

  // prevent more than 5 notifications at once
  while (this.container.children.length > 5) {
    this.container.children[0].remove();
  }

  setTimeout(function() {
    notification.remove();
  }, ttl);
};

Notifications.prototype.clear = function() {
  while (this.container.children.length) {
    this.container.children[0].remove();
  }
};

Notifications.$inject = [
  'eventBus',
  'canvas',
  'scopeFilter'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/notifications/index.js":
/*!***********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/notifications/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _scope_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scope-filter */ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js");
/* harmony import */ var _Notifications__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Notifications */ "../bpmn-js-token-simulation/lib/features/notifications/Notifications.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _scope_filter__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  notifications: [ 'type', _Notifications__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/palette/Palette.js":
/*!*******************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/palette/Palette.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Palette)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");





function Palette(eventBus, canvas) {
  var self = this;

  this._canvas = canvas;

  this.entries = [];

  this._init();

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, function(context) {
    var active = context.active;

    if (active) {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(self.container).remove('hidden');
    } else {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(self.container).add('hidden');
    }
  });
}

Palette.prototype._init = function() {
  this.container = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)('<div class="token-simulation-palette hidden"></div>');

  this._canvas.getContainer().appendChild(this.container);
};

Palette.prototype.addEntry = function(entry, index) {
  var childIndex = 0;

  this.entries.forEach(function(entry) {
    if (index >= entry.index) {
      childIndex++;
    }
  });

  this.container.insertBefore(entry, this.container.childNodes[childIndex]);

  this.entries.push({
    entry: entry,
    index: index
  });
};

Palette.$inject = [ 'eventBus', 'canvas' ];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/palette/index.js":
/*!*****************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/palette/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Palette__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Palette */ "../bpmn-js-token-simulation/lib/features/palette/Palette.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'tokenSimulationPalette'
  ],
  tokenSimulationPalette: [ 'type', _Palette__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/pause-simulation/PauseSimulation.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/pause-simulation/PauseSimulation.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PauseSimulation)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const PLAY_MARKUP = '<i class="fa fa-play"></i>';
const PAUSE_MARKUP = '<i class="fa fa-pause"></i>';

const HIGH_PRIORITY = 1500;


function PauseSimulation(
    eventBus, tokenSimulationPalette,
    notifications, canvas) {

  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._notifications = notifications;

  this.canvasParent = canvas.getContainer().parentNode;

  this.isActive = false;
  this.isPaused = true;

  this._init();

  // unpause on simulation start
  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_CREATE_EVENT, HIGH_PRIORITY, event => {
    this.activate();
    this.unpause();
  });

  eventBus.on([
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT,
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT
  ], () => {
    this.deactivate();
    this.pause();
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TRACE_EVENT, HIGH_PRIORITY, event => {
    this.unpause();
  });
}

PauseSimulation.prototype._init = function() {
  this.paletteEntry = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(
    '<div class="entry disabled" title="Play/Pause Simulation">' +
      PLAY_MARKUP +
    '</div>'
  );

  min_dom__WEBPACK_IMPORTED_MODULE_1__.event.bind(this.paletteEntry, 'click', this.toggle.bind(this));

  this._tokenSimulationPalette.addEntry(this.paletteEntry, 1);
};

PauseSimulation.prototype.toggle = function() {
  if (this.isPaused) {
    this.unpause();
  } else {
    this.pause();
  }
};

PauseSimulation.prototype.pause = function() {
  if (!this.isActive) {
    return;
  }

  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.paletteEntry).remove('active');
  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.canvasParent).add('paused');

  this.paletteEntry.innerHTML = PLAY_MARKUP;

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.PAUSE_SIMULATION_EVENT);

  this._notifications.showNotification({
    text: 'Pause Simulation'
  });

  this.isPaused = true;
};

PauseSimulation.prototype.unpause = function() {

  if (!this.isActive || !this.isPaused) {
    return;
  }

  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.paletteEntry).add('active');
  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.canvasParent).remove('paused');

  this.paletteEntry.innerHTML = PAUSE_MARKUP;

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.PLAY_SIMULATION_EVENT);

  this._notifications.showNotification({
    text: 'Play Simulation'
  });

  this.isPaused = false;
};

PauseSimulation.prototype.activate = function() {
  this.isActive = true;

  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.paletteEntry).remove('disabled');
};

PauseSimulation.prototype.deactivate = function() {
  this.isActive = false;

  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.paletteEntry).remove('active');
  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this.paletteEntry).add('disabled');
};

PauseSimulation.$inject = [
  'eventBus',
  'tokenSimulationPalette',
  'notifications',
  'canvas'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/pause-simulation/index.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/pause-simulation/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _PauseSimulation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./PauseSimulation */ "../bpmn-js-token-simulation/lib/features/pause-simulation/PauseSimulation.js");
/* harmony import */ var _notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../notifications */ "../bpmn-js-token-simulation/lib/features/notifications/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _notifications__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    'pauseSimulation'
  ],
  pauseSimulation: [ 'type', _PauseSimulation__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/preserve-element-colors/PreserveElementColors.js":
/*!*************************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/preserve-element-colors/PreserveElementColors.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PreserveElementColors)
/* harmony export */ });
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");


const VERY_HIGH_PRIORITY = 50000;


function PreserveElementColors(
    eventBus, elementRegistry, graphicsFactory) {

  this._elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;

  this._elementColors = {};

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, VERY_HIGH_PRIORITY, event => {
    const active = event.active;

    if (active) {
      this.preserveColors();
    } else {
      this.resetColors();
    }
  });
}

PreserveElementColors.prototype.preserveColors = function() {
  this._elementRegistry.forEach(element => {
    this._elementColors[element.id] = {
      stroke: element.businessObject.di.get('stroke'),
      fill: element.businessObject.di.get('fill')
    };

    this.setColor(element, '#000', '#fff');
  });
};

PreserveElementColors.prototype.resetColors = function() {
  const elementColors = this._elementColors;

  this._elementRegistry.forEach(element => {
    if (elementColors[element.id]) {
      this.setColor(element, elementColors[element.id].stroke, elementColors[element.id].fill);
    }
  });

  this._elementColors = {};
};

PreserveElementColors.prototype.setColor = function(element, stroke, fill) {
  const businessObject = element.businessObject;

  businessObject.di.set('stroke', stroke);
  businessObject.di.set('fill', fill);

  const gfx = this._elementRegistry.getGraphics(element);

  const type = element.waypoints ? 'connection' : 'shape';

  this._graphicsFactory.update(type, element, gfx);
};

PreserveElementColors.$inject = [
  'eventBus',
  'elementRegistry',
  'graphicsFactory'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/preserve-element-colors/index.js":
/*!*********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/preserve-element-colors/index.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _PreserveElementColors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PreserveElementColors */ "../bpmn-js-token-simulation/lib/features/preserve-element-colors/PreserveElementColors.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'preserveElementColors'
  ],
  preserveElementColors: [ 'type', _PreserveElementColors__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/reset-simulation/ResetSimulation.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/reset-simulation/ResetSimulation.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ResetSimulation)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");





function ResetSimulation(eventBus, tokenSimulationPalette, notifications) {
  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this._notifications = notifications;

  this._init();

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_CREATE_EVENT, () => {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this._paletteEntry).remove('disabled');
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, (event) => {
    const active = this._active = event.active;

    if (!active) {
      this.resetSimulation();
    }
  });
}

ResetSimulation.prototype._init = function() {
  this._paletteEntry = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(
    '<div class="entry disabled" title="Reset Simulation"><i class="fa fa-refresh"></i></div>'
  );

  min_dom__WEBPACK_IMPORTED_MODULE_1__.event.bind(this._paletteEntry, 'click', () => {
    this.resetSimulation();

    this._notifications.showNotification({
      text: 'Reset Simulation',
      type: 'info'
    });
  });

  this._tokenSimulationPalette.addEntry(this._paletteEntry, 2);
};

ResetSimulation.prototype.resetSimulation = function() {
  (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this._paletteEntry).add('disabled');

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT);
};

ResetSimulation.$inject = [
  'eventBus',
  'tokenSimulationPalette',
  'notifications'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/reset-simulation/index.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/reset-simulation/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ResetSimulation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ResetSimulation */ "../bpmn-js-token-simulation/lib/features/reset-simulation/ResetSimulation.js");
/* harmony import */ var _notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../notifications */ "../bpmn-js-token-simulation/lib/features/notifications/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _notifications__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    'resetSimulation'
  ],
  resetSimulation: [ 'type', _ResetSimulation__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/scope-filter/ScopeFilter.js":
/*!****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/scope-filter/ScopeFilter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ScopeFilter)
/* harmony export */ });
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");


const DEFAULT_SCOPE_FILTER = (s) => true;


function ScopeFilter(eventBus, simulator) {
  this._eventBus = eventBus;
  this._simulator = simulator;

  this._filter = DEFAULT_SCOPE_FILTER;

  eventBus.on([
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT,
    _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT
  ], () => {
    this._filter = DEFAULT_SCOPE_FILTER;
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_DESTROYED_EVENT, event => {

    const {
      scope
    } = event;

    // if we're currently filtering, ensure newly
    // created instance is shown

    if (this._scope === scope && scope.parent) {
      this.toggle(scope.parent);
    }
  });


  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_CREATE_EVENT, event => {

    const {
      scope
    } = event;

    // if we're currently filtering, ensure newly
    // created instance is shown

    if (!scope.parent && this._scope && !isAncestor(this._scope, scope)) {
      this.toggle(null);
    }
  });
}

ScopeFilter.prototype.toggle = function(scope) {

  const setFilter = this._scope !== scope;

  this._scope = setFilter ? scope : null;

  this._filter =
    this._scope
      ? s => isAncestor(this._scope, s)
      : s => true;

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_FILTER_CHANGED_EVENT, {
    filter: this._filter,
    scope: this._scope
  });
};

ScopeFilter.prototype.isShown = function(scope) {

  if (typeof scope === 'string') {
    scope = this._simulator.findScope(s => s.id === scope);
  }

  return scope && this._filter(scope);
};

ScopeFilter.prototype.findScope = function(options) {
  return this._simulator.findScopes(options).filter(s => this.isShown(s))[0];
};

ScopeFilter.$inject = [
  'eventBus',
  'simulator'
];

function isAncestor(parent, scope) {
  do {
    if (parent === scope) {
      return true;
    }
  } while ((scope = scope.parent));

  return false;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js":
/*!**********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/scope-filter/index.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ScopeFilter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ScopeFilter */ "../bpmn-js-token-simulation/lib/features/scope-filter/ScopeFilter.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  scopeFilter: [ 'type', _ScopeFilter__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/set-animation-speed/SetAnimationSpeed.js":
/*!*****************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/set-animation-speed/SetAnimationSpeed.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SetAnimationSpeed)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const SPEEDS = [
  [ 'Slow', 0.5 ],
  [ 'Normal', 1 ],
  [ 'Fast', 2 ]
];

function SetAnimationSpeed(canvas, animation, eventBus) {
  this._canvas = canvas;
  this._animation = animation;
  this._eventBus = eventBus;

  this.palette = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.query)('.animation-palette', this._canvas.getContainer());
  if (!this.palette) {
    this.palette = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)('<div class="animation-palette"></div>');
    this._canvas.getContainer().appendChild(this.palette);
  }

  this._init(animation.getAnimationSpeed());

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_MODE_EVENT, event => {
    const active = event.active;

    if (!active) {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this._container).add('hidden');
    } else {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this._container).remove('hidden');
    }
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.ANIMATION_SPEED_CHANGED_EVENT, event => {
    this.setActive(event.speed);
  });
}

SetAnimationSpeed.prototype.getToggleSpeed = function(element) {
  return parseFloat(element.dataset.speed);
};

SetAnimationSpeed.prototype._init = function(animationSpeed) {
  this._container = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)(`
    <div class="set-animation-speed hidden">
      <i title="Set Animation Speed" class="fa fa-tachometer" aria-hidden="true"></i>
      <div class="animation-speed-buttons">
        ${
          SPEEDS.map(([ label, speed ], idx) => `
            <div title="${ label }" data-speed="${ speed }" class="animation-speed-button ${speed === animationSpeed ? 'active' : ''}">
              ${
                Array.from({ length: idx + 1 }).map(
                  () => '<i class="fa fa-angle-right" aria-hidden="true"></i>'
                ).join('')
              }
            </div>
          `).join('')
        }
      </div>
    </div>
  `);

  min_dom__WEBPACK_IMPORTED_MODULE_0__.delegate.bind(this._container, '[data-speed]', 'click', event => {

    const toggle = event.delegateTarget;

    const speed = this.getToggleSpeed(toggle);

    this._animation.setAnimationSpeed(speed);
  });

  this.palette.appendChild(this._container);
};

SetAnimationSpeed.prototype.setActive = function(speed) {
  (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.queryAll)('[data-speed]', this._container).forEach(toggle => {

    const active = this.getToggleSpeed(toggle) === speed;

    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(toggle)[active ? 'add' : 'remove']('active');
  });
};

SetAnimationSpeed.$inject = [
  'canvas',
  'animation',
  'eventBus'
];


/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/set-animation-speed/index.js":
/*!*****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/set-animation-speed/index.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _SetAnimationSpeed__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SetAnimationSpeed */ "../bpmn-js-token-simulation/lib/features/set-animation-speed/SetAnimationSpeed.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'setAnimationSpeed'
  ],
  setAnimationSpeed: [ 'type', _SetAnimationSpeed__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/show-scopes/ShowScopes.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/show-scopes/ShowScopes.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ShowScopes)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");




const STYLE = getComputedStyle(document.documentElement);

const FILL_COLOR = STYLE.getPropertyValue('--token-simulation-silver-base-97');
const STROKE_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');


function ShowScopes(
    eventBus,
    canvas,
    graphicsFactory,
    elementRegistry,
    scopeFilter) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._graphicsFactory = graphicsFactory;
  this._elementRegistry = elementRegistry;
  this._scopeFilter = scopeFilter;

  this._highlight = null;

  this._init();

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.TOGGLE_MODE_EVENT, event => {
    const active = event.active;

    if (active) {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this._container).remove('hidden');
    } else {
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this._container).add('hidden');
      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.clear)(this._container);

      this.unhighlightScope();
    }
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_FILTER_CHANGED_EVENT, event => {

    const allElements = this.getScopeElements();

    for (const element of allElements) {
      const scopeId = element.dataset.scopeId;

      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(element).toggle('inactive', !this._scopeFilter.isShown(scopeId));
    }
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_CREATE_EVENT, event => {
    this.addScope(event.scope);
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_DESTROYED_EVENT, event => {
    this.removeScope(event.scope);
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_CHANGED_EVENT, event => {
    this.updateScope(event.scope);
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.RESET_SIMULATION_EVENT, () => {
    this.removeAllInstances();
  });
}

ShowScopes.prototype._init = function() {
  this._container = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)('<div class="token-simulation-scopes hidden"></div>');

  this._canvas.getContainer().appendChild(this._container);
};

ShowScopes.prototype.addScope = function(scope) {

  const processElements = [
    'bpmn:Process',
    'bpmn:SubProcess',
    'bpmn:Participant'
  ];

  const {
    element: scopeElement
  } = scope;

  if (!processElements.includes(scopeElement.type)) {
    return;
  }

  const colors = scope.colors;

  const colorMarkup = colors ? `style="color: ${colors.auxiliary}; background: ${colors.primary}"` : '';

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(`
    <div data-scope-id="${scope.id}" class="scope"
         title="View Process Instance ${scope.id}" ${colorMarkup}>
      ${scope.getTokens()}
    </div>
  `);

  min_dom__WEBPACK_IMPORTED_MODULE_1__.event.bind(html, 'click', () => {
    this._scopeFilter.toggle(scope);
  });

  min_dom__WEBPACK_IMPORTED_MODULE_1__.event.bind(html, 'mouseenter', () => {
    this.highlightScope(scopeElement);
  });

  min_dom__WEBPACK_IMPORTED_MODULE_1__.event.bind(html, 'mouseleave', () => {
    this.unhighlightScope();
  });

  if (!this._scopeFilter.isShown(scope)) {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(html).add('inactive');
  }

  this._container.appendChild(html);
};

ShowScopes.prototype.getScopeElements = function() {
  return (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.queryAll)('[data-scope-id]', this._container);
};

ShowScopes.prototype.getScopeElement = function(scope) {
  return (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.query)(`[data-scope-id="${scope.id}"]`, this._container);
};

ShowScopes.prototype.updateScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    element.textContent = scope.getTokens();
  }
};

ShowScopes.prototype.removeScope = function(scope) {
  const element = this.getScopeElement(scope);

  if (element) {
    element.remove();
  }
};

ShowScopes.prototype.removeAllInstances = function() {
  this._container.innerHTML = '';
};

ShowScopes.prototype.highlightScope = function(element) {

  this.unhighlightScope();

  this._highlight = {
    element,
    stroke: element.businessObject.di.get('stroke'),
    fill: element.businessObject.di.get('fill')
  };

  this.setColor(element, STROKE_COLOR, FILL_COLOR);

  if (!element.parent) {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this._canvas.getContainer()).add('highlight');
  }
};

ShowScopes.prototype.unhighlightScope = function() {

  if (!this._highlight) {
    return;
  }

  const {
    element,
    stroke,
    fill
  } = this._highlight;

  this.setColor(element, stroke, fill);

  if (!element.parent) {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(this._canvas.getContainer()).remove('highlight');
  }

  this._highlight = null;
};

ShowScopes.prototype.setColor = function(element, stroke, fill) {
  var businessObject = element.businessObject;

  businessObject.di.set('stroke', stroke);
  businessObject.di.set('fill', fill);

  var gfx = this._elementRegistry.getGraphics(element);

  this._graphicsFactory.update('connection', element, gfx);
};

ShowScopes.$inject = [
  'eventBus',
  'canvas',
  'graphicsFactory',
  'elementRegistry',
  'scopeFilter'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/show-scopes/index.js":
/*!*********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/show-scopes/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ShowScopes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ShowScopes */ "../bpmn-js-token-simulation/lib/features/show-scopes/ShowScopes.js");
/* harmony import */ var _scope_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scope-filter */ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _scope_filter__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    'showScopes'
  ],
  showScopes: [ 'type', _ShowScopes__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/simulation-state/SimulationState.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/simulation-state/SimulationState.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SimulationState)
/* harmony export */ });
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");



function SimulationState(
    eventBus,
    simulator,
    elementNotifications) {

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_DESTROYED_EVENT, event => {
    const {
      scope
    } = event;

    const {
      destroyContext,
      element: scopeElement
    } = scope;

    const {
      element,
      reason
    } = destroyContext;

    if (reason !== 'complete') {
      return;
    }

    const processScopes = [
      'bpmn:Process',
      'bpmn:Participant'
    ];

    if (!processScopes.includes(scopeElement.type)) {
      return;
    }

    elementNotifications.addElementNotification(element, {
      type: 'success',
      icon: 'fa-check-circle',
      text: 'Finished',
      scope
    });
  });
}

SimulationState.$inject = [
  'eventBus',
  'simulator',
  'elementNotifications'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/simulation-state/index.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/simulation-state/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _SimulationState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SimulationState */ "../bpmn-js-token-simulation/lib/features/simulation-state/SimulationState.js");
/* harmony import */ var _element_notifications__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../element-notifications */ "../bpmn-js-token-simulation/lib/features/element-notifications/index.js");
/* harmony import */ var _notifications__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../notifications */ "../bpmn-js-token-simulation/lib/features/notifications/index.js");





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _element_notifications__WEBPACK_IMPORTED_MODULE_0__.default,
    _notifications__WEBPACK_IMPORTED_MODULE_1__.default
  ],
  __init__: [
    'simulationState'
  ],
  simulationState: [ 'type', _SimulationState__WEBPACK_IMPORTED_MODULE_2__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/toggle-automatic/ToggleAutomatic.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/toggle-automatic/ToggleAutomatic.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ToggleAutomatic)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");





function ToggleAutomatic(eventBus, canvas) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  this.automaticMode = true;
  this.disabled = true;

  this.palette = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.query)('.animation-palette', this._canvas.getContainer());
  if (!this.palette) {
    this.palette = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)('<div class="animation-palette"></div>');
    this._canvas.getContainer().appendChild(this.palette);
  }

  eventBus.on('import.done', () => {
    this.canvasParent = this._canvas.getContainer().parentNode;

    this._init();
  });

}

ToggleAutomatic.prototype._init = function() {
  this.container = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)(`
    <div class="toggle-automatic hidden">
      Automatic <span class="toggle"><i class="fa fa-magic"></i>&nbsp;<i class="fa fa-toggle-on"></i></span>
    </div>
  `);

  min_dom__WEBPACK_IMPORTED_MODULE_0__.event.bind(this.container, 'click', () => this.toggleAutomatic());

  this.palette.appendChild(this.container);
};

ToggleAutomatic.prototype.toggleAutomatic = function() {
  if (!this.disabled) {
    if (this.automaticMode) {
      this.container.innerHTML = 'Automatic <span class="toggle"><i class="fa fa-magic"></i>&nbsp;<i class="fa fa-toggle-off"></i></span>';

      this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_AUTOMATIC_MODE_EVENT, {
        automaticMode: false
      });

    } else {
      this.container.innerHTML = 'Automatic <span class="toggle"><i class="fa fa-magic"></i>&nbsp;<i class="fa fa-toggle-on"></i></span>';

      this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_AUTOMATIC_MODE_EVENT, {
        automaticMode: true
      });
    }
    this.automaticMode = !this.automaticMode;
  }
};

ToggleAutomatic.prototype.disableToggle = function(disable) {
  this.disabled = disable;

  if (disable) {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this.container).add('hidden');
  } else {
    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this.container).remove('hidden');
  }

};

ToggleAutomatic.$inject = [ 'eventBus', 'canvas' ];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/toggle-automatic/index.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/toggle-automatic/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ToggleAutomatic__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ToggleAutomatic */ "../bpmn-js-token-simulation/lib/features/toggle-automatic/ToggleAutomatic.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'toggleAutomatic'
  ],
  toggleAutomatic: [ 'type', _ToggleAutomatic__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode.js":
/*!**********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ToggleMode)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");





function ToggleMode(
    eventBus, canvas, selection,
    contextPad, toggleAutomatic) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._selection = selection;
  this._contextPad = contextPad;
  this._toggleAutomatic = toggleAutomatic;

  this._active = false;

  eventBus.on('import.parse.start', () => {

    if (this._active) {
      this.toggleMode(false);

      eventBus.once('import.done', () => {
        this.toggleMode(true);
      });
    }
  });

  eventBus.on('diagram.init', () => {
    this._canvasParent = this._canvas.getContainer().parentNode;
    this._palette = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.query)('.djs-palette', this._canvas.getContainer());

    this._init();
  });
}

ToggleMode.prototype._init = function() {
  this._container = (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.domify)(`
    <div class="toggle-mode">
      Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>
    </div>
  `);

  min_dom__WEBPACK_IMPORTED_MODULE_0__.event.bind(this._container, 'click', () => this.toggleMode());

  this._canvas.getContainer().appendChild(this._container);
};

ToggleMode.prototype.toggleMode = function(active = !this._active) {

  if (active === this._active) {
    return;
  }

  if (active) {
    this._container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-on"></i></span>';

    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this._canvasParent).add('simulation');
    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this._palette).add('hidden');

    this._toggleAutomatic.disableToggle(false);
  } else {
    this._container.innerHTML = 'Token Simulation <span class="toggle"><i class="fa fa-toggle-off"></i></span>';

    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this._canvasParent).remove('simulation');
    (0,min_dom__WEBPACK_IMPORTED_MODULE_0__.classes)(this._palette).remove('hidden');

    const elements = this._selection.get();

    if (elements.length === 1) {
      this._contextPad.open(elements[0]);
    }

    this._toggleAutomatic.disableToggle(true);
  }

  this._eventBus.fire(_util_EventHelper__WEBPACK_IMPORTED_MODULE_1__.TOGGLE_MODE_EVENT, {
    active
  });

  this._active = active;
};

ToggleMode.$inject = [
  'eventBus',
  'canvas',
  'selection',
  'contextPad',
  'toggleAutomatic'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/toggle-mode/modeler/index.js":
/*!*****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/toggle-mode/modeler/index.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ToggleMode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ToggleMode */ "../bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'toggleMode'
  ],
  toggleMode: [ 'type', _ToggleMode__WEBPACK_IMPORTED_MODULE_0__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/token-count/TokenCount.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/token-count/TokenCount.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TokenCount)
/* harmony export */ });
/* harmony import */ var min_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dom */ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js");
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");
/* harmony import */ var _util_EventHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/EventHelper */ "../bpmn-js-token-simulation/lib/util/EventHelper.js");







const OFFSET_BOTTOM = 10;
const OFFSET_LEFT = -15;

const LOW_PRIORITY = 500;

const STYLE = getComputedStyle(document.documentElement);

const DEFAULT_PRIMARY_COLOR = STYLE.getPropertyValue('--token-simulation-green-base-44');
const DEFAULT_AUXILIARY_COLOR = STYLE.getPropertyValue('--token-simulation-white');


function TokenCount(
    eventBus, overlays,
    simulator, scopeFilter) {

  this._overlays = overlays;
  this._scopeFilter = scopeFilter;
  this._simulator = simulator;

  this.overlayIds = {};

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.ELEMENT_CHANGED_EVENT, LOW_PRIORITY, event => {

    const {
      element
    } = event;

    this.removeTokenCounts(element);
    this.addTokenCounts(element);
  });

  eventBus.on(_util_EventHelper__WEBPACK_IMPORTED_MODULE_0__.SCOPE_FILTER_CHANGED_EVENT, event => {

    const allElements = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.queryAll)('.token-count[data-scope-id]', overlays._overlayRoot);

    for (const element of allElements) {
      const scopeId = element.dataset.scopeId;

      (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.classes)(element).toggle('inactive', !this._scopeFilter.isShown(scopeId));
    }
  });
}

TokenCount.prototype.addTokenCounts = function(element) {

  if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_2__.is)(element, 'bpmn:MessageFlow') || (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_2__.is)(element, 'bpmn:SequenceFlow')) {
    return;
  }

  const scopes = this._simulator.findScopes(scope => {
    return (
      !scope.destroyed &&
      scope.children.some(c => !c.destroyed && c.element === element && !c.children.length)
    );
  });

  this.addTokenCount(element, scopes);
};

TokenCount.prototype.addTokenCount = function(element, scopes) {
  if (!scopes.length) {
    return;
  }

  const defaultColors = {
    primary: DEFAULT_PRIMARY_COLOR,
    auxiliary: DEFAULT_AUXILIARY_COLOR
  };

  const tokenMarkup = scopes.map(scope => {
    const colors = scope.colors || defaultColors;

    return `
      <div data-scope-id="${scope.id}" class="token-count waiting ${this._scopeFilter.isShown(scope) ? '' : 'inactive' }"
           style="color: ${colors.auxiliary}; background: ${ colors.primary }">
        ${scope.getTokensByElement(element)}
      </div>
    `;
  }).join('');

  const html = (0,min_dom__WEBPACK_IMPORTED_MODULE_1__.domify)(`
    <div class="token-count-parent">
      ${tokenMarkup}
    </div>
  `);

  const position = { bottom: OFFSET_BOTTOM, left: OFFSET_LEFT };

  const overlayId = this._overlays.add(element, 'token-count', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });

  this.overlayIds[element.id] = overlayId;
};

TokenCount.prototype.removeTokenCounts = function(element) {
  this.removeTokenCount(element);
};

TokenCount.prototype.removeTokenCount = function(element) {
  const overlayId = this.overlayIds[element.id];

  if (!overlayId) {
    return;
  }

  this._overlays.remove(overlayId);

  delete this.overlayIds[element.id];
};

TokenCount.$inject = [
  'eventBus',
  'overlays',
  'simulator',
  'scopeFilter'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/features/token-count/index.js":
/*!*********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/features/token-count/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TokenCount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TokenCount */ "../bpmn-js-token-simulation/lib/features/token-count/TokenCount.js");
/* harmony import */ var _scope_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scope-filter */ "../bpmn-js-token-simulation/lib/features/scope-filter/index.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _scope_filter__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    'tokenCount'
  ],
  tokenCount: [ 'type', _TokenCount__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/modeler.js":
/*!**************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/modeler.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "../bpmn-js-token-simulation/lib/base.js");
/* harmony import */ var _features_disable_modeling__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./features/disable-modeling */ "../bpmn-js-token-simulation/lib/features/disable-modeling/index.js");
/* harmony import */ var _features_toggle_mode_modeler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./features/toggle-mode/modeler */ "../bpmn-js-token-simulation/lib/features/toggle-mode/modeler/index.js");
/* harmony import */ var _features_editor_actions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./features/editor-actions */ "../bpmn-js-token-simulation/lib/features/editor-actions/index.js");
/* harmony import */ var _features_keyboard_bindings__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./features/keyboard-bindings */ "../bpmn-js-token-simulation/lib/features/keyboard-bindings/index.js");







/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _base__WEBPACK_IMPORTED_MODULE_0__.default,
    _features_disable_modeling__WEBPACK_IMPORTED_MODULE_1__.default,
    _features_toggle_mode_modeler__WEBPACK_IMPORTED_MODULE_2__.default,
    _features_editor_actions__WEBPACK_IMPORTED_MODULE_3__.default,
    _features_keyboard_bindings__WEBPACK_IMPORTED_MODULE_4__.default
  ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/Simulator.js":
/*!**************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/Simulator.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Simulator)
/* harmony export */ });
/* harmony import */ var ids__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ids */ "../bpmn-js-token-simulation/node_modules/ids/dist/index.esm.js");


function Simulator(injector, eventBus) {

  const ids = new ids__WEBPACK_IMPORTED_MODULE_0__.default([ 32, 36 ]);

  // element configuration
  const configuration = {};

  const behaviors = {};

  const scopes = [];

  const noopBehavior = new NoopBehavior();

  const jobs = [];

  const changedElements = new Set();


  on('tick', function() {
    for (const element of changedElements) {
      emit('elementChanged', {
        element
      });
    }

    changedElements.clear();
  });

  function queue(scope, task) {

    // add this task
    jobs.push([ task, scope ]);

    if (jobs.length !== 1) {
      return;
    }

    let next;

    while ((next = jobs[0])) {

      const [ task, scope ] = next;

      if (!scope.destroyed) {
        task();
      }

      // remove first task
      jobs.shift();
    }

    emit('tick');
  }

  function getBehavior(element) {
    return behaviors[element.type] || noopBehavior;
  }

  function signal(context) {

    const {
      element,
      parentScope
    } = context;

    const scope = context.scope || createScope(element, parentScope, element);

    queue(scope, function() {

      trace('signal', {
        ...context,
        scope
      });

      getBehavior(element).signal({
        ...context,
        scope
      });

      if (scope.parent) {
        scopeChanged(scope.parent);
      }
    });
  }

  function enter(context) {

    const {
      element,
      scope: parentScope
    } = context;

    const scope = createScope(element, parentScope, element);

    queue(scope, function() {
      trace('enter', context);

      getBehavior(element).enter({
        ...context,
        scope
      });

      scopeChanged(parentScope);
    });
  }

  function exit(context) {

    const {
      element,
      scope,
      initiator = {
        element,
        scope
      }
    } = context;

    queue(scope, function() {

      trace('exit', context);

      getBehavior(element).exit(context);

      destroyScope(scope, {
        ...initiator,
        reason: 'complete'
      });

      scope.parent && scopeChanged(scope.parent);
    });
  }

  function createScope(element, parentScope=null, initiator=null) {

    trace('createScope', {
      element,
      scope: parentScope
    });

    const scope = {
      id: ids.next(),
      element,
      children: [],
      interrupted: false,
      destroyed: false,
      initiator,
      parent: parentScope,
      getTokens() {
        return this.children.filter(c => !c.destroyed).length;
      },
      getTokensByElement(element) {
        return this.children.filter(c => !c.destroyed && c.element === element).length;
      }
    };

    if (parentScope) {
      parentScope.children.push(scope);
    }

    scopes.push(scope);

    emit('createScope', {
      scope
    });

    elementChanged(element);

    return scope;
  }

  function scopeFilter(filter) {

    if (typeof filter === 'function') {
      return filter;
    }

    const {
      element,
      waitsOnElement,
      parent,
      destroyed = false
    } = filter;

    return (
      scope =>
        (!element || scope.element === element) &&
        (!parent || scope.parent === parent) &&
        (!waitsOnElement || scope.getTokensByElement(waitsOnElement) > 0) &&
        (destroyed === !!scope.destroyed)
    );
  }

  function findScopes(filter) {
    return scopes.filter(scopeFilter(filter));
  }

  function findScope(filter) {
    return scopes.find(scopeFilter(filter));
  }

  const noneContext = Object.freeze({
    element: null,
    scope: null,
    reason: 'cancel'
  });

  function destroyScope(scope, context=noneContext) {

    if (scope.destroyed) {
      return;
    }

    [ 'element', 'scope', 'reason' ].forEach(property => {
      if (!(property in context)) {
        throw new Error(`no <context.${property}> provided`);
      }
    });

    for (const childScope of scope.children) {
      if (!childScope.destroyed) {
        destroyScope(childScope, {
          ...context,
          reason: 'cancel'
        });
      }
    }

    trace('destroyScope', {
      element: scope.element,
      scope
    });

    scope.destroyContext = context;

    scope.destroyed = true;

    elementChanged(scope.element);

    emit('destroyScope', {
      scope
    });
  }

  function trace(action, context) {

    emit('trace', {
      ...context,
      action
    });
  }

  function elementChanged(element) {
    changedElements.add(element);
  }

  function scopeChanged(scope) {
    emit('scopeChanged', {
      scope
    });
  }

  function emit(event, payload={}) {
    return eventBus.fire(`tokenSimulation.simulator.${event}`, payload);
  }

  function on(event, callback) {
    eventBus.on('tokenSimulation.simulator.' + event, callback);
  }

  function off(event, callback) {
    eventBus.off('tokenSimulation.simulator.' + event, callback);
  }

  function setConfig(element, updatedConfig) {

    const existingConfig = getConfig(element);

    configuration[element.id || element] = {
      ...existingConfig,
      ...updatedConfig
    };

    elementChanged(element);
  }

  function getConfig(element) {
    return configuration[element.id || element] || {};
  }

  function waitAtElement(element, wait=true) {
    setConfig(element, {
      wait
    });
  }

  function reset() {
    for (const scope of scopes) {
      destroyScope(scope);
    }

    scopes.length = 0;

    // TODO(nikku): clear configuration?

    emit('tick');
    emit('reset');
  }

  this.waitAtElement = waitAtElement;

  this.createScope = createScope;
  this.destroyScope = destroyScope;

  this.findScope = findScope;
  this.findScopes = findScopes;

  this.setConfig = setConfig;
  this.getConfig = getConfig;

  this.signal = signal;
  this.enter = enter;
  this.exit = exit;

  this.reset = reset;

  this.on = on;
  this.off = off;

  this.registerBehavior = function(element, behavior) {
    behaviors[element] = behavior;
  };
}

Simulator.$inject = [ 'injector', 'eventBus' ];


// helpers /////////////////

function NoopBehavior() {

  this.signal = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.exit = function(context) {
    console.log('ignored #exit', context.element);
  };

  this.enter = function(context) {
    console.log('ignored #enter', context.element);
  };

}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/ActivityBehavior.js":
/*!*******************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/ActivityBehavior.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ActivityBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");


function ActivityBehavior(simulator, scopeBehavior) {
  this._simulator = simulator;
  this._scopeBehavior = scopeBehavior;

  const elements = [
    'bpmn:BusinessRuleTask',
    'bpmn:CallActivity',
    'bpmn:ManualTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask'
  ];

  for (const element of elements) {
    simulator.registerBehavior(element, this);
  }
}

ActivityBehavior.prototype.signal = function(context) {

  this._triggerMessages(context);

  this._simulator.exit({
    ...context,
    signal: true
  });
};

ActivityBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const {
    wait
  } = this._simulator.getConfig(element);

  const waiting = element.incoming.find(_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isMessageFlow);

  if (wait || waiting) {
    return;
  }

  this._triggerMessages(context);

  this._simulator.exit(context);
};

ActivityBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  if (scope.interrupted) {
    return;
  }

  // TODO(nikku): if a outgoing flow is conditional,
  //              task has exclusive gateway semantics,
  //              else, task has parallel gateway semantics

  const parentScope = scope.parent;

  for (const outgoing of element.outgoing) {

    if ((0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isSequenceFlow)(outgoing)) {

      this._simulator.enter({
        element: outgoing,
        scope: parentScope
      });
    }
  }
};

ActivityBehavior.prototype._triggerMessages = function(context) {

  const {
    element
  } = context;

  for (const outgoing of element.outgoing) {

    if ((0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isMessageFlow)(outgoing)) {
      this._simulator.signal({
        element: outgoing
      });
    }
  }

};

ActivityBehavior.$inject = ['simulator', 'scopeBehavior'];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/BoundaryEventBehavior.js":
/*!************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/BoundaryEventBehavior.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BoundaryEventBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");



function BoundaryEventBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:BoundaryEvent', this);
}

BoundaryEventBehavior.prototype.signal = function(context) {

  const {
    element,
    scope
  } = context;

  const scopeElement = element.host;

  const cancelActivity = (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject)(element).cancelActivity;

  if (cancelActivity) {

    const cancelScope = this._simulator.findScope({
      parent: scope.parent,
      element: scopeElement
    });

    if (!cancelScope) {
      throw new Error('cancel scope not found');
    }

    const initiator = {
      element,
      scope
    };

    this._scopeBehavior.interrupt(cancelScope, initiator);

    if (this._scopeBehavior.isFinished(cancelScope)) {

      // attempt child scope exit
      // may fail if interrupting activities are still running
      this._scopeBehavior.exit({
        scope: cancelScope,
        initiator
      });
    }
  }

  this._simulator.exit(context);
};

BoundaryEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

BoundaryEventBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/EndEventBehavior.js":
/*!*******************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/EndEventBehavior.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EndEventBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");



function EndEventBehavior(
    simulator,
    eventBehaviors,
    scopeBehavior) {

  this._simulator = simulator;
  this._eventBehaviors = eventBehaviors;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:EndEvent', this);
}

EndEventBehavior.prototype.enter = function(context) {

  const {
    element
  } = context;

  const eventBehavior = this._eventBehaviors.get(element);

  if (eventBehavior) {
    eventBehavior(context);
  }

  for (const outgoing of element.outgoing) {
    if ((0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isMessageFlow)(outgoing)) {
      this._simulator.signal({
        element: outgoing
      });
    }
  }

  this._simulator.exit(context);
};

EndEventBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  const initiator = {
    element,
    scope
  };

  const {
    parent: parentScope
  } = scope;

  const terminate = (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isTerminate)(element);

  if (terminate || this._scopeBehavior.isFinished(parentScope, scope)) {
    this._scopeBehavior.exit({
      scope: parentScope,
      initiator
    });
  }
};

EndEventBehavior.$inject = [
  'simulator',
  'eventBehaviors',
  'scopeBehavior'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/EventBasedGatewayBehavior.js":
/*!****************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/EventBasedGatewayBehavior.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EventBasedGatewayBehavior)
/* harmony export */ });
function EventBasedGatewayBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:EventBasedGateway', this);
}

EventBasedGatewayBehavior.prototype.enter = function(context) {

  // literally do nothing, catch event behavior will unstuck us
};

EventBasedGatewayBehavior.$inject = [
  'simulator'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/EventBehaviors.js":
/*!*****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/EventBehaviors.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EventBehaviors)
/* harmony export */ });
/* harmony import */ var _util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../util/ElementHelper */ "../bpmn-js-token-simulation/lib/util/ElementHelper.js");



function EventBehaviors(
    simulator,
    elementRegistry) {

  this._simulator = simulator;
  this._elementRegistry = elementRegistry;
}

EventBehaviors.prototype.get = function(element) {

  const behaviors = {
    'bpmn:LinkEventDefinition': (context) => {

      const {
        element,
        scope
      } = context;

      const {
        parent: parentScope
      } = scope;

      const eventDefinition = (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(element, 'bpmn:LinkEventDefinition');
      const name = eventDefinition.get('name');

      // HINT: links work only within the same process

      const triggerElements = this._elementRegistry.filter(e => {
        return (
          e.parent === element.parent &&
          (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(e, 'bpmn:CatchEvent') &&
          (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.isTypedEvent)(e, 'bpmn:LinkEventDefinition') &&
          (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(e, 'bpmn:LinkEventDefinition').get('name') === name
        );
      });

      for (const triggerElement of triggerElements) {
        this._simulator.enter({
          element: triggerElement,
          scope: parentScope
        });
      }
    },

    'bpmn:SignalEventDefinition': (context) => {

      const {
        element
      } = context;

      // HINT: signals work only within the whole diagram,
      //       triggers start events, boundary events and
      //       intermediate catch events

      const eventDefinition = (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(element, 'bpmn:SignalEventDefinition');
      const signal = eventDefinition.get('signalRef');

      const triggerElements = this._elementRegistry.filter(e => {
        return (
          (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(e, 'bpmn:CatchEvent') &&
          (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.isTypedEvent)(e, 'bpmn:SignalEventDefinition') &&
          (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(e, 'bpmn:SignalEventDefinition').get('signalRef') === signal
        );
      });

      // trigger signal events for found elements
      const triggers = triggerElements.map(triggerElement => {

        // signal the following elements
        //
        //   * start events outside of sub-processes
        //   * start events in event sub-processes with active parent scope
        //   * intermediate events with active scope
        //   * boundary events with active scope waiting in host
        //
        if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(triggerElement, 'bpmn:StartEvent')) {

          const triggerParent = triggerElement.parent;

          const startEvent = triggerElement;

          if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(triggerParent, 'bpmn:SubProcess')) {

            // trigger event sub-processes only
            if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject)(triggerParent).triggeredByEvent) {
              const parentScopes = this._simulator.findScopes({
                element: triggerParent.parent
              });

              // only trigger if parent scope exists
              return parentScopes.map(parentScope => () => this._simulator.signal({
                element: triggerParent,
                startEvent,
                parentScope
              }));
            }
          } else {
            return () => this._simulator.signal({
              element: triggerElement.parent,
              startEvent
            });
          }
        }

        if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(triggerElement, 'bpmn:IntermediateCatchEvent')) {

          // (a) scope waiting at element will be signaled
          const eventSource = triggerElement.incoming.find(
            incoming => (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(incoming.source, 'bpmn:EventBasedGateway')
          );

          const scopes = this._simulator.findScopes({
            element: eventSource && eventSource.source || triggerElement
          });

          return scopes.map(scope => () => this._simulator.signal({
            element: triggerElement,
            scope
          }));
        }

        if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(triggerElement, 'bpmn:BoundaryEvent')) {
          const scopes = this._simulator.findScopes({
            element: triggerElement.host
          });

          return scopes.map(scope => () => this._simulator.signal({
            element: triggerElement,
            parentScope: scope.parent
          }));
        }

        // nothing to trigger
        return [];
      }).flat();

      for (const trigger of triggers) {
        if (trigger) {
          trigger();
        }
      }

    },

    'bpmn:EscalationEventDefinition': (context) => {

      const {
        element,
        scope
      } = context;

      // HINT: escalations are propagated up the scope
      //       chain and caught by the first matching boundary event
      //       or event sub-process

      const eventDefinition = (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(element, 'bpmn:EscalationEventDefinition');
      const escalation = eventDefinition.get('escalationRef');

      let triggerElement, parentScope = scope.parent;

      do {

        // find event sub-process catching in scope
        triggerElement = parentScope.element.children.find(e => {
          return (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(e, 'bpmn:SubProcess') && e.children.find(e => {
            return (
              (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(e, 'bpmn:CatchEvent') &&
              (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.isTypedEvent)(e, 'bpmn:EscalationEventDefinition') &&
              (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(e, 'bpmn:EscalationEventDefinition').get('escalationRef') === escalation
            );
          });
        }) || parentScope.element.attachers.find(e => {
          return (
            (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(e, 'bpmn:CatchEvent') &&
            (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.isTypedEvent)(e, 'bpmn:EscalationEventDefinition') &&
            (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.getEventDefinition)(e, 'bpmn:EscalationEventDefinition').get('escalationRef') === escalation
          );
        });

      } while (!triggerElement && (parentScope = parentScope.parent));

      if (!triggerElement) {
        return;
      }

      if ((0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.is)(triggerElement, 'bpmn:BoundaryEvent')) {
        parentScope = parentScope.parent;
      }

      this._simulator.signal({
        element: triggerElement,
        parentScope
      });
    }
  };

  const entry = Object.entries(behaviors).find(
    entry => (0,_util_ElementHelper__WEBPACK_IMPORTED_MODULE_0__.isTypedEvent)(element, entry[0])
  );

  return entry && entry[1];
};

EventBehaviors.$inject = [
  'simulator',
  'elementRegistry'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/ExclusiveGatewayBehavior.js":
/*!***************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/ExclusiveGatewayBehavior.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExclusiveGatewayBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");



function ExclusiveGatewayBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:ExclusiveGateway', this);
}

ExclusiveGatewayBehavior.prototype.enter = function(context) {
  this._simulator.exit(context);
};

ExclusiveGatewayBehavior.prototype.exit = function(context) {

  const {
    element,
    scope
  } = context;

  // depends on UI to properly configure activeOutgoing for
  // each exclusive gateway

  const outgoings = (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.filterSequenceFlows)(element.outgoing);

  if (outgoings.length === 1) {
    return this._simulator.enter({
      element: outgoings[0],
      scope: scope.parent
    });
  }

  const {
    activeOutgoing
  } = this._simulator.getConfig(element);

  const outgoing = outgoings.find(o => o === activeOutgoing);

  if (!outgoing) {
    throw new Error('no outgoing configured');
  }

  return this._simulator.enter({
    element: outgoing,
    scope: scope.parent
  });
};

ExclusiveGatewayBehavior.$inject = [ 'simulator' ];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/IntermediateCatchEventBehavior.js":
/*!*********************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/IntermediateCatchEventBehavior.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ IntermediateCatchEventBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");



function IntermediateCatchEventBehavior(
    simulator,
    activityBehavior) {

  this._activityBehavior = activityBehavior;
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:IntermediateCatchEvent', this);
  simulator.registerBehavior('bpmn:ReceiveTask', this);
}

IntermediateCatchEventBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

IntermediateCatchEventBehavior.prototype.enter = function(context) {
  const {
    element
  } = context;

  if ((0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isLink)(element)) {
    this._simulator.exit(context);
  }
};

IntermediateCatchEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

IntermediateCatchEventBehavior.$inject = [
  'simulator',
  'activityBehavior'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/IntermediateThrowEventBehavior.js":
/*!*********************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/IntermediateThrowEventBehavior.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ IntermediateThrowEventBehavior)
/* harmony export */ });
function IntermediateThrowEventBehavior(
    simulator,
    activityBehavior,
    eventBehaviors) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._eventBehaviors = eventBehaviors;

  simulator.registerBehavior('bpmn:IntermediateThrowEvent', this);
}

IntermediateThrowEventBehavior.prototype.enter = function(context) {
  const {
    element
  } = context;

  const eventBehavior = this._eventBehaviors.get(element);

  if (eventBehavior) {
    eventBehavior(context);
  }

  this._activityBehavior.enter(context);
};

IntermediateThrowEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

IntermediateThrowEventBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'eventBehaviors'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/MessageFlowBehavior.js":
/*!**********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/MessageFlowBehavior.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MessageFlowBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");



function MessageFlowBehavior(simulator) {
  this._simulator = simulator;

  simulator.registerBehavior('bpmn:MessageFlow', this);
}

MessageFlowBehavior.prototype.signal = function(context) {
  this._simulator.exit(context);
};

MessageFlowBehavior.prototype.exit = function(context) {
  const {
    element
  } = context;

  const target = element.target;

  // (a) scope waiting at element will be signaled
  const eventSource = target.incoming.find(
    incoming => (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(incoming.source, 'bpmn:EventBasedGateway')
  );

  const waitingScope = this._simulator.findScope({
    element: eventSource && eventSource.source || target
  });

  if (waitingScope) {
    this._simulator.signal({
      element: target,
      scope: waitingScope
    });
  } else if ((0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(target, 'bpmn:StartEvent')) {
    this._simulator.signal({
      startEvent: target,
      element: target.parent
    });
  } else {

    // (b) scope active with element => log message received at element
    const targetScope = this._simulator.findScope({
      element: target.parent
    });

    if (targetScope) {

      // TODO(nikku): log message received
    } else {

      // (c) no scope at target => message is just discarted
    }
  }
};

MessageFlowBehavior.$inject = [ 'simulator' ];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js":
/*!************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "is": () => (/* reexport safe */ bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is),
/* harmony export */   "getBusinessObject": () => (/* reexport safe */ bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject),
/* harmony export */   "filterSequenceFlows": () => (/* binding */ filterSequenceFlows),
/* harmony export */   "isMessageFlow": () => (/* binding */ isMessageFlow),
/* harmony export */   "isSequenceFlow": () => (/* binding */ isSequenceFlow),
/* harmony export */   "isTerminate": () => (/* binding */ isTerminate),
/* harmony export */   "isLink": () => (/* binding */ isLink),
/* harmony export */   "isEventSubProcess": () => (/* binding */ isEventSubProcess)
/* harmony export */ });
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");




function filterSequenceFlows(flows) {
  return flows.filter(f => (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(f, 'bpmn:SequenceFlow'));
}

function isMessageFlow(element) {
  return (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:MessageFlow');
}

function isSequenceFlow(element) {
  return (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(element, 'bpmn:SequenceFlow');
}

function isTerminate(element) {
  return ((0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject)(element).eventDefinitions || []).find(definition => {
    return (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(definition, 'bpmn:TerminateEventDefinition');
  });
}

function isLink(element) {
  return ((0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject)(element).eventDefinitions || []).find(definition => {
    return (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(definition, 'bpmn:LinkEventDefinition');
  });
}

function isEventSubProcess(element) {
  return (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.getBusinessObject)(element).triggeredByEvent;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/ParallelGatewayBehavior.js":
/*!**************************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/ParallelGatewayBehavior.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ParallelGatewayBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");



function ParallelGatewayBehavior(
    simulator,
    activityBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;

  simulator.registerBehavior('bpmn:ParallelGateway', this);
}

ParallelGatewayBehavior.prototype.enter = function(context) {

  const {
    scope,
    element
  } = context;

  const sequenceFlows = (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.filterSequenceFlows)(element.incoming);

  const {
    parent: parentScope
  } = scope;

  const elementScopes = parentScope.children.filter(c => c.element === element);

  if (elementScopes.length === sequenceFlows.length) {

    for (const childScope of elementScopes) {

      if (childScope !== scope) {
        this._simulator.destroyScope(childScope, {
          scope,
          element,
          reason: 'join'
        });
      }
    }

    this._simulator.exit(context);
  }
};

ParallelGatewayBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

ParallelGatewayBehavior.$inject = [
  'simulator',
  'activityBehavior'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/ProcessBehavior.js":
/*!******************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/ProcessBehavior.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProcessBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");



function ProcessBehavior(
    simulator,
    scopeBehavior) {

  this._simulator = simulator;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:Process', this);
  simulator.registerBehavior('bpmn:Participant', this);
}

ProcessBehavior.prototype.signal = function(context) {

  const {
    element,
    startEvent = findProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope
  });
};

ProcessBehavior.prototype.exit = function(context) {

  const {
    scope,
    initiator
  } = context;

  // ensure that all sub-scopes are destroyed

  this._scopeBehavior.destroyChildren(scope, initiator);
};


ProcessBehavior.$inject = [
  'simulator',
  'scopeBehavior'
];


// helpers //////////////////

function findProcessStart(element) {
  return element.children.find(child => (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(child, 'bpmn:StartEvent'));
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/ScopeBehavior.js":
/*!****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/ScopeBehavior.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ScopeBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil.js");
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");



function ScopeBehavior(simulator) {
  this._simulator = simulator;
}

ScopeBehavior.prototype.isFinished = function(scope, excludeScope=null) {
  return scope.children.every(c => c === excludeScope || c.destroyed);
};

ScopeBehavior.prototype.destroyChildren = function(scope, initiator) {

  for (const childScope of scope.children) {

    if (childScope.destroyed) {
      continue;
    }

    this._simulator.destroyScope(childScope, {
      reason: 'cancel',
      ...initiator
    });
  }
};

ScopeBehavior.prototype.enter = function(context) {

  const {
    element,
    scope,
    parentScope
  } = context;

  const {
    parent: parentElement
  } = element;

  // trigger event sub-process
  if ((0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.isEventSubProcess)(parentElement)) {

    if (!parentScope) {
      throw new Error('missing <parentScope>');
    }

    // if we're interrupting, clear all non-interrupting
    // child scopes, remove all tokens and re-add tokens
    // to all interrupting child scopes
    if (isInterrupting(element)) {
      parentScope.interrupting = true;

      this.interrupt(parentScope.parent, {
        element,
        scope
      });
    }
  }
};

ScopeBehavior.prototype.interrupt = function(scope, initiator) {

  // mark as interrupted
  scope.interrupted = true;

  // kill non-interrupting child scopes
  for (const childScope of scope.children) {

    if (childScope.destroyed || childScope.interrupting) {
      continue;
    }

    this._simulator.destroyScope(childScope, {
      reason: 'cancel',
      ...initiator
    });
  }
};

ScopeBehavior.prototype.exit = function(context) {

  const {
    scope,
    initiator
  } = context;

  if (!initiator) {
    throw new Error('missing <initiator>');
  }

  this._simulator.exit({
    element: scope.element,
    scope: scope,
    initiator
  });
};

ScopeBehavior.$inject = [
  'simulator'
];


// helpers ////////////////

function isInterrupting(element) {
  return (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_1__.getBusinessObject)(element).isInterrupting;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/SequenceFlowBehavior.js":
/*!***********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/SequenceFlowBehavior.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SequenceFlowBehavior)
/* harmony export */ });
function SequenceFlowBehavior(
    simulator,
    scopeBehavior) {

  this._simulator = simulator;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:SequenceFlow', this);
}

SequenceFlowBehavior.prototype.enter = function(context) {
  this._simulator.exit(context);
};

SequenceFlowBehavior.prototype.exit = function(context) {
  const {
    element,
    scope
  } = context;

  this._simulator.enter({
    element: element.target,
    scope: scope.parent
  });
};

SequenceFlowBehavior.$inject = [
  'simulator',
  'scopeBehavior'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/StartEventBehavior.js":
/*!*********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/StartEventBehavior.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StartEventBehavior)
/* harmony export */ });
function StartEventBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:StartEvent', this);
}

StartEventBehavior.prototype.signal = function(context) {

  const {
    parentScope
  } = context;

  if (!parentScope) {
    throw new Error('missing <parentScope>');
  }

  this._scopeBehavior.enter(context);

  this._simulator.exit(context);
};

StartEventBehavior.prototype.exit = function(context) {
  this._activityBehavior.exit(context);
};

StartEventBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/SubProcessBehavior.js":
/*!*********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/SubProcessBehavior.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SubProcessBehavior)
/* harmony export */ });
/* harmony import */ var _ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");



function SubProcessBehavior(
    simulator,
    activityBehavior,
    scopeBehavior) {

  this._simulator = simulator;
  this._activityBehavior = activityBehavior;
  this._scopeBehavior = scopeBehavior;

  simulator.registerBehavior('bpmn:SubProcess', this);
  simulator.registerBehavior('bpmn:Transaction', this);
  simulator.registerBehavior('bpmn:AdHocSubProcess', this);
}

SubProcessBehavior.prototype.signal = function(context) {
  this.enter(context);
};

SubProcessBehavior.prototype.enter = function(context) {

  const {
    element,
    startEvent = findSubProcessStart(element),
    scope
  } = context;

  if (!startEvent) {
    throw new Error('missing <startEvent>');
  }

  this._simulator.signal({
    element: startEvent,
    parentScope: scope
  });
};

SubProcessBehavior.prototype.exit = function(context) {

  const {
    scope,
    initiator
  } = context;

  this._activityBehavior.exit(context);

  const {
    parent: scopeParent
  } = scope;

  if (this._scopeBehavior.isFinished(scopeParent, scope)) {
    this._scopeBehavior.exit({
      scope: scopeParent,
      initiator
    });
  }
};

SubProcessBehavior.$inject = [
  'simulator',
  'activityBehavior',
  'scopeBehavior'
];


// helpers //////////////////

function findSubProcessStart(element) {
  return element.children.find(child => (0,_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(child, 'bpmn:StartEvent'));
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/behaviors/index.js":
/*!********************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/behaviors/index.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _StartEventBehavior__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./StartEventBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/StartEventBehavior.js");
/* harmony import */ var _EndEventBehavior__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EndEventBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/EndEventBehavior.js");
/* harmony import */ var _BoundaryEventBehavior__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./BoundaryEventBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/BoundaryEventBehavior.js");
/* harmony import */ var _IntermediateCatchEventBehavior__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./IntermediateCatchEventBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/IntermediateCatchEventBehavior.js");
/* harmony import */ var _IntermediateThrowEventBehavior__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./IntermediateThrowEventBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/IntermediateThrowEventBehavior.js");
/* harmony import */ var _ExclusiveGatewayBehavior__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ExclusiveGatewayBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ExclusiveGatewayBehavior.js");
/* harmony import */ var _ParallelGatewayBehavior__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ParallelGatewayBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ParallelGatewayBehavior.js");
/* harmony import */ var _EventBasedGatewayBehavior__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./EventBasedGatewayBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/EventBasedGatewayBehavior.js");
/* harmony import */ var _ActivityBehavior__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ActivityBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ActivityBehavior.js");
/* harmony import */ var _SubProcessBehavior__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./SubProcessBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/SubProcessBehavior.js");
/* harmony import */ var _SequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./SequenceFlowBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/SequenceFlowBehavior.js");
/* harmony import */ var _MessageFlowBehavior__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./MessageFlowBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/MessageFlowBehavior.js");
/* harmony import */ var _EventBehaviors__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./EventBehaviors */ "../bpmn-js-token-simulation/lib/simulator/behaviors/EventBehaviors.js");
/* harmony import */ var _ScopeBehavior__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./ScopeBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ScopeBehavior.js");
/* harmony import */ var _ProcessBehavior__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./ProcessBehavior */ "../bpmn-js-token-simulation/lib/simulator/behaviors/ProcessBehavior.js");






















/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __init__: [
    'startEventBehavior',
    'endEventBehavior',
    'boundaryEventBehavior',
    'intermediateCatchEventBehavior',
    'intermediateThrowEventBehavior',
    'exclusiveGatewayBehavior',
    'parallelGatewayBehavior',
    'eventBasedGatewayBehavior',
    'subProcessBehavior',
    'sequenceFlowBehavior',
    'messageFlowBehavior',
    'processBehavior'
  ],
  startEventBehavior: [ 'type', _StartEventBehavior__WEBPACK_IMPORTED_MODULE_0__.default ],
  endEventBehavior: [ 'type', _EndEventBehavior__WEBPACK_IMPORTED_MODULE_1__.default ],
  boundaryEventBehavior: [ 'type', _BoundaryEventBehavior__WEBPACK_IMPORTED_MODULE_2__.default ],
  intermediateCatchEventBehavior: [ 'type', _IntermediateCatchEventBehavior__WEBPACK_IMPORTED_MODULE_3__.default ],
  intermediateThrowEventBehavior: [ 'type', _IntermediateThrowEventBehavior__WEBPACK_IMPORTED_MODULE_4__.default ],
  exclusiveGatewayBehavior: [ 'type', _ExclusiveGatewayBehavior__WEBPACK_IMPORTED_MODULE_5__.default ],
  parallelGatewayBehavior: [ 'type', _ParallelGatewayBehavior__WEBPACK_IMPORTED_MODULE_6__.default ],
  eventBasedGatewayBehavior: [ 'type', _EventBasedGatewayBehavior__WEBPACK_IMPORTED_MODULE_7__.default ],
  activityBehavior: [ 'type', _ActivityBehavior__WEBPACK_IMPORTED_MODULE_8__.default ],
  subProcessBehavior: [ 'type', _SubProcessBehavior__WEBPACK_IMPORTED_MODULE_9__.default ],
  sequenceFlowBehavior: [ 'type', _SequenceFlowBehavior__WEBPACK_IMPORTED_MODULE_10__.default ],
  messageFlowBehavior: [ 'type', _MessageFlowBehavior__WEBPACK_IMPORTED_MODULE_11__.default ],
  eventBehaviors: [ 'type', _EventBehaviors__WEBPACK_IMPORTED_MODULE_12__.default ],
  scopeBehavior: [ 'type', _ScopeBehavior__WEBPACK_IMPORTED_MODULE_13__.default ],
  processBehavior: [ 'type', _ProcessBehavior__WEBPACK_IMPORTED_MODULE_14__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/simulator/index.js":
/*!**********************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/simulator/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Simulator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Simulator */ "../bpmn-js-token-simulation/lib/simulator/Simulator.js");
/* harmony import */ var _behaviors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./behaviors */ "../bpmn-js-token-simulation/lib/simulator/behaviors/index.js");



const HIGH_PRIORITY = 5000;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __depends__: [
    _behaviors__WEBPACK_IMPORTED_MODULE_0__.default
  ],
  __init__: [
    [ 'eventBus', 'simulator', function(eventBus, simulator) {
      eventBus.on('tokenSimulation.toggleMode', HIGH_PRIORITY, event => {
        if (!event.active) {
          simulator.reset();
        }
      });

      eventBus.on('tokenSimulation.resetSimulation', HIGH_PRIORITY, event => {
        simulator.reset();
      });
    } ]
  ],
  simulator: [ 'type', _Simulator__WEBPACK_IMPORTED_MODULE_1__.default ]
});

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/util/ElementHelper.js":
/*!*************************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/util/ElementHelper.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "is": () => (/* binding */ is),
/* harmony export */   "getEventDefinition": () => (/* binding */ getEventDefinition),
/* harmony export */   "isTypedEvent": () => (/* binding */ isTypedEvent),
/* harmony export */   "getBusinessObject": () => (/* binding */ getBusinessObject)
/* harmony export */ });
/* harmony import */ var min_dash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! min-dash */ "../bpmn-js-token-simulation/node_modules/min-dash/dist/index.esm.js");
/* harmony import */ var bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bpmn-js/lib/util/ModelUtil */ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js");




function is(element, types) {
  if (element.type === 'label') {
    return false;
  }

  if (!Array.isArray(types)) {
    types = [ types ];
  }

  return types.some(function(type) {
    return (0,bpmn_js_lib_util_ModelUtil__WEBPACK_IMPORTED_MODULE_0__.is)(element, type);
  });
}

function getEventDefinition(event, eventDefinitionType) {
  return (0,min_dash__WEBPACK_IMPORTED_MODULE_1__.find)(getBusinessObject(event).eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
}

function isTypedEvent(event, eventDefinitionType) {
  return (0,min_dash__WEBPACK_IMPORTED_MODULE_1__.some)(getBusinessObject(event).eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType;
  });
}

function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/lib/util/EventHelper.js":
/*!***********************************************************!*\
  !*** ../bpmn-js-token-simulation/lib/util/EventHelper.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TOGGLE_MODE_EVENT": () => (/* binding */ TOGGLE_MODE_EVENT),
/* harmony export */   "TOGGLE_AUTOMATIC_MODE_EVENT": () => (/* binding */ TOGGLE_AUTOMATIC_MODE_EVENT),
/* harmony export */   "PLAY_SIMULATION_EVENT": () => (/* binding */ PLAY_SIMULATION_EVENT),
/* harmony export */   "PAUSE_SIMULATION_EVENT": () => (/* binding */ PAUSE_SIMULATION_EVENT),
/* harmony export */   "RESET_SIMULATION_EVENT": () => (/* binding */ RESET_SIMULATION_EVENT),
/* harmony export */   "ANIMATION_CREATED_EVENT": () => (/* binding */ ANIMATION_CREATED_EVENT),
/* harmony export */   "ANIMATION_SPEED_CHANGED_EVENT": () => (/* binding */ ANIMATION_SPEED_CHANGED_EVENT),
/* harmony export */   "ELEMENT_CHANGED_EVENT": () => (/* binding */ ELEMENT_CHANGED_EVENT),
/* harmony export */   "SCOPE_DESTROYED_EVENT": () => (/* binding */ SCOPE_DESTROYED_EVENT),
/* harmony export */   "SCOPE_CHANGED_EVENT": () => (/* binding */ SCOPE_CHANGED_EVENT),
/* harmony export */   "SCOPE_CREATE_EVENT": () => (/* binding */ SCOPE_CREATE_EVENT),
/* harmony export */   "SCOPE_FILTER_CHANGED_EVENT": () => (/* binding */ SCOPE_FILTER_CHANGED_EVENT),
/* harmony export */   "TRACE_EVENT": () => (/* binding */ TRACE_EVENT)
/* harmony export */ });
const TOGGLE_MODE_EVENT = 'tokenSimulation.toggleMode';
const TOGGLE_AUTOMATIC_MODE_EVENT = 'tokenSimulation.toggleAutomatic';
const PLAY_SIMULATION_EVENT = 'tokenSimulation.playSimulation';
const PAUSE_SIMULATION_EVENT = 'tokenSimulation.pauseSimulation';
const RESET_SIMULATION_EVENT = 'tokenSimulation.resetSimulation';
const ANIMATION_CREATED_EVENT = 'tokenSimulation.animationCreated';
const ANIMATION_SPEED_CHANGED_EVENT = 'tokenSimulation.animationSpeedChanged';
const ELEMENT_CHANGED_EVENT = 'tokenSimulation.simulator.elementChanged';
const SCOPE_DESTROYED_EVENT = 'tokenSimulation.simulator.destroyScope';
const SCOPE_CHANGED_EVENT = 'tokenSimulation.simulator.scopeChanged';
const SCOPE_CREATE_EVENT = 'tokenSimulation.simulator.createScope';
const SCOPE_FILTER_CHANGED_EVENT = 'tokenSimulation.scopeFilterChanged';
const TRACE_EVENT = 'tokenSimulation.simulator.trace';



/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js":
/*!******************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/bpmn-js/lib/util/ModelUtil.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "is": () => (/* binding */ is),
/* harmony export */   "getBusinessObject": () => (/* binding */ getBusinessObject)
/* harmony export */ });
/**
 * Is an element of the given BPMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {string} type
 *
 * @return {boolean}
 */
function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}


/**
 * Return the business object for a given element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @return {ModdleElement}
 */
function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/css.escape/css.escape.js":
/*!*************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/css.escape/css.escape.js ***!
  \*************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
;(function(root, factory) {
	// https://github.com/umdjs/umd/blob/master/returnExports.js
	if (true) {
		// For Node.js.
		module.exports = factory(root);
	} else {}
}(typeof __webpack_require__.g != 'undefined' ? __webpack_require__.g : this, function(root) {

	if (root.CSS && root.CSS.escape) {
		return root.CSS.escape;
	}

	// https://drafts.csswg.org/cssom/#serialize-an-identifier
	var cssEscape = function(value) {
		if (arguments.length == 0) {
			throw new TypeError('`CSS.escape` requires an argument.');
		}
		var string = String(value);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
			// (U+FFFD).
			if (codeUnit == 0x0000) {
				result += '\uFFFD';
				continue;
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index == 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit == 0x002D
				)
			) {
				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			if (
				// If the character is the first character and is a `-` (U+002D), and
				// there is no second character, […]
				index == 0 &&
				length == 1 &&
				codeUnit == 0x002D
			) {
				result += '\\' + string.charAt(index);
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit == 0x002D ||
				codeUnit == 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// https://drafts.csswg.org/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	if (!root.CSS) {
		root.CSS = {};
	}

	root.CSS.escape = cssEscape;
	return cssEscape;

}));


/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/diagram-js/lib/util/EscapeUtil.js":
/*!**********************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/diagram-js/lib/util/EscapeUtil.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "escapeCSS": () => (/* reexport default from dynamic */ css_escape__WEBPACK_IMPORTED_MODULE_0___default.a),
/* harmony export */   "escapeHTML": () => (/* binding */ escapeHTML)
/* harmony export */ });
/* harmony import */ var css_escape__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! css.escape */ "../bpmn-js-token-simulation/node_modules/css.escape/css.escape.js");
/* harmony import */ var css_escape__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(css_escape__WEBPACK_IMPORTED_MODULE_0__);


var HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};

function escapeHTML(str) {
  str = '' + str;

  return str && str.replace(/[&<>"']/g, function(match) {
    return HTML_ESCAPE_MAP[match];
  });
}


/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/ids/dist/index.esm.js":
/*!**********************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/ids/dist/index.esm.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hat_1 = createCommonjsModule(function (module) {
var hat = module.exports = function (bits, base) {
    if (!base) base = 16;
    if (bits === undefined) bits = 128;
    if (bits <= 0) return '0';
    
    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
    for (var i = 2; digits === Infinity; i *= 2) {
        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
    }
    
    var rem = digits - Math.floor(digits);
    
    var res = '';
    
    for (var i = 0; i < Math.floor(digits); i++) {
        var x = Math.floor(Math.random() * base).toString(base);
        res = x + res;
    }
    
    if (rem) {
        var b = Math.pow(base, rem);
        var x = Math.floor(Math.random() * b).toString(base);
        res = x + res;
    }
    
    var parsed = parseInt(res, base);
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
        return hat(bits, base)
    }
    else return res;
};

hat.rack = function (bits, base, expandBy) {
    var fn = function (data) {
        var iters = 0;
        do {
            if (iters ++ > 10) {
                if (expandBy) bits += expandBy;
                else throw new Error('too many ID collisions, use more bits')
            }
            
            var id = hat(bits, base);
        } while (Object.hasOwnProperty.call(hats, id));
        
        hats[id] = data;
        return id;
    };
    var hats = fn.hats = {};
    
    fn.get = function (id) {
        return fn.hats[id];
    };
    
    fn.set = function (id, value) {
        fn.hats[id] = value;
        return fn;
    };
    
    fn.bits = bits || 128;
    fn.base = base || 16;
    return fn;
};
});

/**
 * Create a new id generator / cache instance.
 *
 * You may optionally provide a seed that is used internally.
 *
 * @param {Seed} seed
 */

function Ids(seed) {
  if (!(this instanceof Ids)) {
    return new Ids(seed);
  }

  seed = seed || [128, 36, 1];
  this._seed = seed.length ? hat_1.rack(seed[0], seed[1], seed[2]) : seed;
}
/**
 * Generate a next id.
 *
 * @param {Object} [element] element to bind the id to
 *
 * @return {String} id
 */

Ids.prototype.next = function (element) {
  return this._seed(element || true);
};
/**
 * Generate a next id with a given prefix.
 *
 * @param {Object} [element] element to bind the id to
 *
 * @return {String} id
 */


Ids.prototype.nextPrefixed = function (prefix, element) {
  var id;

  do {
    id = prefix + this.next(true);
  } while (this.assigned(id)); // claim {prefix}{random}


  this.claim(id, element); // return

  return id;
};
/**
 * Manually claim an existing id.
 *
 * @param {String} id
 * @param {String} [element] element the id is claimed by
 */


Ids.prototype.claim = function (id, element) {
  this._seed.set(id, element || true);
};
/**
 * Returns true if the given id has already been assigned.
 *
 * @param  {String} id
 * @return {Boolean}
 */


Ids.prototype.assigned = function (id) {
  return this._seed.get(id) || false;
};
/**
 * Unclaim an id.
 *
 * @param  {String} id the id to unclaim
 */


Ids.prototype.unclaim = function (id) {
  delete this._seed.hats[id];
};
/**
 * Clear all claimed ids.
 */


Ids.prototype.clear = function () {
  var hats = this._seed.hats,
      id;

  for (id in hats) {
    this.unclaim(id);
  }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ids);
//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/inherits/inherits_browser.js":
/*!*****************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/inherits/inherits_browser.js ***!
  \*****************************************************************************/
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/min-dash/dist/index.esm.js":
/*!***************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/min-dash/dist/index.esm.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "bind": () => (/* binding */ bind),
/* harmony export */   "debounce": () => (/* binding */ debounce),
/* harmony export */   "ensureArray": () => (/* binding */ ensureArray),
/* harmony export */   "every": () => (/* binding */ every),
/* harmony export */   "filter": () => (/* binding */ filter),
/* harmony export */   "find": () => (/* binding */ find),
/* harmony export */   "findIndex": () => (/* binding */ findIndex),
/* harmony export */   "flatten": () => (/* binding */ flatten),
/* harmony export */   "forEach": () => (/* binding */ forEach),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "groupBy": () => (/* binding */ groupBy),
/* harmony export */   "has": () => (/* binding */ has),
/* harmony export */   "isArray": () => (/* binding */ isArray),
/* harmony export */   "isDefined": () => (/* binding */ isDefined),
/* harmony export */   "isFunction": () => (/* binding */ isFunction),
/* harmony export */   "isNil": () => (/* binding */ isNil),
/* harmony export */   "isNumber": () => (/* binding */ isNumber),
/* harmony export */   "isObject": () => (/* binding */ isObject),
/* harmony export */   "isString": () => (/* binding */ isString),
/* harmony export */   "isUndefined": () => (/* binding */ isUndefined),
/* harmony export */   "keys": () => (/* binding */ keys),
/* harmony export */   "map": () => (/* binding */ map),
/* harmony export */   "matchPattern": () => (/* binding */ matchPattern),
/* harmony export */   "merge": () => (/* binding */ merge),
/* harmony export */   "omit": () => (/* binding */ omit),
/* harmony export */   "pick": () => (/* binding */ pick),
/* harmony export */   "reduce": () => (/* binding */ reduce),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "size": () => (/* binding */ size),
/* harmony export */   "some": () => (/* binding */ some),
/* harmony export */   "sortBy": () => (/* binding */ sortBy),
/* harmony export */   "throttle": () => (/* binding */ throttle),
/* harmony export */   "unionBy": () => (/* binding */ unionBy),
/* harmony export */   "uniqueBy": () => (/* binding */ uniqueBy),
/* harmony export */   "values": () => (/* binding */ values),
/* harmony export */   "without": () => (/* binding */ without)
/* harmony export */ });
/**
 * Flatten array, one level deep.
 *
 * @param {Array<?>} arr
 *
 * @return {Array<?>}
 */
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

var nativeToString = Object.prototype.toString;
var nativeHasOwnProperty = Object.prototype.hasOwnProperty;
function isUndefined(obj) {
  return obj === undefined;
}
function isDefined(obj) {
  return obj !== undefined;
}
function isNil(obj) {
  return obj == null;
}
function isArray(obj) {
  return nativeToString.call(obj) === '[object Array]';
}
function isObject(obj) {
  return nativeToString.call(obj) === '[object Object]';
}
function isNumber(obj) {
  return nativeToString.call(obj) === '[object Number]';
}
function isFunction(obj) {
  var tag = nativeToString.call(obj);
  return tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]' || tag === '[object AsyncGeneratorFunction]' || tag === '[object Proxy]';
}
function isString(obj) {
  return nativeToString.call(obj) === '[object String]';
}
/**
 * Ensure collection is an array.
 *
 * @param {Object} obj
 */

function ensureArray(obj) {
  if (isArray(obj)) {
    return;
  }

  throw new Error('must supply array');
}
/**
 * Return true, if target owns a property with the given key.
 *
 * @param {Object} target
 * @param {String} key
 *
 * @return {Boolean}
 */

function has(target, key) {
  return nativeHasOwnProperty.call(target, key);
}

/**
 * Find element in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function|Object} matcher
 *
 * @return {Object}
 */

function find(collection, matcher) {
  matcher = toMatcher(matcher);
  var match;
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      match = val;
      return false;
    }
  });
  return match;
}
/**
 * Find element index in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function} matcher
 *
 * @return {Object}
 */

function findIndex(collection, matcher) {
  matcher = toMatcher(matcher);
  var idx = isArray(collection) ? -1 : undefined;
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      idx = key;
      return false;
    }
  });
  return idx;
}
/**
 * Find element in collection.
 *
 * @param  {Array|Object} collection
 * @param  {Function} matcher
 *
 * @return {Array} result
 */

function filter(collection, matcher) {
  var result = [];
  forEach(collection, function (val, key) {
    if (matcher(val, key)) {
      result.push(val);
    }
  });
  return result;
}
/**
 * Iterate over collection; returning something
 * (non-undefined) will stop iteration.
 *
 * @param  {Array|Object} collection
 * @param  {Function} iterator
 *
 * @return {Object} return result that stopped the iteration
 */

function forEach(collection, iterator) {
  var val, result;

  if (isUndefined(collection)) {
    return;
  }

  var convertKey = isArray(collection) ? toNum : identity;

  for (var key in collection) {
    if (has(collection, key)) {
      val = collection[key];
      result = iterator(val, convertKey(key));

      if (result === false) {
        return val;
      }
    }
  }
}
/**
 * Return collection without element.
 *
 * @param  {Array} arr
 * @param  {Function} matcher
 *
 * @return {Array}
 */

function without(arr, matcher) {
  if (isUndefined(arr)) {
    return [];
  }

  ensureArray(arr);
  matcher = toMatcher(matcher);
  return arr.filter(function (el, idx) {
    return !matcher(el, idx);
  });
}
/**
 * Reduce collection, returning a single result.
 *
 * @param  {Object|Array} collection
 * @param  {Function} iterator
 * @param  {Any} result
 *
 * @return {Any} result returned from last iterator
 */

function reduce(collection, iterator, result) {
  forEach(collection, function (value, idx) {
    result = iterator(result, value, idx);
  });
  return result;
}
/**
 * Return true if every element in the collection
 * matches the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */

function every(collection, matcher) {
  return !!reduce(collection, function (matches, val, key) {
    return matches && matcher(val, key);
  }, true);
}
/**
 * Return true if some elements in the collection
 * match the criteria.
 *
 * @param  {Object|Array} collection
 * @param  {Function} matcher
 *
 * @return {Boolean}
 */

function some(collection, matcher) {
  return !!find(collection, matcher);
}
/**
 * Transform a collection into another collection
 * by piping each member through the given fn.
 *
 * @param  {Object|Array}   collection
 * @param  {Function} fn
 *
 * @return {Array} transformed collection
 */

function map(collection, fn) {
  var result = [];
  forEach(collection, function (val, key) {
    result.push(fn(val, key));
  });
  return result;
}
/**
 * Get the collections keys.
 *
 * @param  {Object|Array} collection
 *
 * @return {Array}
 */

function keys(collection) {
  return collection && Object.keys(collection) || [];
}
/**
 * Shorthand for `keys(o).length`.
 *
 * @param  {Object|Array} collection
 *
 * @return {Number}
 */

function size(collection) {
  return keys(collection).length;
}
/**
 * Get the values in the collection.
 *
 * @param  {Object|Array} collection
 *
 * @return {Array}
 */

function values(collection) {
  return map(collection, function (val) {
    return val;
  });
}
/**
 * Group collection members by attribute.
 *
 * @param  {Object|Array} collection
 * @param  {Function} extractor
 *
 * @return {Object} map with { attrValue => [ a, b, c ] }
 */

function groupBy(collection, extractor) {
  var grouped = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  extractor = toExtractor(extractor);
  forEach(collection, function (val) {
    var discriminator = extractor(val) || '_';
    var group = grouped[discriminator];

    if (!group) {
      group = grouped[discriminator] = [];
    }

    group.push(val);
  });
  return grouped;
}
function uniqueBy(extractor) {
  extractor = toExtractor(extractor);
  var grouped = {};

  for (var _len = arguments.length, collections = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    collections[_key - 1] = arguments[_key];
  }

  forEach(collections, function (c) {
    return groupBy(c, extractor, grouped);
  });
  var result = map(grouped, function (val, key) {
    return val[0];
  });
  return result;
}
var unionBy = uniqueBy;
/**
 * Sort collection by criteria.
 *
 * @param  {Object|Array} collection
 * @param  {String|Function} extractor
 *
 * @return {Array}
 */

function sortBy(collection, extractor) {
  extractor = toExtractor(extractor);
  var sorted = [];
  forEach(collection, function (value, key) {
    var disc = extractor(value, key);
    var entry = {
      d: disc,
      v: value
    };

    for (var idx = 0; idx < sorted.length; idx++) {
      var d = sorted[idx].d;

      if (disc < d) {
        sorted.splice(idx, 0, entry);
        return;
      }
    } // not inserted, append (!)


    sorted.push(entry);
  });
  return map(sorted, function (e) {
    return e.v;
  });
}
/**
 * Create an object pattern matcher.
 *
 * @example
 *
 * const matcher = matchPattern({ id: 1 });
 *
 * var element = find(elements, matcher);
 *
 * @param  {Object} pattern
 *
 * @return {Function} matcherFn
 */

function matchPattern(pattern) {
  return function (el) {
    return every(pattern, function (val, key) {
      return el[key] === val;
    });
  };
}

function toExtractor(extractor) {
  return isFunction(extractor) ? extractor : function (e) {
    return e[extractor];
  };
}

function toMatcher(matcher) {
  return isFunction(matcher) ? matcher : function (e) {
    return e === matcher;
  };
}

function identity(arg) {
  return arg;
}

function toNum(arg) {
  return Number(arg);
}

/**
 * Debounce fn, calling it only once if
 * the given time elapsed between calls.
 *
 * @param  {Function} fn
 * @param  {Number} timeout
 *
 * @return {Function} debounced function
 */
function debounce(fn, timeout) {
  var timer;
  var lastArgs;
  var lastThis;
  var lastNow;

  function fire() {
    var now = Date.now();
    var scheduledDiff = lastNow + timeout - now;

    if (scheduledDiff > 0) {
      return schedule(scheduledDiff);
    }

    fn.apply(lastThis, lastArgs);
    timer = lastNow = lastArgs = lastThis = undefined;
  }

  function schedule(timeout) {
    timer = setTimeout(fire, timeout);
  }

  return function () {
    lastNow = Date.now();

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    lastArgs = args;
    lastThis = this; // ensure an execution is scheduled

    if (!timer) {
      schedule(timeout);
    }
  };
}
/**
 * Throttle fn, calling at most once
 * in the given interval.
 *
 * @param  {Function} fn
 * @param  {Number} interval
 *
 * @return {Function} throttled function
 */

function throttle(fn, interval) {
  var throttling = false;
  return function () {
    if (throttling) {
      return;
    }

    fn.apply(void 0, arguments);
    throttling = true;
    setTimeout(function () {
      throttling = false;
    }, interval);
  };
}
/**
 * Bind function against target <this>.
 *
 * @param  {Function} fn
 * @param  {Object}   target
 *
 * @return {Function} bound function
 */

function bind(fn, target) {
  return fn.bind(target);
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/**
 * Convenience wrapper for `Object.assign`.
 *
 * @param {Object} target
 * @param {...Object} others
 *
 * @return {Object} the target
 */

function assign(target) {
  for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    others[_key - 1] = arguments[_key];
  }

  return _extends.apply(void 0, [target].concat(others));
}
/**
 * Sets a nested property of a given object to the specified value.
 *
 * This mutates the object and returns it.
 *
 * @param {Object} target The target of the set operation.
 * @param {(string|number)[]} path The path to the nested value.
 * @param {any} value The value to set.
 */

function set(target, path, value) {
  var currentTarget = target;
  forEach(path, function (key, idx) {
    if (key === '__proto__') {
      throw new Error('illegal key: __proto__');
    }

    var nextKey = path[idx + 1];
    var nextTarget = currentTarget[key];

    if (isDefined(nextKey) && isNil(nextTarget)) {
      nextTarget = currentTarget[key] = isNaN(+nextKey) ? {} : [];
    }

    if (isUndefined(nextKey)) {
      if (isUndefined(value)) {
        delete currentTarget[key];
      } else {
        currentTarget[key] = value;
      }
    } else {
      currentTarget = nextTarget;
    }
  });
  return target;
}
/**
 * Gets a nested property of a given object.
 *
 * @param {Object} target The target of the get operation.
 * @param {(string|number)[]} path The path to the nested value.
 * @param {any} [defaultValue] The value to return if no value exists.
 */

function get(target, path, defaultValue) {
  var currentTarget = target;
  forEach(path, function (key) {
    // accessing nil property yields <undefined>
    if (isNil(currentTarget)) {
      currentTarget = undefined;
      return false;
    }

    currentTarget = currentTarget[key];
  });
  return isUndefined(currentTarget) ? defaultValue : currentTarget;
}
/**
 * Pick given properties from the target object.
 *
 * @param {Object} target
 * @param {Array} properties
 *
 * @return {Object} target
 */

function pick(target, properties) {
  var result = {};
  var obj = Object(target);
  forEach(properties, function (prop) {
    if (prop in obj) {
      result[prop] = target[prop];
    }
  });
  return result;
}
/**
 * Pick all target properties, excluding the given ones.
 *
 * @param {Object} target
 * @param {Array} properties
 *
 * @return {Object} target
 */

function omit(target, properties) {
  var result = {};
  var obj = Object(target);
  forEach(obj, function (prop, key) {
    if (properties.indexOf(key) === -1) {
      result[key] = prop;
    }
  });
  return result;
}
/**
 * Recursively merge `...sources` into given target.
 *
 * Does support merging objects; does not support merging arrays.
 *
 * @param {Object} target
 * @param {...Object} sources
 *
 * @return {Object} the target
 */

function merge(target) {
  for (var _len2 = arguments.length, sources = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    sources[_key2 - 1] = arguments[_key2];
  }

  if (!sources.length) {
    return target;
  }

  forEach(sources, function (source) {
    // skip non-obj sources, i.e. null
    if (!source || !isObject(source)) {
      return;
    }

    forEach(source, function (sourceVal, key) {
      if (key === '__proto__') {
        return;
      }

      var targetVal = target[key];

      if (isObject(sourceVal)) {
        if (!isObject(targetVal)) {
          // override target[key] with object
          targetVal = {};
        }

        target[key] = merge(targetVal, sourceVal);
      } else {
        target[key] = sourceVal;
      }
    });
  });
  return target;
}




/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js":
/*!**************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/min-dom/dist/index.esm.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "attr": () => (/* binding */ attr),
/* harmony export */   "classes": () => (/* binding */ classes),
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "closest": () => (/* binding */ closest),
/* harmony export */   "delegate": () => (/* binding */ delegate),
/* harmony export */   "domify": () => (/* binding */ domify),
/* harmony export */   "event": () => (/* binding */ componentEvent),
/* harmony export */   "matches": () => (/* binding */ matchesSelector),
/* harmony export */   "query": () => (/* binding */ query),
/* harmony export */   "queryAll": () => (/* binding */ all),
/* harmony export */   "remove": () => (/* binding */ remove)
/* harmony export */ });
/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {Element} el
 * @param {String} name
 * @param {String} [val]
 * @api public
 */
function attr(el, name, val) {
  // get
  if (arguments.length == 2) {
    return el.getAttribute(name);
  }

  // remove
  if (val === null) {
    return el.removeAttribute(name);
  }

  // set
  el.setAttribute(name, val);

  return el;
}

var indexOf = [].indexOf;

var indexof = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/**
 * Taken from https://github.com/component/classes
 *
 * Without the component bits.
 */

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

function classes(el) {
  return new ClassList(el);
}

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function (name) {
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = indexof(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function (name) {
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = indexof(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function (re) {
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function (name, force) {
  // classList
  if (this.list) {
    if ('undefined' !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ('undefined' !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function () {
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has = ClassList.prototype.contains = function (name) {
  return this.list ? this.list.contains(name) : !!~indexof(this.array(), name);
};

/**
 * Remove all children from the given element.
 */
function clear(el) {

  var c;

  while (el.childNodes.length) {
    c = el.childNodes[0];
    el.removeChild(c);
  }

  return el;
}

var proto = typeof Element !== 'undefined' ? Element.prototype : {};
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

var matchesSelector = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Boolean} checkYourSelf (optional)
 */
function closest (element, selector, checkYourSelf) {
  var currentElem = checkYourSelf ? element : element.parentNode;

  while (currentElem && currentElem.nodeType !== document.DOCUMENT_NODE && currentElem.nodeType !== document.DOCUMENT_FRAGMENT_NODE) {

    if (matchesSelector(currentElem, selector)) {
      return currentElem;
    }

    currentElem = currentElem.parentNode;
  }

  return matchesSelector(currentElem, selector) ? currentElem : null;
}

var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

var bind_1 = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

var unbind_1 = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};

var componentEvent = {
	bind: bind_1,
	unbind: unbind_1
};

/**
 * Module dependencies.
 */

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

// Some events don't bubble, so we want to bind to the capture phase instead
// when delegating.
var forceCaptureEvents = ['focus', 'blur'];

function bind$1(el, selector, type, fn, capture) {
  if (forceCaptureEvents.indexOf(type) !== -1) {
    capture = true;
  }

  return componentEvent.bind(el, type, function (e) {
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) {
      fn.call(el, e);
    }
  }, capture);
}

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */
function unbind$1(el, type, fn, capture) {
  if (forceCaptureEvents.indexOf(type) !== -1) {
    capture = true;
  }

  return componentEvent.unbind(el, type, fn, capture);
}

var delegate = {
  bind: bind$1,
  unbind: unbind$1
};

/**
 * Expose `parse`.
 */

var domify = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

function query(selector, el) {
  el = el || document;

  return el.querySelector(selector);
}

function all(selector, el) {
  el = el || document;

  return el.querySelectorAll(selector);
}

function remove(el) {
  el.parentNode && el.parentNode.removeChild(el);
}




/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/randomcolor/randomColor.js":
/*!***************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/randomcolor/randomColor.js ***!
  \***************************************************************************/
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
// randomColor by David Merfield under the CC0 license
// https://github.com/davidmerfield/randomColor/

;(function(root, factory) {

  // Support CommonJS
  if (true) {
    var randomColor = factory();

    // Support NodeJS & Component, which allow module.exports to be a function
    if ( true && module && module.exports) {
      exports = module.exports = randomColor;
    }

    // Support CommonJS 1.1.1 spec
    exports.randomColor = randomColor;

  // Support AMD
  } else {}

}(this, function() {

  // Seed to get repeatable colors
  var seed = null;

  // Shared color dictionary
  var colorDictionary = {};

  // Populate the color dictionary
  loadColorBounds();

  // check if a range is taken
  var colorRanges = [];

  var randomColor = function (options) {

    options = options || {};

    // Check if there is a seed and ensure it's an
    // integer. Otherwise, reset the seed value.
    if (options.seed !== undefined && options.seed !== null && options.seed === parseInt(options.seed, 10)) {
      seed = options.seed;

    // A string was passed as a seed
    } else if (typeof options.seed === 'string') {
      seed = stringToInteger(options.seed);

    // Something was passed as a seed but it wasn't an integer or string
    } else if (options.seed !== undefined && options.seed !== null) {
      throw new TypeError('The seed value must be an integer or string');

    // No seed, reset the value outside.
    } else {
      seed = null;
    }

    var H,S,B;

    // Check if we need to generate multiple colors
    if (options.count !== null && options.count !== undefined) {

      var totalColors = options.count,
          colors = [];
      // Value false at index i means the range i is not taken yet.
      for (var i = 0; i < options.count; i++) {
        colorRanges.push(false)
        }
      options.count = null;

      while (totalColors > colors.length) {

        var color = randomColor(options);

        if (seed !== null) {
          options.seed = seed;
        }

        colors.push(color);
      }

      options.count = totalColors;

      return colors;
    }

    // First we pick a hue (H)
    H = pickHue(options);

    // Then use H to determine saturation (S)
    S = pickSaturation(H, options);

    // Then use S and H to determine brightness (B).
    B = pickBrightness(H, S, options);

    // Then we return the HSB color in the desired format
    return setFormat([H,S,B], options);
  };

  function pickHue(options) {
    if (colorRanges.length > 0) {
      var hueRange = getRealHueRange(options.hue)

      var hue = randomWithin(hueRange)

      //Each of colorRanges.length ranges has a length equal approximatelly one step
      var step = (hueRange[1] - hueRange[0]) / colorRanges.length

      var j = parseInt((hue - hueRange[0]) / step)

      //Check if the range j is taken
      if (colorRanges[j] === true) {
        j = (j + 2) % colorRanges.length
      }
      else {
        colorRanges[j] = true
           }

      var min = (hueRange[0] + j * step) % 359,
          max = (hueRange[0] + (j + 1) * step) % 359;

      hueRange = [min, max]

      hue = randomWithin(hueRange)

      if (hue < 0) {hue = 360 + hue;}
      return hue
    }
    else {
      var hueRange = getHueRange(options.hue)

      hue = randomWithin(hueRange);
      // Instead of storing red as two seperate ranges,
      // we group them, using negative numbers
      if (hue < 0) {
        hue = 360 + hue;
      }

      return hue;
    }
  }

  function pickSaturation (hue, options) {

    if (options.hue === 'monochrome') {
      return 0;
    }

    if (options.luminosity === 'random') {
      return randomWithin([0,100]);
    }

    var saturationRange = getSaturationRange(hue);

    var sMin = saturationRange[0],
        sMax = saturationRange[1];

    switch (options.luminosity) {

      case 'bright':
        sMin = 55;
        break;

      case 'dark':
        sMin = sMax - 10;
        break;

      case 'light':
        sMax = 55;
        break;
   }

    return randomWithin([sMin, sMax]);

  }

  function pickBrightness (H, S, options) {

    var bMin = getMinimumBrightness(H, S),
        bMax = 100;

    switch (options.luminosity) {

      case 'dark':
        bMax = bMin + 20;
        break;

      case 'light':
        bMin = (bMax + bMin)/2;
        break;

      case 'random':
        bMin = 0;
        bMax = 100;
        break;
    }

    return randomWithin([bMin, bMax]);
  }

  function setFormat (hsv, options) {

    switch (options.format) {

      case 'hsvArray':
        return hsv;

      case 'hslArray':
        return HSVtoHSL(hsv);

      case 'hsl':
        var hsl = HSVtoHSL(hsv);
        return 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)';

      case 'hsla':
        var hslColor = HSVtoHSL(hsv);
        var alpha = options.alpha || Math.random();
        return 'hsla('+hslColor[0]+', '+hslColor[1]+'%, '+hslColor[2]+'%, ' + alpha + ')';

      case 'rgbArray':
        return HSVtoRGB(hsv);

      case 'rgb':
        var rgb = HSVtoRGB(hsv);
        return 'rgb(' + rgb.join(', ') + ')';

      case 'rgba':
        var rgbColor = HSVtoRGB(hsv);
        var alpha = options.alpha || Math.random();
        return 'rgba(' + rgbColor.join(', ') + ', ' + alpha + ')';

      default:
        return HSVtoHex(hsv);
    }

  }

  function getMinimumBrightness(H, S) {

    var lowerBounds = getColorInfo(H).lowerBounds;

    for (var i = 0; i < lowerBounds.length - 1; i++) {

      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1];

      var s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];

      if (S >= s1 && S <= s2) {

         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;

         return m*S + b;
      }

    }

    return 0;
  }

  function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {

      var number = parseInt(colorInput);

      if (number < 360 && number > 0) {
        return [number, number];
      }

    }

    if (typeof colorInput === 'string') {

      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange;}
      } else if (colorInput.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
        var hue = HexToHSB(colorInput)[0];
        return [ hue, hue ];
      }
    }

    return [0,360];

  }

  function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
  }

  function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360;
    }

    for (var colorName in colorDictionary) {
       var color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
       }
    } return 'Color not found';
  }

  function randomWithin (range) {
    if (seed === null) {
      //generate random evenly destinct number from : https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
      var golden_ratio = 0.618033988749895
      var r=Math.random()
      r += golden_ratio
      r %= 1
      return Math.floor(range[0] + r*(range[1] + 1 - range[0]));
    } else {
      //Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
      var max = range[1] || 1;
      var min = range[0] || 0;
      seed = (seed * 9301 + 49297) % 233280;
      var rnd = seed / 233280.0;
      return Math.floor(min + rnd * (max - min));
}
  }

  function HSVtoHex (hsv){

    var rgb = HSVtoRGB(hsv);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    var hex = '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

    return hex;

  }

  function defineColor (name, hueRange, lowerBounds) {

    var sMin = lowerBounds[0][0],
        sMax = lowerBounds[lowerBounds.length - 1][0],

        bMin = lowerBounds[lowerBounds.length - 1][1],
        bMax = lowerBounds[0][1];

    colorDictionary[name] = {
      hueRange: hueRange,
      lowerBounds: lowerBounds,
      saturationRange: [sMin, sMax],
      brightnessRange: [bMin, bMax]
    };

  }

  function loadColorBounds () {

    defineColor(
      'monochrome',
      null,
      [[0,0],[100,0]]
    );

    defineColor(
      'red',
      [-26,18],
      [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
    );

    defineColor(
      'orange',
      [18,46],
      [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
    );

    defineColor(
      'yellow',
      [46,62],
      [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
    );

    defineColor(
      'green',
      [62,178],
      [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
    );

    defineColor(
      'blue',
      [178, 257],
      [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
    );

    defineColor(
      'purple',
      [257, 282],
      [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
    );

    defineColor(
      'pink',
      [282, 334],
      [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
    );

  }

  function HSVtoRGB (hsv) {

    // this doesn't work for the values of 0 and 360
    // here's the hacky fix
    var h = hsv[0];
    if (h === 0) {h = 1;}
    if (h === 360) {h = 359;}

    // Rebase the h,s,v values
    h = h/360;
    var s = hsv[1]/100,
        v = hsv[2]/100;

    var h_i = Math.floor(h*6),
      f = h * 6 - h_i,
      p = v * (1 - s),
      q = v * (1 - f*s),
      t = v * (1 - (1 - f)*s),
      r = 256,
      g = 256,
      b = 256;

    switch(h_i) {
      case 0: r = v; g = t; b = p;  break;
      case 1: r = q; g = v; b = p;  break;
      case 2: r = p; g = v; b = t;  break;
      case 3: r = p; g = q; b = v;  break;
      case 4: r = t; g = p; b = v;  break;
      case 5: r = v; g = p; b = q;  break;
    }

    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
    return result;
  }

  function HexToHSB (hex) {
    hex = hex.replace(/^#/, '');
    hex = hex.length === 3 ? hex.replace(/(.)/g, '$1$1') : hex;

    var red = parseInt(hex.substr(0, 2), 16) / 255,
          green = parseInt(hex.substr(2, 2), 16) / 255,
          blue = parseInt(hex.substr(4, 2), 16) / 255;

    var cMax = Math.max(red, green, blue),
          delta = cMax - Math.min(red, green, blue),
          saturation = cMax ? (delta / cMax) : 0;

    switch (cMax) {
      case red: return [ 60 * (((green - blue) / delta) % 6) || 0, saturation, cMax ];
      case green: return [ 60 * (((blue - red) / delta) + 2) || 0, saturation, cMax ];
      case blue: return [ 60 * (((red - green) / delta) + 4) || 0, saturation, cMax ];
    }
  }

  function HSVtoHSL (hsv) {
    var h = hsv[0],
      s = hsv[1]/100,
      v = hsv[2]/100,
      k = (2-s)*v;

    return [
      h,
      Math.round(s*v / (k<1 ? k : 2-k) * 10000) / 100,
      k/2 * 100
    ];
  }

  function stringToInteger (string) {
    var total = 0
    for (var i = 0; i !== string.length; i++) {
      if (total >= Number.MAX_SAFE_INTEGER) break;
      total += string.charCodeAt(i)
    }
    return total
  }

  // get The range of given hue when options.count!=0
  function getRealHueRange(colorHue)
  { if (!isNaN(colorHue)) {
    var number = parseInt(colorHue);

    if (number < 360 && number > 0) {
      return getColorInfo(colorHue).hueRange
    }
  }
    else if (typeof colorHue === 'string') {

      if (colorDictionary[colorHue]) {
        var color = colorDictionary[colorHue];

        if (color.hueRange) {
          return color.hueRange
       }
    } else if (colorHue.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
        var hue = HexToHSB(colorHue)[0]
        return getColorInfo(hue).hueRange
    }
  }

    return [0,360]
}
  return randomColor;
}));


/***/ }),

/***/ "../bpmn-js-token-simulation/node_modules/tiny-svg/dist/index.esm.js":
/*!***************************************************************************!*\
  !*** ../bpmn-js-token-simulation/node_modules/tiny-svg/dist/index.esm.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "append": () => (/* binding */ append),
/* harmony export */   "appendTo": () => (/* binding */ appendTo),
/* harmony export */   "attr": () => (/* binding */ attr),
/* harmony export */   "classes": () => (/* binding */ classes),
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "innerSVG": () => (/* binding */ innerSVG),
/* harmony export */   "prepend": () => (/* binding */ prepend),
/* harmony export */   "prependTo": () => (/* binding */ prependTo),
/* harmony export */   "remove": () => (/* binding */ remove),
/* harmony export */   "replace": () => (/* binding */ replace),
/* harmony export */   "transform": () => (/* binding */ transform),
/* harmony export */   "on": () => (/* binding */ on),
/* harmony export */   "off": () => (/* binding */ off),
/* harmony export */   "createPoint": () => (/* binding */ createPoint),
/* harmony export */   "createMatrix": () => (/* binding */ createMatrix),
/* harmony export */   "createTransform": () => (/* binding */ createTransform),
/* harmony export */   "select": () => (/* binding */ select),
/* harmony export */   "selectAll": () => (/* binding */ selectAll)
/* harmony export */ });
function ensureImported(element, target) {

  if (element.ownerDocument !== target.ownerDocument) {
    try {
      // may fail on webkit
      return target.ownerDocument.importNode(element, true);
    } catch (e) {
      // ignore
    }
  }

  return element;
}

/**
 * appendTo utility
 */

/**
 * Append a node to a target element and return the appended node.
 *
 * @param  {SVGElement} element
 * @param  {SVGElement} target
 *
 * @return {SVGElement} the appended node
 */
function appendTo(element, target) {
  return target.appendChild(ensureImported(element, target));
}

/**
 * append utility
 */

/**
 * Append a node to an element
 *
 * @param  {SVGElement} element
 * @param  {SVGElement} node
 *
 * @return {SVGElement} the element
 */
function append(target, node) {
  appendTo(node, target);
  return target;
}

/**
 * attribute accessor utility
 */

var LENGTH_ATTR = 2;

var CSS_PROPERTIES = {
  'alignment-baseline': 1,
  'baseline-shift': 1,
  'clip': 1,
  'clip-path': 1,
  'clip-rule': 1,
  'color': 1,
  'color-interpolation': 1,
  'color-interpolation-filters': 1,
  'color-profile': 1,
  'color-rendering': 1,
  'cursor': 1,
  'direction': 1,
  'display': 1,
  'dominant-baseline': 1,
  'enable-background': 1,
  'fill': 1,
  'fill-opacity': 1,
  'fill-rule': 1,
  'filter': 1,
  'flood-color': 1,
  'flood-opacity': 1,
  'font': 1,
  'font-family': 1,
  'font-size': LENGTH_ATTR,
  'font-size-adjust': 1,
  'font-stretch': 1,
  'font-style': 1,
  'font-variant': 1,
  'font-weight': 1,
  'glyph-orientation-horizontal': 1,
  'glyph-orientation-vertical': 1,
  'image-rendering': 1,
  'kerning': 1,
  'letter-spacing': 1,
  'lighting-color': 1,
  'marker': 1,
  'marker-end': 1,
  'marker-mid': 1,
  'marker-start': 1,
  'mask': 1,
  'opacity': 1,
  'overflow': 1,
  'pointer-events': 1,
  'shape-rendering': 1,
  'stop-color': 1,
  'stop-opacity': 1,
  'stroke': 1,
  'stroke-dasharray': 1,
  'stroke-dashoffset': 1,
  'stroke-linecap': 1,
  'stroke-linejoin': 1,
  'stroke-miterlimit': 1,
  'stroke-opacity': 1,
  'stroke-width': LENGTH_ATTR,
  'text-anchor': 1,
  'text-decoration': 1,
  'text-rendering': 1,
  'unicode-bidi': 1,
  'visibility': 1,
  'word-spacing': 1,
  'writing-mode': 1
};


function getAttribute(node, name) {
  if (CSS_PROPERTIES[name]) {
    return node.style[name];
  } else {
    return node.getAttributeNS(null, name);
  }
}

function setAttribute(node, name, value) {
  var hyphenated = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  var type = CSS_PROPERTIES[hyphenated];

  if (type) {
    // append pixel unit, unless present
    if (type === LENGTH_ATTR && typeof value === 'number') {
      value = String(value) + 'px';
    }

    node.style[hyphenated] = value;
  } else {
    node.setAttributeNS(null, name, value);
  }
}

function setAttributes(node, attrs) {

  var names = Object.keys(attrs), i, name;

  for (i = 0, name; (name = names[i]); i++) {
    setAttribute(node, name, attrs[name]);
  }
}

/**
 * Gets or sets raw attributes on a node.
 *
 * @param  {SVGElement} node
 * @param  {Object} [attrs]
 * @param  {String} [name]
 * @param  {String} [value]
 *
 * @return {String}
 */
function attr(node, name, value) {
  if (typeof name === 'string') {
    if (value !== undefined) {
      setAttribute(node, name, value);
    } else {
      return getAttribute(node, name);
    }
  } else {
    setAttributes(node, name);
  }

  return node;
}

/**
 * Clear utility
 */
function index(arr, obj) {
  if (arr.indexOf) {
    return arr.indexOf(obj);
  }


  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) {
      return i;
    }
  }

  return -1;
}

var re = /\s+/;

var toString = Object.prototype.toString;

function defined(o) {
  return typeof o !== 'undefined';
}

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

function classes(el) {
  return new ClassList(el);
}

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name) {

  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) {
    arr.push(name);
  }

  if (defined(this.el.className.baseVal)) {
    this.el.className.baseVal = arr.join(' ');
  } else {
    this.el.className = arr.join(' ');
  }

  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name) {
  if ('[object RegExp]' === toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) {
    arr.splice(i, 1);
  }
  this.el.className.baseVal = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re) {
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force) {
  // classList
  if (this.list) {
    if (defined(force)) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if (defined(force)) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function() {
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) {
    arr.shift();
  }
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name) {
  return (
    this.list ?
      this.list.contains(name) :
      !! ~index(this.array(), name)
  );
};

function remove(element) {
  var parent = element.parentNode;

  if (parent) {
    parent.removeChild(element);
  }

  return element;
}

/**
 * Clear utility
 */

/**
 * Removes all children from the given element
 *
 * @param  {DOMElement} element
 * @return {DOMElement} the element (for chaining)
 */
function clear(element) {
  var child;

  while ((child = element.firstChild)) {
    remove(child);
  }

  return element;
}

function clone(element) {
  return element.cloneNode(true);
}

var ns = {
  svg: 'http://www.w3.org/2000/svg'
};

/**
 * DOM parsing utility
 */

var SVG_START = '<svg xmlns="' + ns.svg + '"';

function parse(svg) {

  var unwrap = false;

  // ensure we import a valid svg document
  if (svg.substring(0, 4) === '<svg') {
    if (svg.indexOf(ns.svg) === -1) {
      svg = SVG_START + svg.substring(4);
    }
  } else {
    // namespace svg
    svg = SVG_START + '>' + svg + '</svg>';
    unwrap = true;
  }

  var parsed = parseDocument(svg);

  if (!unwrap) {
    return parsed;
  }

  var fragment = document.createDocumentFragment();

  var parent = parsed.firstChild;

  while (parent.firstChild) {
    fragment.appendChild(parent.firstChild);
  }

  return fragment;
}

function parseDocument(svg) {

  var parser;

  // parse
  parser = new DOMParser();
  parser.async = false;

  return parser.parseFromString(svg, 'text/xml');
}

/**
 * Create utility for SVG elements
 */


/**
 * Create a specific type from name or SVG markup.
 *
 * @param {String} name the name or markup of the element
 * @param {Object} [attrs] attributes to set on the element
 *
 * @returns {SVGElement}
 */
function create(name, attrs) {
  var element;

  if (name.charAt(0) === '<') {
    element = parse(name).firstChild;
    element = document.importNode(element, true);
  } else {
    element = document.createElementNS(ns.svg, name);
  }

  if (attrs) {
    attr(element, attrs);
  }

  return element;
}

/**
 * Events handling utility
 */

function on(node, event, listener, useCapture) {
  node.addEventListener(event, listener, useCapture);
}

function off(node, event, listener, useCapture) {
  node.removeEventListener(event, listener, useCapture);
}

/**
 * Geometry helpers
 */

// fake node used to instantiate svg geometry elements
var node = create('svg');

function extend(object, props) {
  var i, k, keys = Object.keys(props);

  for (i = 0; (k = keys[i]); i++) {
    object[k] = props[k];
  }

  return object;
}


function createPoint(x, y) {
  var point = node.createSVGPoint();

  switch (arguments.length) {
  case 0:
    return point;
  case 2:
    x = {
      x: x,
      y: y
    };
    break;
  }

  return extend(point, x);
}

/**
 * Create matrix via args.
 *
 * @example
 *
 * createMatrix({ a: 1, b: 1 });
 * createMatrix();
 * createMatrix(1, 2, 0, 0, 30, 20);
 *
 * @return {SVGMatrix}
 */
function createMatrix(a, b, c, d, e, f) {
  var matrix = node.createSVGMatrix();

  switch (arguments.length) {
  case 0:
    return matrix;
  case 1:
    return extend(matrix, a);
  case 6:
    return extend(matrix, {
      a: a,
      b: b,
      c: c,
      d: d,
      e: e,
      f: f
    });
  }
}

function createTransform(matrix) {
  if (matrix) {
    return node.createSVGTransformFromMatrix(matrix);
  } else {
    return node.createSVGTransform();
  }
}

/**
 * Serialization util
 */

var TEXT_ENTITIES = /([&<>]{1})/g;
var ATTR_ENTITIES = /([\n\r"]{1})/g;

var ENTITY_REPLACEMENT = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '\''
};

function escape(str, pattern) {

  function replaceFn(match, entity) {
    return ENTITY_REPLACEMENT[entity] || entity;
  }

  return str.replace(pattern, replaceFn);
}

function serialize(node, output) {

  var i, len, attrMap, attrNode, childNodes;

  switch (node.nodeType) {
  // TEXT
  case 3:
    // replace special XML characters
    output.push(escape(node.textContent, TEXT_ENTITIES));
    break;

  // ELEMENT
  case 1:
    output.push('<', node.tagName);

    if (node.hasAttributes()) {
      attrMap = node.attributes;
      for (i = 0, len = attrMap.length; i < len; ++i) {
        attrNode = attrMap.item(i);
        output.push(' ', attrNode.name, '="', escape(attrNode.value, ATTR_ENTITIES), '"');
      }
    }

    if (node.hasChildNodes()) {
      output.push('>');
      childNodes = node.childNodes;
      for (i = 0, len = childNodes.length; i < len; ++i) {
        serialize(childNodes.item(i), output);
      }
      output.push('</', node.tagName, '>');
    } else {
      output.push('/>');
    }
    break;

  // COMMENT
  case 8:
    output.push('<!--', escape(node.nodeValue, TEXT_ENTITIES), '-->');
    break;

  // CDATA
  case 4:
    output.push('<![CDATA[', node.nodeValue, ']]>');
    break;

  default:
    throw new Error('unable to handle node ' + node.nodeType);
  }

  return output;
}

/**
 * innerHTML like functionality for SVG elements.
 * based on innerSVG (https://code.google.com/p/innersvg)
 */


function set(element, svg) {

  var parsed = parse(svg);

  // clear element contents
  clear(element);

  if (!svg) {
    return;
  }

  if (!isFragment(parsed)) {
    // extract <svg> from parsed document
    parsed = parsed.documentElement;
  }

  var nodes = slice(parsed.childNodes);

  // import + append each node
  for (var i = 0; i < nodes.length; i++) {
    appendTo(nodes[i], element);
  }

}

function get(element) {
  var child = element.firstChild,
      output = [];

  while (child) {
    serialize(child, output);
    child = child.nextSibling;
  }

  return output.join('');
}

function isFragment(node) {
  return node.nodeName === '#document-fragment';
}

function innerSVG(element, svg) {

  if (svg !== undefined) {

    try {
      set(element, svg);
    } catch (e) {
      throw new Error('error parsing SVG: ' + e.message);
    }

    return element;
  } else {
    return get(element);
  }
}


function slice(arr) {
  return Array.prototype.slice.call(arr);
}

/**
 * Selection utilities
 */

function select(node, selector) {
  return node.querySelector(selector);
}

function selectAll(node, selector) {
  var nodes = node.querySelectorAll(selector);

  return [].map.call(nodes, function(element) {
    return element;
  });
}

/**
 * prependTo utility
 */

/**
 * Prepend a node to a target element and return the prepended node.
 *
 * @param  {SVGElement} node
 * @param  {SVGElement} target
 *
 * @return {SVGElement} the prepended node
 */
function prependTo(node, target) {
  return target.insertBefore(ensureImported(node, target), target.firstChild || null);
}

/**
 * prepend utility
 */

/**
 * Prepend a node to a target element
 *
 * @param  {SVGElement} target
 * @param  {SVGElement} node
 *
 * @return {SVGElement} the target element
 */
function prepend(target, node) {
  prependTo(node, target);
  return target;
}

/**
 * Replace utility
 */

function replace(element, replacement) {
  element.parentNode.replaceChild(ensureImported(replacement, element), element);
  return replacement;
}

/**
 * transform accessor utility
 */

function wrapMatrix(transformList, transform) {
  if (transform instanceof SVGMatrix) {
    return transformList.createSVGTransformFromMatrix(transform);
  }

  return transform;
}


function setTransforms(transformList, transforms) {
  var i, t;

  transformList.clear();

  for (i = 0; (t = transforms[i]); i++) {
    transformList.appendItem(wrapMatrix(transformList, t));
  }
}

/**
 * Get or set the transforms on the given node.
 *
 * @param {SVGElement} node
 * @param  {SVGTransform|SVGMatrix|Array<SVGTransform|SVGMatrix>} [transforms]
 *
 * @return {SVGTransform} the consolidated transform
 */
function transform(node, transforms) {
  var transformList = node.transform.baseVal;

  if (transforms) {

    if (!Array.isArray(transforms)) {
      transforms = [ transforms ];
    }

    setTransforms(transformList, transforms);
  }

  return transformList.consolidate();
}




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**************************!*\
  !*** ./client/client.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var camunda_modeler_plugin_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! camunda-modeler-plugin-helpers */ "./node_modules/camunda-modeler-plugin-helpers/index.js");
/* harmony import */ var bpmn_js_token_simulation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bpmn-js-token-simulation */ "../bpmn-js-token-simulation/lib/modeler.js");
/* harmony import */ var _HideModelerElements__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HideModelerElements */ "./client/HideModelerElements.js");
/* harmony import */ var _propertiesProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./propertiesProvider */ "./client/propertiesProvider/index.js");






const TokenSimulationPluginModule = {
  __depends__: [
    _propertiesProvider__WEBPACK_IMPORTED_MODULE_2__.default
  ],
  __init__: ['hideModelerElements'],
  hideModelerElements: ['type', _HideModelerElements__WEBPACK_IMPORTED_MODULE_1__.default]
};

(0,camunda_modeler_plugin_helpers__WEBPACK_IMPORTED_MODULE_0__.registerBpmnJSPlugin)(bpmn_js_token_simulation__WEBPACK_IMPORTED_MODULE_3__.default);
(0,camunda_modeler_plugin_helpers__WEBPACK_IMPORTED_MODULE_0__.registerBpmnJSPlugin)(TokenSimulationPluginModule);

})();

/******/ })()
;
//# sourceMappingURL=client.bundle.js.map