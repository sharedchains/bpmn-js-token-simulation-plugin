import Modeler from 'bpmn-js/lib/Modeler';

import SimulationModule from 'bpmn-js-token-simulation';
import DataModule from '../../client/data';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import multiParticipantDiagram from '../bpmn/multiparticipant.bpmn';
import { SCOPE_CREATE_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';

describe('DataTokenSimulation module test', () => {

  function bootstrapDiagram(diagram) {
    beforeEach(bootstrapModeler(diagram, {
      additionalModules: [].concat(Modeler.prototype._modules).concat([
        SimulationModule,
        DataModule
      ]),
      keyboard: {
        bindTo: document
      }
    }));
  }

  describe('Data simulation', () => {
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

});