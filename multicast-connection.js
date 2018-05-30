'use strict';
const udp = require('dgram');
const os = require('os');

function getIPS (type = 'IPv4') {
    var ifaces = os.networkInterfaces();
    var IPS = [];
    Object.keys(ifaces).forEach((ifname) => {
        ifaces[ifname].forEach((iface) => {
            if (type == iface.family && iface.internal == false)
                IPS.push(iface.address);
        });
    });
    return IPS;
}

module.exports = class MulticastConnection {
    constructor(maddress, mport, local_ip = undefined, type = 'udp4') {
        this.maddress = maddress;
        this.mport = mport;
        this.type = type;
        if (local_ip == undefined) {
            var itype = (type == 'udp4') ? 'IPv4' : 'IPv6';
            var local_ip = getIPS(itype)[0];
            console.info("Local IP autodetected as %s", local_ip);
        }
        this.local_ip = local_ip;
        this.handlers = {};

        // Creiamo un socket udp
        this.sock = udp.createSocket(type);
        this.sock.bind(mport, maddress);

        this.sock.on('error', (error) => {
            console.error('An error occured: ', error);
            this.sock.close();
        });

        this.sock.on('close', () => {
            console.info('Connection closed');
        });

        this.sock.on('listening', () => {
            this.sock.addMembership(maddress, local_ip);
            this.sock.setBroadcast(true);
            this.sock.setMulticastTTL(128);
            var adr = this.sock.address();
            console.info("UDP client listening on %s:%d", adr.address, adr.port);
        });

        this.sock.on('message', (objString, rinfo) => {
            var message = JSON.parse(objString);
            if (message.type == undefined) {
                console.error("A message has no type: %s from %s:%d", obj, rinfo.address, rinfo.port);
            } else {
                for (var type in this.handlers) {
                    if (message.type == type) {
                        this.handlers[type](message.payload, rinfo);
                        return;
                    }
                }
                console.error("No matching handler found for type %s", message.type);
            }
        });
    }
    
    sendObject (obj) {
        var objString = JSON.stringify(obj);
        this.sock.send(objString, 0, objString.length, this.mport, this.maddress);
    }
}

