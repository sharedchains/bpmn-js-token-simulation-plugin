import Modeler from 'bpmn-js/lib/Modeler';

import SimulationModule from 'bpmn-js-token-simulation';
import DataModule from '../../client/data';
import DataSimulationModule from '../../client/simulation';

import moddleMock from '../mocks/data.json';
import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json';

import { bootstrapModeler, inject, getBpmnJS } from 'test/TestHelper';
import { assign, forEach } from 'min-dash';
import { query as domQuery } from 'min-dom';

import { SCOPE_CREATE_EVENT, SCOPE_DESTROYED_EVENT, TRACE_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';
import { is } from 'bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil';

import {
  CODE_EDITOR_PLUGIN_PRESENT_EVENT,
  HIGH_PRIORITY,
  RUN_CODE_EVALUATION_EVENT, TOGGLE_DATA_SIMULATION_EVENT
} from '../../client/events/EventHelper';

const VERY_HIGH_PRIORITY = 100000;

import eventTypes from '../../client/events/EventHelper';
import * as AllEvents from 'bpmn-js-token-simulation/lib/util/EventHelper';

import multiParticipantDiagram from '../bpmn/multiparticipant.bpmn';

const ENTER_EVENT = 'trace.elementEnter';

describe('DataTokenSimulation module test', () => {

  function bootstrapDiagram(diagram) {
    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [].concat(Modeler.prototype._modules).concat([
        SimulationModule,
        DataModule,
        DataSimulationModule,
        TestModule
      ]),
      keyboard: {
        bindTo: document
      },
      moddleExtensions: {
        camunda: camundaModdle,
        data: moddleMock
      }
    }));
  }

  function mockCodeEditor(eventBus, callback) {
    eventBus.once(RUN_CODE_EVALUATION_EVENT, HIGH_PRIORITY, (_event, _code, context) => {
      return callback(context);
    });
  }

  const TestModule = {
    __init__: [
      function(eventBus, animation) {
        animation.setAnimationSpeed(100);

        eventBus.on(TRACE_EVENT, function(event) {

          if (event.action === 'enter') {
            eventBus.fire(ENTER_EVENT, event);
          }
        });
      }
    ],
    trace: ['type', Log]
  };

  describe('Data object', () => {
    bootstrapDiagram(multiParticipantDiagram);

    it('should load data module', function(done) {
      inject(function(dataTokenSimulation) {

        let simulation = dataTokenSimulation.getDataSimulation();
        expect(simulation).to.be.an('array').that.is.empty;

        done();
      })();
    });

    it('should not have elements', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.an('undefined');

        done();
      })();
    });

    it('should add data element', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').that.is.not.empty;

        done();
      })();
    });

    it('should get data object', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');
        let participant = elementRegistry.get('P_A');

        dataTokenSimulation.addDataElement(startEvent);

        let data = dataTokenSimulation.getDataObject(participant);
        expect(data).to.be.an('object');

        done();
      })();
    });

    it('should get data simulation', function(done) {
      inject(async function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        dataTokenSimulation.addDataElementSimulation(startEvent, { name: 'goofy', value: 12, type: 'INTEGER' });
        await new Promise(r => setTimeout(r, 20));

        let data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data).to.be.a('map').that.is.not.empty;

        done();
      })();
    });

    it('should get data simulation empty', function(done) {
      inject(async function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        await new Promise(r => setTimeout(r, 20));

        let data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data).to.be.an('undefined');

        done();
      })();
    });

    it('should set a new data simulation map', function(done) {
      inject(async function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        let map = new Map();
        map.set('key', {});

        dataTokenSimulation.setDataSimulationMap(startEvent, map);
        await new Promise(r => setTimeout(r, 20));

        let data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data).to.be.a('map').that.is.not.empty;

        data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').that.is.empty;

        done();
      })();
    });

    it('should not have simulation undefined', function(done) {
      inject(async function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        let data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data).to.be.an('undefined');

        let map = new Map();
        map.set('key', {});

        dataTokenSimulation.setDataSimulationMap(startEvent, map);
        await new Promise(r => setTimeout(r, 20));

        data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data).to.be.a('map').that.is.not.empty;

        dataTokenSimulation.addDataElementSimulation(startEvent, { name: 'pluto', value: 1, type: 'INTEGER' });

        data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data.get('pluto')).to.be.not.an('undefined');

        done();
      })();
    });

    it('should update data simulation', function(done) {
      inject(async function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        let map = new Map();
        map.set('key', { name: 'key', value: 'value', type: 'STRING' });

        dataTokenSimulation.setDataSimulationMap(startEvent, map);
        await new Promise(r => setTimeout(r, 20));

        dataTokenSimulation.updateDataElementSimulation('P_A', { name: 'key', value: 'test', type: 'STRING' });

        let data = dataTokenSimulation.getDataElementSimulation(startEvent);
        expect(data.get('key')).to.be.not.an('undefined');
        expect(data.get('key').value).to.be.equal('test');

        done();
      })();
    });

    it('should update data element', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').to.have.property('size', 1);

        dataTokenSimulation.updateDataElement(startEvent, { name: 'donald', value: 2, type: 'INTEGER' }, 0);
        data = dataTokenSimulation.getDataElements(startEvent);
        expect(data.get('donald').value).to.be.equal(2);

        done();
      })();
    });

    it('should return without updating', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.updateDataElement(startEvent, { name: 'donald', value: 2, type: 'INTEGER' }, 0);
        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.an('undefined');

        done();
      })();
    });

    it('should remove data element', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').to.have.property('size', 1);

        dataTokenSimulation.removeDataElement(startEvent, 0);
        data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').that.is.empty;

        done();
      })();
    });

    it('should return without removing anything (cause it\'s empty)', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.removeDataElement(startEvent, 0);
        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.an('undefined');

        done();
      })();
    });

    it('should not remove anything', function(done) {
      inject(function(elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        let data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').to.have.property('size', 1);

        dataTokenSimulation.removeDataElement(startEvent, 7);
        data = dataTokenSimulation.getDataElements(startEvent);
        expect(data).to.be.a('map').to.have.property('size', 1);

        done();
      })();
    });

    it('should return data simulation', function(done) {
      inject(async function(eventBus, elementRegistry, dataTokenSimulation) {
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        dataTokenSimulation.updateDataElement(startEvent, { name: 'goofy', value: 1, type: 'INTEGER' }, 0);
        dataTokenSimulation.addDataElement(startEvent);
        dataTokenSimulation.updateDataElement(startEvent, { name: 'pluto', value: 2, type: 'INTEGER' }, 1);
        dataTokenSimulation.addDataElement(startEvent);
        dataTokenSimulation.updateDataElement(startEvent, { name: 'donald', value: 3, type: 'INTEGER' }, 2);

        eventBus.fire(SCOPE_CREATE_EVENT, { scope: { element: startEvent, initiator: undefined } });
        await new Promise(r => setTimeout(r, 500));

        dataTokenSimulation.updateDataElementSimulation('P_A', { name: 'donald', value: 500, type: 'INTEGER' });

        let data = dataTokenSimulation.getDataElements(startEvent);
        let sim = dataTokenSimulation.getDataElementSimulation(startEvent);

        expect(data).to.be.a('map').that.have.property('size', 3);
        expect(sim).to.be.a('map').that.have.property('size', 3);

        let donaldData = data.get('donald');
        let donaldSim = sim.get('donald');

        expect(donaldData).to.not.be.deep.equal(donaldSim);

        let simData = dataTokenSimulation.getDataSimulation();
        expect(simData[0]['P_A']).to.have.property('colors');
        expect(simData[0]['P_A']).to.have.property('simulation');
        expect(simData[0]['P_A'].simulation).to.deep.equal(sim);

        done();
      })();
    });

    it('should return an empty array', function(done) {
      inject(function(dataTokenSimulation) {
        let data = dataTokenSimulation.getDataElements();
        expect(data).to.be.an('array').that.is.empty;

        data = dataTokenSimulation.getDataElementSimulation();
        expect(data).to.be.an('array').that.is.empty;

        done();
      })();
    });

  });

  describe('Data simulation', () => {
    bootstrapDiagram(multiParticipantDiagram);

    beforeEach(inject(async function(eventBus) {
      eventBus.fire(CODE_EDITOR_PLUGIN_PRESENT_EVENT);
      await new Promise(r => setTimeout(r, 100));
      eventBus.fire(TOGGLE_DATA_SIMULATION_EVENT, { active: true });
    }));

    beforeEach(inject(function(toggleMode, trace) {
      toggleMode.toggleMode();

      trace.start();
    }));

    it('should complete process, running scripts',
      inject(async function(eventBus, elementRegistry, dataTokenSimulation) {
        mockCodeEditor(eventBus, (context) => {
          return { output: 'true', context };
        });
        let startEvent = elementRegistry.get('StartEvent_1');

        dataTokenSimulation.addDataElement(startEvent);
        dataTokenSimulation.updateDataElement(startEvent, { name: 'A', value: 1, type: 'INTEGER' }, 0);

        // when
        triggerElement('StartEvent_1');

        await elementEnter('EX_Gateway');
        elementEnter('B').then(() => {
          mockCodeEditor(eventBus, (context) => {
            return { output: '20', context };
          });
        });

        await elementEnter('Script_1');
        elementEnter('Flow_4').then(() => {
          mockCodeEditor(eventBus, (context) => {
            return { output: '3', context };
          });
        });

        await elementEnter('Script_2');
        elementEnter('Flow_5').then(() => {
          mockCodeEditor(eventBus, (context) => {
            return { output: '-4', context };
          });
        });

        await elementEnter('Script_3');
        elementEnter('Flow_6').then(() => {
          mockCodeEditor(eventBus, (context) => {
            return { output: '15', context };
          });
        });

        await elementEnter('Script_4');
        await scopeDestroyed();

        expectHistory([
          'StartEvent_1',
          'Flow_1',
          'SENDER',
          'Flow_2',
          'START_MESSAGE',
          'Flow_3',
          'EX_Gateway',
          'B',
          'Script_1',
          'Flow_4',
          'End_Agt0',
          'Script_2',
          'Flow_5',
          'Script_3',
          'Flow_6',
          'Script_4',
          'Flow_7',
          'End_Script'
        ]);
      })
    );
  });

});

