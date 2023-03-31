'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
// const { CLUSTER } = require('zigbee-clusters');
let debounce=0;
class wall_remote_3_gang extends ZigBeeDevice {

    async onNodeInit({zclNode}) {

        //var debounce = 0;
        this.printNode();

        const node = await this.homey.zigbee.getNode(this);
        node.handleFrame = (endpointId, clusterId, frame, meta) => {
          if (clusterId === 6) {
            this.log("endpointId:", endpointId,", clusterId:", clusterId,", frame:", frame, ", meta:", meta);
            this.log("Frame JSON data:", frame.toJSON());
            frame = frame.toJSON();
            debounce +=1;
            setTimeout(debouncetmr, 1000);
            this.log("Debounce: ", debounce);
            if (debounce===1){
              this.buttonCommandParser(endpointId, frame);
            } else {
              debounce=0;
            }
            function debouncetmr() {
              debounce=0;
            }
          }
        };
  
        this._buttonPressedTriggerDevice = this.homey.flow.getDeviceTriggerCard('wall_remote_3_gang_buttons')
        .registerRunListener(async (args, state) => {
          return (null, args.action === state.action);
        });
      
    }
  
      buttonCommandParser(ep, frame) {
        var button = ep === 1 ? 'left' : ep === 3 ? 'right' : 'center';
        var action = frame.data[3] === 0 ? 'oneClick' : 'twoClicks';
        return this._buttonPressedTriggerDevice.trigger(this, {}, { action: `${button}-${action}` })
        .then(() => this.log(`Triggered Wall Remote 3 Gang, action=${button}-${action}`))
        .catch(err => this.error('Error triggering Wall Remote 3 Gang', err));
      }


    onDeleted(){
		this.log("3 Gang Wall Remote removed")
	}

}

module.exports = wall_remote_3_gang;


