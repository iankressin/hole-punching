const mininet = require("mininet")();

const _switch = mininet.createSwitch();

const server = mininet.createHost();
const peer1 = mininet.createHost();
const peer2 = mininet.createHost();

server.link(_switch);
peer1.link(_switch);
peer2.link(_switch);

mininet.start();

const proc = server.spawn("node server.js");

proc.on("message:listening", () => {
  const proc2 = peer1.spawn("node peer.js");

  const proc3 = peer2.spawn("node peer.js");
});
