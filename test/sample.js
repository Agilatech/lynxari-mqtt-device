
const driver = require('../lib/mqtt_driver');

const virtualDevice = new driver({url: 'mqtt://test.mosquitto.org', topic: ['agt/live', 'agt/test']});

console.log(`Created MQTT client with ClientID = ${virtualDevice.device.clientId}`);

virtualDevice.on('active', () => {
    sendMessage('agt/test', 'Test 1');
    sendMessage('agt/live', 'Test 2');
});

virtualDevice.on('received', (topic, message) => {
    console.log(`Incomming ${topic}:${message}`);
    const index = virtualDevice.indexOfTopic(topic);
    virtualDevice.valueAtIndex(index, (err, val) => {
        if (err) {
            console.log(`valueAtIndex error ${err}`);
            console.log(virtualDevice.device.parameters);
        }
        else {
            if (val == message) {
                console.log('Message was sucessfully received');
            }
            else {
                console.log(`ERROR: Topic ${virtualDevice.nameAtIndex(index)} has value ${val}`);
            }
        }
    });
    console.log(virtualDevice.device.parameters);
});

virtualDevice.on('inactive', () => {
    console.log(`Failed to initialize`);
    process.exit(1);
});

function sendMessage(topic, message) {
    virtualDevice.device.client.publish(topic, message, (err) => {
        if (!err) {
            console.log(`Published ${topic}:${message}`);
        }
        else {
            console.log(`Publish error ${err}`);
        }
    });
}
