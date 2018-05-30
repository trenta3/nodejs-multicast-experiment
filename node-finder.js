'use strict';
const uuidv4 = require('uuid/v4');
const TimedStore = require('./timed-store');

module.exports = class NodeFinder {
    constructor (heartbeat = 5000) {
        this.uuid = uuidv4();
        this.knownNodes = new TimedStore();
        this.heartbeat = heartbeat;
        
        var self = this;
        setInterval(() => { self.iamhere(); }, this.heartbeat);
    }

    iamhere () {
        this.sendMessage({ uuid: this.uuid });
    }

    recvMessage (msg, rinfo) {
        this.knownNodes.setk(msg.uuid, rinfo.address + ":" + rinfo.port.toString(), this.heartbeat * 2);
    }

    listNodes () {
        return this.knownNodes.getDict();
    }
}

