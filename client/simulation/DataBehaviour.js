export default function DataBehavior(simulator, dataTokenSimulation) {
  this._simulator = simulator;
  this._data = dataTokenSimulation;

  // TODO: Will definitely answer to SCOPE events to return some data

  /*
   * TODO : Gateway sequenceflow order for evaluation
   *
   * If set default and more than 2 ways, with a 'cross-condition' evaluation, choose the first following flow-id order
   * i.e. flow-1 === default
   * [ flow-2, flow-3, flow-1] (like a switch-case instruction)
   *
   */

  simulator.on('trace', (event) => {
    const {
      scope,
      action,
      element
    } = event;

    if (scope) {
      const {
        initiator,
        data
      } = scope;

      if (initiator && initiator.type === 'bpmn:MessageFlow') {
        // TODO : We need to pass the scope from the "source" process to the "target" process
      }

      console.log(`${action}ing element ${element.id} with data ${JSON.stringify(data, null, 2)}`);
      // TODO: DATA EVALUATION?
    }

    console.log(`${action} for element ${element.id}`);

  });

}

DataBehavior.$inject = ['simulator', 'dataTokenSimulation'];