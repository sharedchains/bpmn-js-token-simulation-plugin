import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getRoot, findRootElementsByType } from 'bpmn-js-properties-panel/lib/Utils';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

export default function(translate, group, element, data) {

  // Table
  if (!is(element, 'bpmn:Collaboration')) {
    group.entries.push(entryFactory.table(translate, {
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
      })
    );
  }
}

// function getProcessOrParticipantElement(element) {
//   let bo = getBusinessObject(element);
//   if (is(bo, 'bpmn:Collaboration')) {
//     return;
//   }
//   let rootElement = getRootProcess(bo);
//   let rootElements = findRootElementsByType(element, 'bpmn:Process');
//   console.log('boh', rootElement, rootElements);
// }
//
// function getRootProcess(businessObject) {
//   var parent = businessObject;
//   while (parent.$parent && !is(parent, 'bpmn:Process')) {
//     parent = parent.$parent;
//   }
//   return parent;
// }