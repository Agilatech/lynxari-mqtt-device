const config = require('./config');
const Scout = require(process.lynxari.scout);
const MqttDevice = require('./lib/mqtt_device');

module.exports = class MqttScout extends Scout {

  constructor(opts) {

    super();

    if (typeof opts !== 'undefined') {
      // copy all config options defined in the server
      for (const key in opts) {
        if (typeof opts[key] !== 'undefined') {
          config[key] = opts[key];
        }
      }
    }

    if (config.name === undefined) { config.name = "MQTT" }
    this.name = config.name;

    this.mqtt = new MqttDevice(config);

  }

  init(next) {
    const query = this.server.where({name: this.name});
  
    this.server.find(query, (err, results) => {
      if (!err) {
        if (results[0]) {
          this.provision(results[0], this.mqtt);
          this.server.info('Provisioned known device ' + this.name);
        } else {
          this.discover(this.mqtt);
          this.server.info('Discovered new device ' + this.name);
        }
      }
      else {
        this.server.error(err);
      }
    });

    next();
  }

}
