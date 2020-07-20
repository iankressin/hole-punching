const dgram = require("dgram");

const PORT = 3601;
const socket = dgram.createSocket("udp4");

const peers = [];

socket.on("listening", () => {
  console.log(socket.address());
});

socket.on("message", (data, info) => {
  const parsedData = JSON.parse(data.toString());

  handleIncomingMessage(parsedData, info);
});

const handleIncomingMessage = (data, info) => {
  if (data.action === "connect") {
    const { port, address } = info;
    const client = { name: data.client.name, port, address };

    // When a new peer is trying to connect, send to it all
    // the nodes in the network
    sendPacket({ peers, action: "server::announceMe" }, port, address);

    broadcastNewPeer(client);

    saveClientConnection(client);
  }
};

const broadcastNewPeer = client => {
  peers.forEach(peer =>
    sendPacket({ client, action: "server::newPeer" }, peer.port, peer.address)
  );
};

const saveClientConnection = client => {
  peers.push(client);
};

const sendPacket = (message, port, address) => {
  const data = JSON.stringify(message);
  socket.send(data, 0, data.length, port, address);
};

socket.bind(PORT);
