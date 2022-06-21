/**
 * Returns the data simulation list of variables
 * @param element
 * @param injector
 * @returns {*[]}
 */
import DataElementProps from './DataElementProps';

export default function DataProps({ element, injector, dataTypes }) {

  const data = injector.get('dataTokenSimulation');
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
        remove: removeFactory({ element, data, index })
      });
      index++;
    }
  }
  return {
    items,
    add: addFactory({ items, element, data, dataTypes }),
    shouldSort: false
  };
}

function addFactory({ items, element, data, dataTypes }) {
  return function(event) {
    event.stopPropagation();

    data.addDataElement(element);
    const id = element.id + '-dataElement-' + items.length;

    items.push({
      id: id,
      label: '',
      entries: DataElementProps({
        idPrefix: id + '-',
        element,
        dataElement: {},
        dataTypes,
        index: items.length
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ element, data, index: items.length })
    })
  };
}

function removeFactory({ element, data, index }) {
  return function(event) {
    event.stopPropagation();

    data.removeDataElement(element, index);
  };
}
