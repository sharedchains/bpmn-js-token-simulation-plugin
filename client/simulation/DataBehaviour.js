export default function DataBehavior(simulator, dataTokenSimulation) {
  this._simulator = simulator;
  this._data = dataTokenSimulation;

  // TODO: Will definitely answer to SCOPE events to return some data

  simulator.on('trace', (event) => {
    const {
      scope,
      action,
      element
    } = event;

    if (scope) {
      const {
        initiator,
        data,
        element: scopeElement
      } = scope;


      console.log(`${action}ing element ${scopeElement.id} with data ${JSON.stringify([...data], null, 2)}`);
      // TODO: DATA EVALUATION?
    }

    console.log(`${action} for element ${element.id}`);

  });

}

DataBehavior.$inject = ['simulator', 'dataTokenSimulation'];