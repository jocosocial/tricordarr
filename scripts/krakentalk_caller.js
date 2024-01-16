#!/usr/bin/env node

const ReconnectingWebSocket = require('reconnecting-websocket');
const WebSocket = require('ws');

if (process.argv.length !== 5) {
  console.error('Usage: node krakentalk_caller.js <server_url> <token> <callee_id>');
  process.exit(1); // Exit with an error code
}

// Extract the command line arguments
const serverUrl = process.argv[2];
const token = process.argv[3];
const calleeID = process.argv[4];

const authHeaders = {
  authorization: `Bearer ${token}`,
};
const callID = 'DCB94249-4562-493D-964C-C3E733FBD5D3';

const wsUrl = `${serverUrl}/api/v3/phone/socket/initiate/${callID}/to/${calleeID}`;
console.log(wsUrl);

function WebSocketConstructor(options) {
  return class extends WebSocket {
    constructor(url, protocols) {
      super(url, protocols, options);
    }
  };
}

const socket = new ReconnectingWebSocket(wsUrl, [], {
  WebSocket: WebSocketConstructor({
    headers: authHeaders,
  }),
  connectionTimeout: 10000,
  maxRetries: 20,
  minReconnectionDelay: 10000,
  maxReconnectionDelay: 30000,
  reconnectionDelayGrowFactor: 2,
});

socket.addEventListener('open', event => {
  console.log('Socket Open');
});

socket.addEventListener('close', event => {
  console.log('Socket Close');
});

socket.addEventListener('message', event => {
  console.log('Message');
  console.log(event);
});

console.log(socket.readyState);
