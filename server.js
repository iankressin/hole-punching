const dgram = require("dgram");
const mininet = require("mininet/host");

const PORT = 3601;
const socket = dgram.createSocket("udp4");

const peers = [];

socket.on("listening", () => {
  mininet("listening");
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

    // Send to the new peer, the hole list of peers already connected
    sendPacket({ peers, action: "server::swarm" }, port, address);

    broadcastNewPeer(client);

    saveClientConnection(client);
  }
};

// When a new peer is trying to connect, send to it all
// the nodes in the network
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
