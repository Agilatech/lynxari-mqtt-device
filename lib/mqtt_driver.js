const mqtt = require('async-mqtt');
const EventEmitter = require('events');

module.exports = class Mqtt extends EventEmitter {
    constructor(options) {

        let opts = options || {};

        super();

        this.device = {};
        this.device.name     = (opts.hasOwnProperty('name'))     ? opts.name     : 'MQTT_DEV';
        this.device.type     = (opts.hasOwnProperty('type'))     ? opts.type     : 'mqtt';
        this.device.url      = (opts.hasOwnProperty('url'))      ? opts.url      : undefined;
        this.device.topic    = (opts.hasOwnProperty('topic'))    ? opts.topic    : undefined;
        this.device.clientId = (opts.hasOwnProperty('clientId')) ? opts.clientId : this._genClientId();
        this.device.client = undefined;
        this.device.active = false;
        this.device.version = require('../package.json').version;
        this.device.parameters = [];

        const topicArr = Array.isArray(this.device.topic) ? this.device.topic : [this.device.topic];

        topicArr.forEach(topic => {
            this.device.parameters.push({ name: this._mostSpecificTopic(topic), type: 'string', value: undefined});
        });

        this._initialize().then(() => {
            this.device.active = true;
            this.emit('active');

            this.device.client.on('error', error => {
                this._logError(error);
            });
    
            this.device.client.on('message', (topic, message) => {
                this._saveMessage(this._mostSpecificTopic(topic), message.toString());
            });
        }).catch((err) => {
            this._logError(err);
            this.emit('inactive');
        });

    }

    deviceName() {
        return this.device.name;
    }

    deviceType() {
        return this.device.type;
    }

    deviceVersion() {
        return this.device.version;
    }

    deviceNumValues() {
        return this.device.parameters.length;
    }

    typeAtIndex(idx) {
        if (this._isIdxInRange(idx)) {
            return this.device.parameters[idx].type;
        }
    }

    nameAtIndex(idx) {
        if (this._isIdxInRange(idx)) {
            return this.device.parameters[idx].name;
        }
    }

    qosAtIndex(idx) {
        if (this._isIdxInRange(idx)) {
            return this.device.parameters[idx].qos;
        }
    }

    deviceActive() {
        return this.device.active;
    }

    valueAtIndex(idx, callback) {
        if (!this._isIdxInRange(idx)) {
            callback(`Mqtt Error: index ${idx} out of range`, null);
            return;
        }

        // There's no polling or fetching of a device value... just give back the last message
        callback(null, this.device.parameters[idx].value);
    }

    indexOfTopic(topic) {
        return this.device.parameters.findIndex(element => element.name === topic );
    }

    _initialize() {
        return new Promise(async (resolve, reject) => {
            if (!this.device.url) {
                reject('URL was not supplied');
            }
            else if (!this.device.topic) {
                reject('topic was not supplied');
            }

            try {
                this.device.client = await mqtt.connectAsync(this.device.url);
            }
            catch (err) {
                reject(err);
            }

            try {
                const granted = await this.device.client.subscribe(this.device.topic);
                granted.forEach(subs => {
                    const param = this.device.parameters.find(element => element.name === this._mostSpecificTopic(subs.topic) );
                    param.qos = subs.qos;
                });
            }
            catch (err) {
                reject(err);
            }

            resolve();
        });
    }

    _saveMessage(topic, message) {
        const param = this.device.parameters.find(element => element.name === topic );
        param.value = message;
        this.emit('received', topic, message);
    }

    _mostSpecificTopic(topic) {
        const arr = topic.split('/');
        return arr[arr.length-1];
    }

    _logError(err) {
        console.error(`${this.device.name} ERROR: ${err}`);
        return false;
    }

    _isIdxInRange(idx) {
        if ((idx < 0) || (idx >= this.device.parameters.length)) {
            return false;
        }
        return true;
    }

    _genClientId() {
        // generates id AGT + random number between 1000 and 9999
        return  'AGT' + Math.round(Math.random() * (9999 - 1000) + 1000);
    }
}