/**
 * @license
 * Copyright 2014-present Camunda
 * SPDX-License-Identifier: MIT
 */

// helpers //////////

function Log(eventBus) {
  this.eventBus = eventBus;

  this.events = [];

  this._log = this._log.bind(this);
}

Log.prototype._log = function(event) {
  this.events.push(assign({}, event));
};

Log.prototype.start = function() {
  forEach(AllEvents, event => {
    this.eventBus.on(event, VERY_HIGH_PRIORITY, this._log);
  });
  forEach(eventTypes, event => {
    this.eventBus.on(event, VERY_HIGH_PRIORITY, this._log);
  });
};

Log.prototype.stop = function() {
  forEach(AllEvents, event => {
    this.eventBus.on(event, this._log);
  });
  forEach(eventTypes, event => {
    this.eventBus.on(event, this._log);
  });
};

Log.prototype.clear = function() {
  this.stop();

  this.events = [];
};

Log.prototype.getAll = function() {
  return this.events;
};

function ifElement(id, fn) {
  return function(event) {
    var element = event.element;

    if (element.id === id) {
      fn(event);
    }
  };
}

function triggerElement(id) {

  return getBpmnJS().invoke(function(bpmnjs) {

    const domElement = domQuery(
      `.djs-overlays[data-container-id="${id}"] .context-pad`,
      bpmnjs._container
    );

    if (!domElement) {
      throw new Error(`no context pad on on <${id}>`);
    }

    triggerClick(domElement);
  });
}

