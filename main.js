'use strict';
const MulticastConnection = require('./multicast-connection');
const NodeFinder = require('./node-finder');

var address = '239.255.255.250';
var port = 6024;

function connect (connection, object, type) {
    object.sendMessage = (msg) => { connection.sendObject({ type: type, payload: msg}); };
    connection.handlers[type] = (msg, rinfo) => { object.recvMessage(msg, rinfo); };
}

var mconn = new MulticastConnection(address, port);
var nodefinder = new NodeFinder();
connect(mconn, nodefinder, "node-finder");

setInterval(showNodes, 6000);

function showNodes () {
    var nodes = nodefinder.listNodes();
    console.log("Known nodes: %d", Object.keys(nodes).length);
    for (var key in nodes) {
        console.log("    %s: %s", key, nodes[key]);
    }
}

