import { RUN_CODE_EVALUATION_EVENT } from '../../events/EventHelper';

export const isExpressionPattern = /^\${(.+?)}$/;
export const expressionPattern = /\${(.+?)}/;

export default function ScriptRunner(eventBus) {
  this._eventBus = eventBus;
}

ScriptRunner.prototype.runScript = async function(code, data, additionalData) {
  const eventBus = this._eventBus;

  const fireScriptRun = async (c, d) => {
    return eventBus.fire(RUN_CODE_EVALUATION_EVENT, c, Array.from(d.values()));
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