function triggerScope(scope) {

  return getBpmnJS().invoke(function(bpmnjs) {

    const domElement = domQuery(
      `.token-simulation-scopes [data-scope-id="${scope.id}"]`,
      bpmnjs._container
    );

    if (!domElement) {
      throw new Error(`no scope toggle for <${scope.id}>`);
    }

    triggerClick(domElement);
  });
}

function scopeDestroyed(scope = null) {

  return new Promise(resolve => {

    return getBpmnJS().invoke(function(eventBus) {

      const listener = function(event) {

        if (scope && event.scope !== scope) {
          return;
        }

        const scopeElements = [
          'bpmn:Participant',
          'bpmn:Process',
          'bpmn:SubProcess'
        ];

        if (scopeElements.every(t => !is(event.scope.element, t))) {
          return;
        }

        eventBus.off(SCOPE_DESTROYED_EVENT, listener);

        return resolve(event);
      };

      eventBus.on(SCOPE_DESTROYED_EVENT, listener);
    });
  });
}

function elementEnter(id = null) {

  return new Promise(resolve => {

    return getBpmnJS().invoke(function(eventBus) {

      const wrap = id ? (fn) => ifElement(id, fn) : fn => fn;

      const listener = wrap(function(event) {
        eventBus.off(ENTER_EVENT, listener);

        return resolve(event);
      });

      eventBus.on(ENTER_EVENT, listener);
    });
  });
}

function expectHistory(history) {

  return getBpmnJS().invoke(function(trace) {
    const events = trace.getAll()
      .filter(function(event) {
        return (
          (event.action === 'exit' && is(event.element, 'bpmn:StartEvent')) ||
          (event.action === 'enter')
        );
      })
      .map(function(event) {
        return event.element.id;
      });

    expect(events).to.eql(history);

    // console.log(JSON.stringify(events));
    // console.log(JSON.stringify(history));
    // console.log(JSON.stringify(trace.getAll().filter(e => e.element).map(event => {
    //   return {
    //     id: event.element.id,
    //     action: event.action
    //   };
    // })));
  });

}

function triggerClick(element, options = {}) {

  const defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  };

  options = Object.assign({}, defaultOptions, options);

  const event = document.createEvent('MouseEvents');

  event.initMouseEvent(
    'click',
    options.bubbles,
    options.cancelable,
    document.defaultView,
    options.button,
    options.pointerX,
    options.pointerY,
    options.pointerX,
    options.pointerY,
    options.ctrlKey,
    options.altKey,
    options.shiftKey,
    options.metaKey,
    options.button,
    element
  );

  element.dispatchEvent(event);
}