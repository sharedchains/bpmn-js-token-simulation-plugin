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

function getContainer(node) {
  return domQuery('div[data-list-entry-container]', node);
}

function createInputRowTemplate(dataTypes, properties, canRemove) {
  let template = TABLE_ROW_DIV_SNIPPET;
  template += createInputTemplate(dataTypes, properties, canRemove);
  template += canRemove ? DELETE_ROW_BUTTON_SNIPPET : '';
  template += '</div>';

  return template;
}

function createInputTemplate(dataTypes, properties, canRemove) {
  let columns = properties.length;
  let template = '';
  properties.forEach(function(prop, idx) {

    if (prop === 'type') {
      template += '<select class="bpp-table-row-columns-' + columns + ' ' +
        (canRemove ? 'bpp-table-row-removable' : '') + '" ' +
        'id="camunda-table-row-cell-input-value-' + idx + '" ' +
        'name="' + escapeHTML(prop) + '"' +
        ' data-value>';
      dataTypes.map(option => {
        template +=
          '<option value="' + escapeHTML(option.value) + '">' +
            escapeHTML(option.name) +
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

export default function(translate, group, element, data, dataTypes) {

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
      addElement: function(el, _node) {
        data.addDataElement(el);
        return [];
      },
      getElements: function(el, _node) {
        let dataMap = data.getDataElements(el);
        if (!dataMap || dataMap.length === 0) {
          return [];
        }
        let result = [];
        for (let value of dataMap.values()) {
          result.push(value);
        }
        return result;
      },
      updateElement: function(el, value, node, idx) {
        data.updateDataElement(el, value, idx);
        return [];
      },
      removeElement: function(el, node, idx) {
        data.removeDataElement(el, idx);
        return [];
      }

      // TODO: Validation
    });

    // Need to rewrite addElement and createListEntryTemplate (and, of course createInputRowTemplate, to create data type select)
    tableEntry.addElement = function(el, node, _event, _scopeNode) {
      let template = domify(createInputRowTemplate(dataTypes, modelProperties, canRemove));

      let container = getContainer(node);
      container.appendChild(template);

      this.__action = {
        id: 'add-element'
      };

      return true;
    };
    tableEntry.createListEntryTemplate = function() {
      return createInputRowTemplate(dataTypes, modelProperties, canRemove);
    };

    group.entries.push(tableEntry);
  }
}
