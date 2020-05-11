const LynxariDevice = require(process.lynxari.device);
const device = require('./mqtt_driver');

module.exports = class Mqtt extends LynxariDevice {
    
    constructor(config) {
        
        const hardware = new device(config);
        
        super(hardware, config);

        // Update any new message straight away to the super class method pushValueUpdate
        hardware.on('received', (topic, message) => {
            this.pushValueUpdate(topic, message);
        });

        this.hardware = hardware;
    }

    addMonitoredProperties(config) {
        // Add mqtt streams to the properties already registered to be monitored

        config.monitors.forEach(property => {
            config.stream(property+"_mqtt", this.publishToStream);
        });
    }

    publishToStream(stream) {
        const streamNameRegEx = /\w+_mqtt$/;
        const streamName = stream.queueName.match(streamNameRegEx)[0];

        this.hardware.on('received', (topic, message) => {
            if (streamName === topic+"_mqtt") {
                stream.write(message);
            }
        });
    }
    
    _mostSpecificTopic(topic) {
        const arr = topic.split('/');
        return arr[arr.length-1];
    }
}

