/**
 * Returns the data simulation list of variables
 * @param element
 * @param injector
 * @returns {*[]}
 */
import DataElementProps from './DataElementProps';

export default function DataProps({ element, injector, dataTypes }) {

  const data = injector.get('dataTokenSimulation');
  const eventBus = injector.get('eventBus');
  let dataMap = data.getDataElements(element);
  const items = [];
  if (dataMap) {

    let index = 0;
    for (const dataElement of dataMap.values()) {
      const id = element.id + '-dataElement-' + index;

      items.push({
        id,
        label: dataElement.name || '', // ???
        entries: DataElementProps({
          idPrefix: id + '-',
          element,
          dataElement,
          dataTypes,
          index: index
        }),
        autoFocusEntry: id + '-name',
        remove: removeFactory({ element, data, index, eventBus })
      });
      index++;
    }
  }

  return {
    items,
    add: addFactory({ element, data, eventBus }),
    shouldSort: false
  };
}

function addFactory({ element, data, eventBus }) {
  return function(event) {
    event.stopPropagation();

    data.addDataElement(element);
    eventBus.fire('propertiesPanel.providersChanged');
  };
}

function removeFactory({ element, data, index, eventBus }) {
  return function(event) {
    event.stopPropagation();

    data.removeDataElement(element, index);
    eventBus.fire('propertiesPanel.providersChanged');
  };
}
