export default class Data {

  constructor(eventBus) {
    this._data = [];

    eventBus.on('import.done', () => {
      this._data = [];
    });

    // TODO: Sicuramente risponderà a eventi di SCOPE per ritornare i dati
  }

  addDataElement(element) {

    let dataObject = this.getDataElements(element);
    if (dataObject.length > 0) {
      let map = dataObject[0];
      map.set('');
    } else {
      this._data.push({ element, data: new Map() });
    }
  }

  getDataElements(element) {
    return this._data.filter(dataObject => dataObject.element.id === element.id).map(dataObject => dataObject.data);
  }

  updateDataElement(element, value, index) {
    let dataObject = this.getDataElements(element);
    if (dataObject.length === 0) {
      return;
    }
    let map = dataObject[0];
    let keyMap = Array.from(map.keys())[index];
    map.delete(keyMap);
    map.set(value['name'], value['value']);
  }

}

Data.$inject = ['eventBus'];