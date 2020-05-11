![Lynxari IoT Platform](https://agilatech.com/images/lynxari/lynxari200x60.png) **IoT Platform**
## Lynxari MQTT Virtual Device Driver

This device driver is specifically designed to be used with the Agilatech® Lynxari IoT Platform.
Please see [agilatech.com](https://agilatech.com/software) to download a copy of the system. 

### Install
```
$> npm install @agilatech/lynxari-mqtt-device
```
Install in the same directory in which lynxari is installed.

### Design

This device driver is designed to provide an interface to a MQTT subscription as if it were a physical device. In this manner, any MQTT subscription may be easily integrated into the Lynxari ecosystem and acted upon like any other device.

Although Lynxari itself can run on most any operating system, this driver uses Linux-specific protocols, so it may not work directly or correctly on Windows.

### Usage
This device driver is designed to be consumed by the Agilatech® Lynxari IoT system.  As such, it is not really applicable or useful with other systems or in other environments.

To use it with Lynxari, insert its object definition as an element in the devices array in the _devlist.json_ file.

```
{
  "name": "MQTT",
  "module": "@agilatech/lynxari-mqtt-device",
  "options": {
    "streamPeriod": 0,
    "devicePoll": 43200000,
    "url": "mqtt://test.mosquitto.org",
    "topic": "agt/test",
    "clientId": "AGT_1234"
  }
}
```


#### Device config object
The device config object is an element in the devlist.json device configuration file, which is located in the Lynxari root directory.  It is used to tell the Lynxari system to load the device, as well as several operational parameters.

_name_ is simply the name given to the device.  This name can be used in queries and for other identifcation purposes.

_module_ is the name of the npm module. The module is expected to exist in this directory under the _node_modules_ directory.  If the module is not strictly an npm module, it must still be found under the node_modules directory.

_options_ is an object within the device config object which defines all other operational parameters.  In general, any parameters may be defined in this options object, and most modules will have many several.  The three which are a part of every Lynxari device are 'devicePoll', 'streamPeriod', and 'deltaPercent'. For the mqtt module, the parameters 'url' and 'topic' *must* be defined, and optionally 'clientId' may be defined.  Finally, all parameter values can have a range defined by specifying '<parameter>\_range'.


```
"devicePoll":<period>
    Period in milliseconds in which device will be polled. Since an MQTT subscription _pushes_ values rather than _pulls_ them, this parameter is not very useful. Set it to a very long time period so that polling will occur very infrequently.

"streamPeriod":<period>
    Period in milliseconds for broadcast of streaming values. Since an MQTT subscription _pushes_ values rather than _pulls_ them, this parameter is also not very useful, so it is typically set to 0 to disable streaming.

"deltaPercent":<percent>
    Percent of the data range which must be exceeded (delta) to qualify as "new" data for polled data. Not relevant in this application for the same reasons as above.

"url":<url>
    The URL of the MQTT broker. The URL can be on the following protocols: 'mqtt', 'mqtts', 'tcp', 'tls', 'ws', 'wss'.

"topic":<mqtt topic> | [<mqtt topics>]
    The topic or topics for which to subscribe. Multiple topics may be specified as an array of topics.

"clientId":<id>
    A string defining the client ID to be supplied to the broker. Defaults to "AGT"<4 digit random number>.
```

#### Topics
A typical MQTT topic is given as strings separated by forward slashes '/', with the leftmost string being the most general, and the rightmost string being the most specific. Therefore for the topic 'aaa/bbb/ccc/xxx/yyy/zzz', 'zzz' is the most specific portion. The most common usage is to group topics in a hierarcy. 

For the purposes of this Lynxari module, the most specific portion of a topic is considered to be the parameter name. The preceding part of the topic is only used to subscribe to the stream from the broker. For example, if a broker is handling values from a BME280 sensor which supplies pressure, humidity, and temperature, it could be split into three separate topics which might look something like: 'agt/sensor/bme280/pressure', 'agt/sensor/bme280/humidity', and 'agt/sensor/bme280/temperature'.  If these three topics were supplied as an array for the 'topic' option parameter, then the virtual mqtt device would automatically contain value parameters for 'pressure', 'humidity', and 'temperature', and would be referenced as such. The portion of the topic 'agt/sensor/bme280/' is dropped for all parameter names.




#### module config 
Every module released by Agilatech includes configuration in a file named 'config.json' and we encourage any other publishers to follow the same pattern.  The parameters in this file are considered defaults, since they are overriden by definitions appearing in the options object of the Lynxari devlist.json file.

The construction of the config.json mirrors that of the options object, which is simply a JSON object with key/value pairs. Here is an example of an 'config.json' file which polls the device only once a day, and disables streaming:

```
{
    "devicePoll":86400000,
    "streamPeriod":0,
}
```

#### Default values
If not defined in either the devlist.json or the config.json files, the program uses the following default values:

* _streamPeriod_ : 10000 (10,000ms or 10 seconds)
* _devicePoll_ : 1000 (1,000ms or 1 second)
* _deltaPercent_ : 5 (polled values must exceed the range by &plusmn; 5%)


### Properties
All drivers contain the following 4 core properties:

1. **state** : the current state of the device, which is not applicable for this module.
2. **id** : the unique id for this device.  This device id is used to subscribe to this device streams.
3. **name** : the given name for this device. Defaults to 'MQTT_DEV'.
4. **type** : the given type category for this device,  (_mqtt_, _sensor_, etc) Defaults to 'mqtt'.

#### Monitored Properties
Because the messages (typically values) of a topic are pushed from the MQTT broker, the concept of scheduled polling and streaming do not make sense.  Instead, the topic parameter values are updated as they are received.

When a message is received from the broker, the monitored value is immediately updated without regard to any deltaPercent. Any manual value fetching will always retrieve the last value received from the broker.


#### Streaming Properties
All value paramters also have an associated stream, named _&lt;parameter&gt;\_mqtt_. 

Keeping with the example given above for the BME280, the streams would be named _pressure\_mqtt_, _humidity\_mqtt_, and _temperature\_mqtt_.


### State
This device driver has a binary state: __on__ or __off__. However, it is disregarded and not applicable for this module. Regardless of the state, parameter values will be updated and streams published upon the receipt of a message from the broker, and it is for this reason that the state has no bearing on the module operation.

  
### Transitions
Although the **turn-on** and **turn-off** transitions appear and will function, they are effectively useless due to the fact that state is ignored.  There are no other transistions for the module.

### Compatibility
This driver is designed to run within the Lynxari IoT platform.  While Lynxari will run on nearly any operating system, this driver employs UNIX-specific protocols and as such will run on the following operating systems:
* 32 or 64-bit Linux
* macOS and OS X
* SunOS
* AIX


### Copyright
Copyright © 2020 [Agilatech®](https://agilatech.com). All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

