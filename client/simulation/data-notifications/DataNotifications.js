/**
 * @license ElementNotifications.js
 * Copyright 2017 bpmn.io
 * SPDX-License-Identifier: MIT
 */

import { domify } from 'min-dom';

import { RESET_SIMULATION_EVENT, TOGGLE_MODE_EVENT } from 'bpmn-js-token-simulation/lib/util/EventHelper';

const OFFSET_TOP = -15;
const OFFSET_LEFT = 15;

export default function DataNotifications(overlays, eventBus) {
  this._overlays = overlays;

  eventBus.on([
    RESET_SIMULATION_EVENT,
    TOGGLE_MODE_EVENT
  ], () => {
    this.clear();
  });
}

DataNotifications.prototype.addElementNotification = function(element, options) {
  const position = {
    top: OFFSET_TOP,
    left: OFFSET_LEFT
  };

  const {
    type,
    icon,
    text,
  } = options;

  const html = domify(`
    <div class="data-notification ${ type || '' }">
      ${ icon ? `<i class="fa ${ icon }"></i>` : '' }
      <span class="text">${ text }</span>
    </div>
  `);

  this._overlays.add(element, 'data-notification', {
    position: position,
    html: html,
    show: {
      minZoom: 0.5
    }
  });
};

DataNotifications.prototype.clear = function() {
  this._overlays.remove({ type: 'data-notification' });
};

DataNotifications.prototype.removeElementNotification = function(element) {
  this._overlays.remove({ element: element });
};

DataNotifications.$inject = [ 'overlays', 'eventBus' ];