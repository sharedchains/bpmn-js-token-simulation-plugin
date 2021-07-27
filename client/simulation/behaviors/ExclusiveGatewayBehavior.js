import { filterSequenceFlows } from 'bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { expressionPattern, isExpressionPattern } from '../script-runner/ScriptRunner';

export default function ExclusiveGatewayBehavior(simulator, scriptRunner, exclusiveGatewayBehavior, dataNotifications) {
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
  return filterSequenceFlows(element.outgoing).sort((first, second) => {
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

  if (scope.data && scope.data.size) {

    let bo = getBusinessObject(element);
    const defaultFlow = bo.default?.id;

    const outgoings = this.sortSequenceFlows(element, defaultFlow);

    const promises = [];

    outgoings.every(async outgoing => {
      let outgoingBo = getBusinessObject(outgoing);
      const conditionExpression = outgoingBo.conditionExpression;
      if (conditionExpression) {
        const expression = conditionExpression.body;
        let code;

        if (conditionExpression?.language === 'groovy') {
          code = expression;
        } else if (isExpressionPattern.test(expression)) {

          // Expression
          const expressionMatch = expression.match(expressionPattern);
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