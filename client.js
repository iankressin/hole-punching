// TODO: Solve message not beeing send from server to clients
// TODO: Clients are not messaging each other
const net = require("net");
const dgram = require("dgram");

const servers = {
  local: "127.0.0.1",
  server: "198.58.122.111",
  mobile: "177.79.105.48"
};

const udpSocket = dgram.createSocket("udp4");
const server = process.argv[3];

const client = {
  name: process.argv[2]
};

const connections = [];

const SERVER_ADDRESS = servers[server];
console.log(SERVER_ADDRESS);
const SERVER_PORT = 3601;

const connect = () => {
  const message = {
    client,
    action: "connect"
  };

  sendPacket(message, SERVER_PORT, SERVER_ADDRESS, err =>
    console.log(("Error: ", err))
  );
};

const sendPacket = (message, port, address, cb) => {
  console.log("OUT: ", message);

  const data = JSON.stringify(message);
  udpSocket.send(data, 0, data.length, port, address, cb);
};

udpSocket.on("message", (data, info) => {
  const message = JSON.parse(data.toString());
  console.log("IN: ", message);

  if (message.action === "newPeer") {
    connections.push(message.client);

    sendPacket(
      "Hey new one",
      message.client.port,
      message.client.address,
      err => console.log(err)
    );
  } else if (message.action === "peers") {
    message.peers.map(peer => {
      sendPacket("Im new here", peer.port, peer.address, err =>
        console.log(err)
      );
    });

    connections.push(...message.peers);
  } else {
    // TODO: Display the actual messages
  }
});

udpSocket.bind();

process.stdin.on("data", data => {
  const message = data.toString().trim();

  const packetContent = {
    action: "message",
    message
  };

  connections.map(peer => {
    sendPacket(packetContent, peer.port, peer.address, err => console.log(err));
  });
});

connect();
