const net = require("net");
const dgram = require("dgram");

const udpSocket = dgram.createSocket("udp4");

const client = {
  name: process.argv[2]
};

const connections = [];

const SERVER_ADDRESS = "0.0.0.0";
const SERVER_PORT = 3601;

const connect = () => {
  const message = {
    client,
    action: "connect"
  };

  sendPacket(message, err => console.log(("Error: ", err)));
};

const sendPacket = (message, cb) => {
  const data = JSON.stringify(message);
  udpSocket.send(data, 0, data.length, SERVER_PORT, SERVER_ADDRESS, cb);
};

udpSocket.on("message", (data, info) => {
  const message = JSON.parse(data.toString());
  console.log(message);

  if (message.action === "newPeer") {
    connections.push(message.client);
    console.log(message.client.port);

    sendPacket("Hey new one", message.client.port, message.client.address);
  } else if (message.action === "peers") {
    connections.push(...message.peers);
  } else {
  }
});

udpSocket.bind();

connect();
