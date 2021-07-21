import { filterSequenceFlows } from 'bpmn-js-token-simulation/lib/simulator/behaviors/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { RUN_CODE_EVALUATION_EVENT } from '../events/EventHelper';

const isExpressionPattern = /^\${(.+?)}$/;
const expressionPattern = /\${(.+?)}/;

export default function ExclusiveGatewayBehavior(simulator, eventBus, exclusiveGatewayBehavior) {
  this._simulator = simulator;
  this._eventBus = eventBus;
  this._exclusiveGatewayBehavior = exclusiveGatewayBehavior;

  this.runScript = async (code, data, outgoing, ctx) => {

    const fireScriptRun = (c, d) => {
      return Promise.resolve(this._eventBus.fire(RUN_CODE_EVALUATION_EVENT, c, Array.from(d.values())));
    };

    const results = await fireScriptRun(code, data);
    if (results.output && results.output === 'true') {
      this._simulator.setConfig(ctx.element, { activeOutgoing: outgoing });
      this._exclusiveGatewayBehavior.enter(ctx);
      return Promise.resolve(results);
    } else {
      throw new Error('Unable to evaluate expression');
    }
  }

  simulator.registerBehavior('bpmn:ExclusiveGateway', this);
}

ExclusiveGatewayBehavior.prototype.enter = function(context) {
  const { element, scope } = context;

  if (scope.data && scope.data.size) {

    const outgoings = filterSequenceFlows(element.outgoing);

    /*
     * TODO : Gateway sequenceflow order for evaluation
     *
     * If set default and more than 2 ways, with a 'cross-condition' evaluation, choose the first following flow-id order
     * i.e. flow-1 === default
     * [ flow-2, flow-3, flow-1] (like a switch-case instruction)
     *
     */

    outgoings.forEach(async outgoing => {
      console.log(outgoing);
      let bo = getBusinessObject(outgoing);
      const conditionExpression = bo.conditionExpression;
      const expression = conditionExpression.body;
      let code;

      if (conditionExpression.language && conditionExpression.language === 'groovy') {
        code = expression;
      } else if (isExpressionPattern.test(expression)) {

        // Expression
        const expressionMatch = expression.match(expressionPattern);
        code = expressionMatch[1];
      } else {

        /*
         * TODO: Notification warning - Script is not groovy?
         *  USE ElementSupport / ElementNotification module example
         */

      }

      // Script
      try {
        await this.runScript(code, scope.data, outgoing, context);
      } catch (e) {

        /*
         * TODO: Notification warning - Script error
         *  USE ElementSupport / ElementNotification module example
         */
      }

    });
  } else {
    this._exclusiveGatewayBehavior.enter(context);
  }
};

ExclusiveGatewayBehavior.prototype.exit = function(context) {
  return this._exclusiveGatewayBehavior.exit(context);
};

ExclusiveGatewayBehavior.$inject = ['simulator', 'eventBus', 'exclusiveGatewayBehavior'];