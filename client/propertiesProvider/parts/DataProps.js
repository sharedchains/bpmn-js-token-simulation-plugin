import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function(translate, group, element, data) {

  // Table
  if (is(element, 'bpmn:Process')
    || is(element, 'bpmn:Participant')
    || is(element, 'bpmn:SubProcess')) { // Is this needed?

    let tableEntry = entryFactory.table(translate, {
      id: 'data',
      labels: ['Name', 'Value'],
      modelProperties: ['name', 'value'],
      addElement: function(element, node) {
        data.addDataElement(element);
        return [];
      },
      getElements: function(element, node) {
        let dataElements = data.getDataElements(element);
        if (dataElements.length === 0) {
          return [];
        }
        let result = [];
        let dataMap = dataElements[0];
        for (let [key, value] of dataMap) {
          result.push({ name: key, value: value });
        }
        return result;
      },
      updateElement: function(element, value, node, idx) {
        data.updateDataElement(element, value, idx);
        return [];
      }

      // Validation?
    });
    // TODO: Need to rewrite addElement and createListEntryTemplate (and, of course createInputRowTemplate, to create data type select)

    group.entries.push(tableEntry);
  }
}
