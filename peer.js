const net = require("net");
const dgram = require("dgram");
const events = require("./events");

class UdpServer {
  SERVER_ADDRESS = "198.58.122.111";
  // SERVER_ADDRESS = "127.0.0.1";
  SERVER_PORT = 3601;

  client = { name: "" };
  udpSocket;
  connections = [];
  unfinishedConnections = [];

  constructor() {
    this.udpSocket = dgram.createSocket("udp4");
    this.udpSocket.bind();

    this.registerLocalEvents();
    this.registerUpdSocketEvents();
    this.sendKeepAlive();
  }

  connectToServer = () => {
    const message = { client: this.client, action: "connect" };

    this.sendPacket(message, this.SERVER_PORT, this.SERVER_ADDRESS, error =>
      console.error("Error >>> ", error)
    );
  };

  sendKeepAlive = () => {
    setInterval(() => {
      this.connections.forEach(peer => {
        this.sendPacket(
          { message: "remote::keep" },
          peer.port,
          peer.address,
          error => console.log("Error: ", error)
        );
      });
    }, 5000);
  };

  registerEvents = () => {
    registerUpdSocketEvents();
    registerLocalEvents();
  };

  registerUpdSocketEvents = () => {
    this.udpSocket.on("message", (data, info) => {
      const message = JSON.parse(data.toString());
      console.log("In    >>> ", message);

      switch (message.action) {
        case "server::newPeer":
          this.handleNewPeer(message);
          break;
        case "server::swarm":
          this.handleNewSwarm(message);
          break;
        case "remote::newMessage":
          this.handleNewMessage(message);
          break;
        case "remote::announcing":
          this.handleConnection(message);
          break;
        case "remote::punchingHole":
          setTimeout(
            () =>
              this.sendPacket(
                "remote::punchingHole",
                message.client.port,
                message.client.address,
                err => console.log("Err: ", err)
              ),
            4000
          );
          break;
        case "remote::session":
          this.sendPacket(
            { action: "remote::opened" },
            info.port,
            info.address,
            err => console.log("Error: ", err)
          );
          break;
      }
    });
  };

  handleNewPeer = message => {
    this.connections.push(message.client);
    setTimeout(
      () =>
        this.sendPacket(
          { action: "remote::session" },
          message.client.port,
          message.client.address,
          err => console.log("Err: ", err)
        ),
      4000
    );
  };

  handleNewSwarm = message => {
    console.log("Message", message);
    this.connections = message.peers;
    console.log("Connections >>> ", this.connections, message.peers);

    this.connections.forEach(peer =>
      this.sendPacket(
        "remote::punchingHole".toString(2),
        peer.port,
        peer.address,
        error => {
          console.log("Error >>> ", error);
        }
      )
    );
  };

  handleNewMessage = message => {
    events.emit("remote::message", { message });
  };

  handleConnection = message => {
    this.sendPacket(
      "remote::connection".toString(2),
      message.client.port,
      message.client.address,
      error => {
        console.log("Error >>> ", error);
      }
    );
  };

  registerLocalEvents = () => {
    events.on("local::message", data => {
      const packetContent = {
        action: "remote::newMessage",
        peer: this.client,
        content: data.message
      };

      console.log(this.connections.length);

      this.connections.map(peer => {
        this.sendPacket(packetContent, peer.port, peer.address, error =>
          console.log(error)
        );
      });
    });
  };

  sendPacket = (message, port, address, cb) => {
    console.log("Out   >>> ", message, port, address);

    const data = JSON.stringify(message);

    const dataBuffer = new Buffer(data, "utf-8");

    this.udpSocket.send(dataBuffer, 0, data.length, port, address, cb);
  };
}

new UdpServer().connectToServer();

module.exports = UdpServer;
