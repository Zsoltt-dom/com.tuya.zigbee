"use strict";

const { ZigBeeDevice } = require("homey-zigbeedriver");

class smart_remote_1b extends ZigBeeDevice {
  async onNodeInit({ zclNode }) {
    this.printNode();

    const node = await this.homey.zigbee.getNode(this);
    node.handleFrame = (endpointId, clusterId, frame, meta) => {
      if (clusterId === 6) {
        this.log(
          "endpointId:",
          endpointId,
          ", clusterId:",
          clusterId,
          ", frame:",
          frame,
          ", meta:",
          meta
        );
        frame = frame.toJSON()
        this.log("Frame JSON data:", frame);
        this.debouncemtr( this.buttonCommandParser(frame));
      }
    };

    this._buttonPressedTriggerDevice = this.homey.flow
      .getDeviceTriggerCard("smart_remote_1_button")
      .registerRunListener(async (args, state) => {
        return null, args.action === state.action;
      });
  }
  debouncemtr(func, timeout = 700){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }
  buttonCommandParser(frame) {
    let action = 'oneClick'
    //sometimes frame.data has 3 properties, and sometimes 4
    if ( frame.data.length === 3 ){
      action = frame.data[3] === 4 ? "trippleClicks" : frame.data[2] === 1 ? "oneClick" : "twoClicks";
    }else{
      action = frame.data[3] === 4 ? "trippleClicks" : frame.data[3] === 0 ? "oneClick" : "twoClicks";
    }
    return this._buttonPressedTriggerDevice
      .trigger(this, {}, { action: `${action}` })
      .then(() => this.log(`Triggered 1 button Smart Remote, action=${action}`))
      .catch((err) => this.error("Error triggering 1 button Smart Remote", err));
  }

  onDeleted() {
    this.log("1 button Smart Remote Controller has been removed");
  }
}

module.exports = smart_remote_1b;
