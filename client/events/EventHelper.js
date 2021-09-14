export const SET_DATA_EDITABLE_EVENT = 'tokenSimulation.data.setEditable';
export const SET_DATA_NOT_EDITABLE_EVENT = 'tokenSimulation.data.unsetEditable';
export const UPDATED_DATA_EVENT = 'tokenSimulation.data.update';

export const TOGGLE_DATA_SIMULATION_EVENT = 'tokenSimulation.data.toggle';

export const CODE_EDITOR_PLUGIN_PRESENT_EVENT = 'codeEditor.init';
export const RUN_CODE_EVALUATION_EVENT = 'codeEditor.run';
export const GET_DATA_TYPES_EVENT = 'codeEditor.getTypes';

const eventTypes = {
  TOGGLE_DATA_SIMULATION_EVENT,
  SET_DATA_EDITABLE_EVENT,
  SET_DATA_NOT_EDITABLE_EVENT,
  UPDATED_DATA_EVENT,

  CODE_EDITOR_PLUGIN_PRESENT_EVENT,
  RUN_CODE_EVALUATION_EVENT,
  GET_DATA_TYPES_EVENT

};

const LOW_PRIORITY = 499;
const DEFAULT_PRIORITY = 1000;
const MID_HIGH_PRIORITY = 6000;
const HIGH_PRIORITY = 10001;

export default eventTypes;

export {
  LOW_PRIORITY,
  DEFAULT_PRIORITY,
  MID_HIGH_PRIORITY,
  HIGH_PRIORITY
};