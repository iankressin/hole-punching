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

  sendPacket(message, SERVER_PORT, SERVER_ADDRESS, err =>
    console.log(("Error: ", err))
  );
};

const sendPacket = (message, port, address, cb) => {
  const data = JSON.stringify(message);
  udpSocket.send(data, 0, data.length, port, address, cb);
};

udpSocket.on("message", (data, info) => {
  const message = JSON.parse(data.toString());
  console.log(message);

  if (message.action === "newPeer") {
    connections.push(message.client);

    sendPacket(
      "Hey new one",
      message.client.port,
      message.client.address,
      err => console.log(err)
    );
  } else if (message.action === "peers") {
    connections.push(...message.peers);
  } else {
    // TODO: Display the actual messages
  }
});

udpSocket.bind();

connect();
