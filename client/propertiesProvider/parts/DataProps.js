import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { escapeHTML } from 'bpmn-js-properties-panel/lib/Utils';

import { domify, query as domQuery } from 'min-dom';

import { is } from 'bpmn-js/lib/util/ModelUtil';

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

// TODO: Use eventBus to obtain types from codeEditor plugin!
const typeSelectValues = [
  { value: '', displayValue: '' },
  { value: 'BOOLEAN', displayValue: 'Boolean' },
  { value: 'BYTES', displayValue: 'Byte Array' },
  { value: 'STRING', displayValue: 'String' },
  { value: 'SHORT', displayValue: 'Short' },
  { value: 'DOUBLE', displayValue: 'Double' },
  { value: 'INTEGER', displayValue: 'Integer' },
  { value: 'LONG', displayValue: 'Long' },
  { value: 'DATE', displayValue: 'Date' },
  { value: 'DATETIME', displayValue: 'Date & time' },
  { value: 'JSON', displayValue: 'JSON' },
  { value: 'XML', displayValue: 'XML' }
];

function getContainer(node) {
  return domQuery('div[data-list-entry-container]', node);
}

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
  properties.forEach(function(prop, idx) {

    if (prop === 'type') {
      template += '<select class="bpp-table-row-columns-' + columns + ' ' +
        (canRemove ? 'bpp-table-row-removable' : '') + '" ' +
        'id="camunda-table-row-cell-input-value-' + idx + '" ' +
        'name="' + escapeHTML(prop) + '"' +
        ' data-value>';
      typeSelectValues.map(option => {
        template += '<option value="' + escapeHTML(option.value) + '">' +
          escapeHTML(option.displayValue) +
          '</option>';
      });
      template += '</select>';
    } else {
      template += '<input class="bpp-table-row-columns-' + columns + ' ' +
        (canRemove ? 'bpp-table-row-removable' : '') + '" ' +
        'id="camunda-table-row-cell-input-value-' + idx + '" ' +
        'type="text" ' +
        'name="' + escapeHTML(prop) + '" />';
    }
  });
  return template;
}

export default function(translate, group, element, data) {

  // Table
  let modelProperties = ['name', 'value', 'type'];
  let canRemove = true;

  if (is(element, 'bpmn:Process')
    || is(element, 'bpmn:Participant')
    || is(element, 'bpmn:SubProcess')) { // Is this needed?
    let tableEntry = entryFactory.table(translate, {
      id: 'data',
      labels: ['Name', 'Value', 'Type'],
      modelProperties,
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
        for (let value of dataMap.values()) {
          result.push(value);
        }
        return result;
      },
      updateElement: function(element, value, node, idx) {
        data.updateDataElement(element, value, idx);
        return [];
      },
      removeElement: function(element, node, idx) {
        data.removeDataElement(element, idx);
        return [];
      }

      // Validation?
    });

    // Need to rewrite addElement and createListEntryTemplate (and, of course createInputRowTemplate, to create data type select)
    tableEntry.addElement = function(element, node, event, scopeNode) {
      var template = domify(createInputRowTemplate(modelProperties, canRemove));

      var container = getContainer(node);
      container.appendChild(template);

      this.__action = {
        id: 'add-element'
      };

      return true;
    };
    tableEntry.createListEntryTemplate = function(value, index, selectBox) {
      return createInputRowTemplate(modelProperties, canRemove);
    };

    group.entries.push(tableEntry);
  }
}
