import { SelectEntry, TextFieldEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function DataElementProps(props) {

  const {
    idPrefix,
    element,
    dataElement,
    dataTypes,
    index
  } = props;

  return [
    {
      id: idPrefix + 'name',
      component: Name,
      idPrefix,
      element,
      dataElement,
      index
    },
    {
      id: idPrefix + 'type',
      component: Type,
      idPrefix,
      element,
      dataElement,
      dataTypes,
      index
    },
    {
      id: idPrefix + 'value',
      component: Value,
      idPrefix,
      element,
      dataElement,
      index
    } ];
}

function Name(props) {
  const { id, element, dataElement, index } = props;

  const data = useService('dataTokenSimulation');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = (dEl) => {
    return dEl.name;
  };

  const setValue = (value) => {

    dataElement['name'] = value;

    data.updateDataElement(element, dataElement, index);
  };

  return TextFieldEntry({
    element: dataElement,
    id: id,
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function Type(props) {
  const { id, element, dataElement, dataTypes, index } = props;

  const data = useService('dataTokenSimulation');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = (dEl) => {
    return dEl.type;
  };

  const setValue = (value) => {
    dataElement['type'] = value;

    data.updateDataElement(element, dataElement, index);
  };

  return SelectEntry({
    element: dataElement,
    id: id,
    label: translate('Type'),
    getOptions() {
      return dataTypes.map(type => {
        return {
          value: type.value,
          label: type.name
        };
      });
    },
    getValue,
    setValue,
    debounce
  });
}

function Value(props) {
  const { id, element, dataElement, index } = props;

  const data = useService('dataTokenSimulation');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = (dEl) => {
    return dEl.value;
  };

  const setValue = (value) => {
    dataElement['value'] = value;

    data.updateDataElement(element, dataElement, index);
  };

  return TextFieldEntry({
    element: dataElement,
    id: id,
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}