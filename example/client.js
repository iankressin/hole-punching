const dgram = require("dgram");

const port = process.argv[2];

const socket = dgram.createSocket("udp4");
socket.bind(port);

socket.on("message", function (message, info) {
  console.log("Hey Ive got something");
  console.log(message.toString());
});

if (process.argv[3] === "sender") {
  console.log("Sending...");
  socket.send("Hi", 0, 2, 9000, "127.0.0.1");
}
